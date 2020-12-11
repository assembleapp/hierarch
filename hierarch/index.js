const express = require('express')
const bodyParser = require("body-parser")
const escape = require("escape-html")
const responder = express.Router()

const { go, hierarchy } = require("./parse")

responder.use(bodyParser.json())

// https://enable-cors.org/server_expressjs.html
responder.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
});

responder.get("/sources", (call, response) => {
    response.send("/app/javascript/packs/splash.js")
})

responder.post("/go", (call, response) => {
    console.log(call.body)
    go()
    response.send("gone.")
})

responder.post("/change", (call, response) => {
    go({
        upgrade: escape(call.body.upgrade),
        source: call.body.source,
        code: call.body.code,
    })
    response.send(JSON.stringify(call.body))
})

responder.get("/hierarchy", (call, response) => {
    hierarchy(call.query.address, (body) => response.send(body))
})

module.exports = responder