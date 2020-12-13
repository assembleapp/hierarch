const express = require('express')
const bodyParser = require("body-parser")
const escape = require("escape-html")
const responder = express.Router()

const {
    apply_lens,
    apply_change,
    use_resize,
    end_resize,
    apply_resize,
    hierarchy,
} = require("./parse")

responder.use(bodyParser.json())

// https://enable-cors.org/server_expressjs.html
responder.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "http://localhost:3000")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
});

responder.post("/lens", (call, response) => {
    apply_lens([call.body.begin, call.body.end])
    response.send("applied.")
})

responder.post("/change", (call, response) => {
    apply_change({
        upgrade: escape(call.body.upgrade),
        source: call.body.source,
        code: call.body.code,
    })
    response.send(JSON.stringify(call.body))
})

responder.post("/use_resize", (call, response) => {
    use_resize([call.body.begin, call.body.end])
    response.send("applied.")
})

responder.post("/end_resize", (call, response) => {
    end_resize([call.body.begin, call.body.end])
    response.send("applied.")
})

responder.post("/resize", (call, response) => {
    apply_resize(call.body)
    response.send(JSON.stringify(call.body))
})

responder.get("/hierarchy", (call, response) => {
    hierarchy(call.query.address, (body) => response.send(body))
})

module.exports = responder