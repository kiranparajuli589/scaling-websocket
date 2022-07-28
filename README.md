## Websockets

**Websocket** is a computer communications protocol, providing **full-duplex** communication channels over a single **TCP** connection.
A secure version of the WebSocket protocol is implemented in most of the recent browsers.
And for the Web Servers too, most of the modern Web Servers support the Websocket protocol.
Ngnix has supported WebSockets since 2013, implemented in version `1.3.13` including acting as a reverse proxy and load balancer of WebSocket applications.
Apache HTTP Server has supported WebSockets since July 2013, implemented in version `2.4.5`.

### HTTP 1.0
Why are we talking about HTTP 1.0? Well, it's the first version of the HTTP protocol. It's a request/response protocol at it works great.
But, it's not a good protocol for real-time applications. It's a protocol that is designed to be used for **static** files.
Also, TCP connection needs to be opened and closed for every new request. 

### HTTP 1.1
To the resque :-), it's the second version of the HTTP protocol. The solution concept was `Leave it Open`.
Here, we can use the same connection for multiple requests and close it after the consecutive requests are done.

### WebSockets
Now the HTTP problem is solved, why WebSockets?
Well, upto now, only client can request the server and get the information. They are completely stateless.
But, if we want the server to ping the client, then there was no promising solution.

With the WebSockets, client and server are no longer stateless and both are aware of each other and can communicate with each other in full duplex mode.

### Websocket Handshakes

1. Client makes a normal HTTP GET request to the server
    ```console
    GET /chat HTTP/1.1
    Host: server.example.com
    Upgrade: websocket
    Connection: Upgrade
    Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==
    Sec-WebSocket-Protocol: chat, superchat
    Sec-WebSocket-Version: 13
    Origin: http://example.com
    ```
2. But this GET request a magic header `UPGRADE` with the value `websocket`
3. If the server supports the WebSocket protocol, it should responds with `101` Switching Protocol.
    ```console
    HTTP/1.1 101 Switching Protocols
    Upgrade: websocket
    Connection: Upgrade
    Sec-WebSocket-Accept: HSmrc0sMlYUkAGmm5OPpG2HaGWk=
    Sec-WebSocket-Protocol: chat
    ```
5. Now, the client and server can send WebSocket data or text frames back and forth in full-duplex mode.


### Use cases
Why do I need this **full-duplex** connection? 

- Chatting
- Live Feeds
- Multiplayer Games
- Showing Progress/Logging

Have you ever used a chat app where you can see `Someone is typing` when somebody in the other end of the world starts typing in your channel. Woah! that's great.

Also, when we're uploading a file, if we want the server to send the client the progress of the upload.

Just HTTP can never do that.

We can use WebSockets to do that. You don't have to though. Don't get attached to any technology ;-).

### Pros & Cons
**Pros:**
- Full duplex (No Polling)
- HTTP compatible
- Firewall friendly

**Cons:**
- Proxying is tricky
- L7 L/B is challenging because of timeouts.
- Stateful protocol, difficult to horizontally scale.

## Scaling Problem
Scaling of the normal HTTP requests is very simple. Just make a request to a reverse proxy and the reverse proxy will forward the request to the most available server. And that's it.

But with WebSockets it's a little different. How do we scale something that is stateful?

We cannot just move from one server to another because of the state we've accumulated in that particular server.
If we're playing a game, we might lose all our achievements and progress after getting connected to a different server (because of L/B).


### HA-Proxy
First, not all Reverse Proxy software products support WebSocket connections. So we've to find someone that does ;-).

Hey, [HA-Proxy](https://www.haproxy.org/) is a Reverse Proxy software that supports WebSocket connections.

### Redis
With the help of Redis server, we can scale the WebSocket server.
Using the pub/sub mechanism, we can synchronize the different server states.
And multiple client should be able to communicate even if they are on different servers.

### State Management

- With Redis, we create a general channel.
- Create a Redis client with every server to subscribe to the channel.
- Create a Redis client with every server to publish to the channel.
- Now, when anything is published to the channel, every subscribed server will receive the message.
