FROM golang:1.21

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . /app/

COPY ./docker-services.json /app/services.json

RUN go build -o /gateway .

CMD [ "/gateway" ]

EXPOSE 8080
