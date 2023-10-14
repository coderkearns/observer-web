const express = require("express")
const { Topic } = require("../src/index")

const app = express()

/* Creating a topic */
const notificationTopic = new Topic()

app.use("/notifications", notificationTopic.router())

/* Using a topic */
setInterval(() => {
    notificationTopic.notify()
}, 1000)

/* Other server stuff to make use of the topic */
app.get("/", (req, res) => {
    res.send(
        "This is the subject! Now you can subscribe to to http://localhost:3001/notifications"
    )
})

app.listen(3001, () => {
    console.log("Listening on port 3001")
})
