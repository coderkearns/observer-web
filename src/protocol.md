# observer-web Protocol

## Subscribing to a topic

A server which can be observed exposes a topic route. In observer terminology, the server providing the topic would be called the "subject".

### Request

The subject server can expose a `SUBSCRIBE` HTTP route on a path that can work with observers.

```http
SUBSCRIBE subject.server/<topic>
Content-Type: application/json

{ "callback": "<callback_url>" }
```

### Response

`SUBSCRIBE`ing to a subject will return a message indicating a success or failure.

The response schema is:

```ts
type SubscribeResponse =
    | { status: "SUBSCRIBED" }  // Indicates the callback was subscribed successfully
    | { error: string }         // Indicates the callback was not subscribed
```

Here are some examples:

- `200 { "subscribed": true }`
- `400 { "subscribed": false, "error": "callback is required" }`
- `500 { "subscribed": false, "error": "<server_error_message>" }`

## Receiving notifications via callbacks

The server that sends the `SUBSCRIBE` request (called an "observer" in observer terminology) is in charge of hosting a callback route which is passes as a query parameter. A callback url is a `NOTIFY` HTTP route which the subject server will send requests to.

### Request

The subject server will send json requests to the callback URLs it received on `SUBSCRIBE`.

A `NOTIFY` request can have a JSON object of various schemas for a body, the simplest being an empty object:

```http
NOTIFY observer.server/<callback_url>
Content-Type: application/json

{}
```

This specification also defines some [pre-specified body schemas](#notify-pre-specified-json-bodies). It is the job of the subject server to document which topics will use which JSON schemas. Also note that schemas outside of the ones specified here are allowed.

### Response

Observers should send a simple JSON responses to indicate how a notification was received. The subject is not obligated to care about or resend a `NOTIFY` based on the response, but the information may be helpful. For example, a `404 "callback not found"` might indicate to the subject that it should remove that callback from it's internal list as it no longer exists.

The response schema is:

```ts
type NotifyResponse = {
    received: boolean   // Indicates whether the notification was handled
    error?: string      // A possible error message, which might have blocked the notification from being handled
}
```

Here are some examples:

- `200 { "received": true }`
- `404 { "received": false, "error": "callback not found" }`
- `500 { "received": false, "error": "<server_error_message>" }`

## `NOTIFY` pre-specified JSON bodies

### Empty

If you want to support `"application/json"` but don't need to provide any data you can send an empty body.

```ts
type EmptyJSONBody = {}
```

### Chat

Two-way chat applications could use the following JSON schema:

```ts
type ChatJSONBody = {
    from: string        // An identifier for the user sending the message. The server may also was to use i.p addresses to authenticate message senders
    message: string     // The message being sent
    timestamp: string   // Date().toString() representation of the time the message was sent
}
```

Each application `SUBSCRIBE`s to the other. Then they keep a store of all the messages they receive.
