// what is the best client for a webserver? :)
// designed for browser console only

const ws = new WebSocket("ws://localhost:8080")
ws.onmessage = event => console.log(event.data)

ws.send("Hi, this is a client.")
