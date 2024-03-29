package gateway

import (
	"container/heap"
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"nhooyr.io/websocket"
	"nhooyr.io/websocket/wsjson"
)

const (
	ProposeAction = "propose"
	AcceptAction  = "accept"
	CommitAction  = "commit"
	CloseAction   = "close"
)

type Request struct {
	value    uuid.UUID
	priority int64
	index    int
}

type RequestQueue []*Request

func (q RequestQueue) Len() int { return len(q) }

func (q RequestQueue) Less(i, j int) bool {
	return q[i].priority < q[j].priority
}

func (q RequestQueue) Swap(i, j int) {
	q[i], q[j] = q[j], q[i]
	q[i].index = i
	q[j].index = j
}

func (q *RequestQueue) Push(x any) {
	n := len(*q)
	item := x.(*Request)
	item.index = n
	*q = append(*q, item)
}

func (q *RequestQueue) Pop() any {
	old := *q
	n := len(old)
	item := old[n-1]
	old[n-1] = nil
	item.index = -1
	*q = old[0 : n-1]
	return item
}

type Synchronization struct {
	PriorityQueue RequestQueue
	Accepted      map[uuid.UUID]int
	Committed     map[uuid.UUID]bool
	CanCommit     map[uuid.UUID]bool
	QueueLock     sync.Mutex
	Gateways      int
}

func (g *Gateway) NewSynchronization() *Synchronization {
	sync := &Synchronization{
		PriorityQueue: make(RequestQueue, 0),
		Accepted:      make(map[uuid.UUID]int),
		Committed:     make(map[uuid.UUID]bool),
		CanCommit:     make(map[uuid.UUID]bool),
		QueueLock:     sync.Mutex{},
		Gateways:      0,
	}

	heap.Init(&sync.PriorityQueue)

	go g.handleActions()

	return sync
}

type Action struct {
	Proposer  string    `json:"proposer"`
	ActionId  uuid.UUID `json:"action_id"`
	Timestamp int64     `json:"timestamp"`
	Action    string    `json:"action"`
}

func (g *Gateway) handleActions() {
	for {
		if g.S.PriorityQueue.Len() > 0 {
			g.S.QueueLock.Lock()
			req := g.S.PriorityQueue[0]
			g.S.QueueLock.Unlock()

			if req.priority < g.GetTimestamp() {
				g.S.QueueLock.Lock()
				val := heap.Pop(&g.S.PriorityQueue)
				g.S.QueueLock.Unlock()
				g.acceptHandler(val.(*Request).value)
			}
		}
		time.Sleep(10 * time.Millisecond)
	}
}

func sendAction(c context.Context, gateway string, action Action) error {
	fmt.Println("Sending propose to", gateway)

	ctx, cancel := context.WithTimeout(c, 30*time.Second)

	defer cancel()

	websocketConn, _, err := websocket.Dial(ctx, "ws://"+gateway+":8080/sync", nil)

	if err != nil {
		fmt.Println("Failed to dial:", err)
		return err
	}

	defer websocketConn.Close(websocket.StatusInternalError, "connection error")

	err = wsjson.Write(ctx, websocketConn, action)

	if err != nil {
		fmt.Println("Failed to write propose:", err)
		return err
	}

	fmt.Println("Propose sent to", gateway)

	err = wsjson.Write(ctx, websocketConn, Action{Action: CloseAction})

	if err != nil {
		fmt.Println("Failed to send close:", err)
		return err
	}

	websocketConn.Close(websocket.StatusNormalClosure, "")

	return nil
}

func (g *Gateway) acceptReceiveHandler(accept Action) {
	fmt.Println("Received accept", accept, "from", accept.Proposer)

	g.S.QueueLock.Lock()
	defer g.S.QueueLock.Unlock()

	if _, ok := g.S.Accepted[accept.ActionId]; !ok {
		g.S.Accepted[accept.ActionId] = 1
	}

	g.S.Accepted[accept.ActionId] = g.S.Accepted[accept.ActionId] + 1
	fmt.Println("Accepted", accept.ActionId, "from", accept.Proposer, "total", g.S.Accepted[accept.ActionId], "of", g.S.Gateways)

	if g.S.Accepted[accept.ActionId] >= g.S.Gateways {
		g.S.CanCommit[accept.ActionId] = true
		fmt.Println("Can commit", accept.ActionId)
	}
}

func (g *Gateway) commitReceiveHandler(commit Action) {
	fmt.Println("Received commit", commit, "from", commit.Proposer)

	g.S.QueueLock.Lock()
	defer g.S.QueueLock.Unlock()

	for i, req := range g.S.PriorityQueue {
		if req.value == commit.ActionId {
			heap.Remove(&g.S.PriorityQueue, i)
			break
		}
	}

	g.S.Committed[commit.ActionId] = true
}

func (g *Gateway) proposalReceiveHandler(proposal Action) {
	fmt.Println("Received proposal", proposal, "from", proposal.Proposer)

	req := &Request{
		value:    proposal.ActionId,
		priority: proposal.Timestamp,
	}

	g.S.QueueLock.Lock()
	defer g.S.QueueLock.Unlock()

	heap.Push(&g.S.PriorityQueue, req)
}

func (g *Gateway) proposeHandler(c *gin.Context) (uuid.UUID, error) {
	currentTime := g.GetTimestamp()
	proposer := g.Name
	actionId := uuid.New()

	g.S.QueueLock.Lock()
	g.S.CanCommit[actionId] = false
	g.S.QueueLock.Unlock()

	// Propose to all other gateways
	for _, h := range g.config.Gateways {
		if h != g.Name {
			proposed := Action{
				Proposer:  proposer,
				ActionId:  actionId,
				Timestamp: currentTime,
				Action:    ProposeAction,
			}
			err := sendAction(c.Request.Context(), h, proposed)
			if err != nil {
				return uuid.Nil, err
			}
		}
	}

	return actionId, nil
}

func (g *Gateway) acceptHandler(actionId uuid.UUID) {
	proposer := g.Name

	// Accept to all other gateways
	for _, h := range g.config.Gateways {
		if h != g.Name {
			accept := Action{
				Proposer:  proposer,
				ActionId:  actionId,
				Timestamp: g.GetTimestamp(),
				Action:    AcceptAction,
			}
			sendAction(context.Background(), h, accept)
		}
	}
}

func (g *Gateway) commitHandler(c *gin.Context, actionId uuid.UUID) {
	proposer := g.Name

	// Commit to all other gateways
	for _, h := range g.config.Gateways {
		if h != g.Name {
			commit := Action{
				Proposer:  proposer,
				ActionId:  actionId,
				Timestamp: g.GetTimestamp(),
				Action:    CommitAction,
			}
			err := sendAction(c.Request.Context(), h, commit)
			if err != nil {
				c.JSON(500, gin.H{"error": err.Error()})
				return
			}
		}
	}

	g.S.QueueLock.Lock()
	defer g.S.QueueLock.Unlock()

	g.S.Committed[actionId] = true
}
