const express = require("express")

class Topic {
    constructor() {
        this._observers = []
    }

    notify(data = {}) {
        return Promise.all(
            this._observers.map(callback => {
                return fetch(callback, {
                    method: "NOTIFY",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                })
                    .then(res => res.json())
                    .catch(err => err)
            })
        )
    }

    router() {
        const router = express.Router()

        router.use(express.json())

        router.subscribe(
            "/",
            (req, res) => {
                const callback = req.body.callback

                // TODO validate callback urls
                if (!callback) {
                    res.status(400).json({
                        subscribed: false,
                        error: "callback is required",
                    })
                    return
                }

                this._observers.push(callback)

                res.status(200).json({
                    subscribed: true,
                })
            },
            (err, req, res, next) => {
                res.status(500).json({ subscribed: false, error: err.message })
            }
        )

        return router
    }
}

class CallbackRouter {
    constructor() {
        this._callbacks = new Map()
    }

    createCallback(callbackFn) {
        const id = crypto.randomUUID()
        this._callbacks.set(id, callbackFn)
        return id
    }

    router() {
        const router = express.Router()

        router.use(express.json())

        router.notify(
            "/:callback",
            (req, res) => {
                const callbackId = req.params.callback

                if (!this._callbacks.has(callbackId)) {
                    res.status(404).json({
                        received: false,
                        error: "callback not found",
                    })
                    return
                }

                const callback = this._callbacks.get(callbackId)
                callback(req.body)

                res.status(200).json({
                    received: true,
                })
            },
            (err, req, res, next) => {
                res.status(500).json({ received: false, error: err.message })
            }
        )

        return router
    }
}

module.exports = {
    Topic,
    CallbackRouter,
}
