FROM golang:1.21

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . /app/

RUN go build -o /test-service .

CMD [ "/test-service" ]

EXPOSE 8080
