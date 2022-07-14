import http from "http";
import ws from "websocket"
import redis from "redis";

const APP_ID = process.env.APP_ID;

const connections = [];
const WebSocketServer = ws.server
const CHANNEL_LIVE_CHAT = "livechat"

const subscriber = redis.createClient({
  port: 6379,
  host: 'redis'
});

const publisher = redis.createClient({
  port: 6379,
  host: 'redis'
});


subscriber.on("subscribe", function (channel, count) {
  const subscriptionMessage = `Server ${APP_ID} subscribed successfully to channel ${channel}`;
  publisher.publish(CHANNEL_LIVE_CHAT, subscriptionMessage);
});

subscriber.on("message", function (channel, message) {
  try {
    //when we receive a message I want to send it to all the clients
    console.info(`R_INCOMING_MESSAGE::${APP_ID}:: ${message}`);
    connections.forEach(c => c.send(APP_ID + ":" + message))

  } catch (err) {
    console.error(err)
  }
});


subscriber.subscribe(CHANNEL_LIVE_CHAT);


//create a raw http server (this will help us create the TCP which will then pass to the websocket to do the job)
const httpserver = http.createServer()

//pass the httpserver object to the WebSocketServer library to do all the job, this class will override the req/res 
const websocket = new WebSocketServer({
  "httpServer": httpserver
})


httpserver.listen(8080, () => console.info("Server is listening on port 8080."))

//when a legit websocket request comes listen to it and get the connection .. once you get a connection thats it! 
websocket.on("request", request => {
  const connection = request.accept(null, request.origin)
  connection.on("open", () => {
    console.log("Opened")
  })
  connection.on("close", () => console.log("CLOSED!!!"))
  connection.on("message", message => {
    console.log(`WS_INCOMING_MESSAGE::${APP_ID}:: ${message.utf8Data}`)
    // publish the message to the redis channel
    publisher.publish(CHANNEL_LIVE_CHAT, message.utf8Data)
  })

  // periodically send a message to the client
    setInterval(() => {
        connection.send(`Hello client. I am Server ${APP_ID}`)
    }, 5000)

  // periodicall publish a message to the redis channel
    setInterval(() => {
        publisher.publish(CHANNEL_LIVE_CHAT, `Hello client. I am Server ${APP_ID}`)
    }, 5000)


  connections.push(connection)
})
