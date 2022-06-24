const http = require("http")
const {createClient} = require("redis")
const WebSocketServer = require("websocket").server


const APP_ID = process.env.APP_ID
const LIVE_CHAT_CHANNEL = 'livechat'

let connectionPool = []

const subscriber = createClient({
  url: "http://localhost:6379"
})
const publisher = createClient({
  url: "http://localhost:6379"
})

subscriber.on("subscribe", (channel, count) => {
  const subscriptionMessage = `Server "${APP_ID}" has subscribed successfully to the channel "${LIVE_CHAT_CHANNEL}"`
  console.info(subscriptionMessage)
  publisher.publish(LIVE_CHAT_CHANNEL, subscriptionMessage).catch(err => console.error(err))
})

subscriber.on("message", (channel, message) => {
  // when we receive a message we want to send it to all the subscribed clients
  try {
    console.info(`MESSAGE::Channel "${channel}": ${message}`)
    connectionPool.forEach(connection => {
      connection.send(`APP_ID: ${APP_ID} - ${message}`)
    })
  } catch (e) {
    console.error(e)
  }
})

// join to a channel
subscriber.subscribe(LIVE_CHAT_CHANNEL).catch(err => console.error(err))

// create a raw HTTP server
// this will help us create the TCP connection
// the TCP conn. will then pass to the websocket to do the job
const httpServer = http.createServer()

// pass the httpServer object to the WebSocketServer constructor,
// this should override the default HTTP server req/res behavior
const websocket = new WebSocketServer({
  "httpServer": httpServer
})

httpServer.listen(8080, () => {
  console.info(`Server ${APP_ID} listening at 8080`)
})

websocket.on("request", (request) => {
  const connection = request.accept(null, request.origin)
  connection.on("open", () => console.log("Opened!"))
  connection.on("close", () => console.log("CLOSED!"))
  connection.on("message", (message) => {
    console.info(`MESSAGE::${APP_ID}: ${message.utf8Data}`)
    // whenever we get a new message we publish it to the susbcribed channel
    // so that other clients can receive it too
    publisher.publish(LIVE_CHAT_CHANNEL, message.utf8Data)
  })

  setTimeout(() => connection.send(`Hello from the server ${APP_ID}.`), 1000)
  connectionPool.push(connection)
})
