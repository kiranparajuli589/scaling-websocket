const http = require("http")
const WebSocketServer = require("websocket").server

let connection

const httpServer = http.createServer((req, res) => {
  console.log(`Hey, we've received a request: ${req.toString()}`)
})

const websocket = new WebSocketServer({
  // the hand-sake part of the websocket protocol
  httpServer
})

function sendMessageOnEvery2Second() {
  setInterval(() => {
    if (connection) {
      connection.send("2 seconds have passed: " + new Date())
    }
  }, 2000)
}

websocket.on("request", (request) => {
  connection = request.accept(null, request.origin)

  connection.on("open", () => console.log("Opened!"))
  connection.on("close", () => console.log("CLOSED!"))
  connection.on("message", (message) => {
    console.log(message.utf8Data)
  })
  sendMessageOnEvery2Second()
})

httpServer.listen(8080, () => {
  console.log("Server listening on port 8080")
})
