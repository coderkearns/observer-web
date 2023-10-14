const express = require("express")
const { CallbackRouter } = require("../src/index")

const app = express()

/* Global state */
let numberOfNotifications = 0

/* Creating a notifier */
const notificationCallbacks = new CallbackRouter()
app.use("/callbacks", notificationCallbacks.router())

/* Using a notifier to handle events */
const id = notificationCallbacks.createCallback(() => {
    console.log("Received a notification!")
    numberOfNotifications++
})

console.log(
    `The observer callback url is http://localhost:3000/callbacks/${id}`
)

/* Other server stuff to make use of the callback */
app.get("/", (req, res) => {
    res.send(
        `The observer has received ${numberOfNotifications} notifications so far!`
    )
})

app.listen(3000, () => {
    console.log("Listening on port 3000")
})

/* Now we subscribe to the callback */
fetch("http://localhost:3001/notifications/", {
    method: "SUBSCRIBE",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        callback: `http://localhost:3000/callbacks/${id}`,
    }),
})
