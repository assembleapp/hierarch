const express = require('express')
const bodyParser = require("body-parser")
const escape = require("escape-html")
const responder = express.Router()

const {
    apply_boxes,
    apply_change,
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

responder.post("/apply_boxes", (call, response) => {
    // console.log(call.body)
    apply_boxes(call.body.address)
    response.send("done")
})

responder.post("/change", (call, response) => {
    apply_change({
        upgrade: call.body.upgrade.map(c => typeof(c) === 'string' ? escape(c) : c),
        code: call.body.code,
    })
    response.send(JSON.stringify(call.body))
})

responder.post("/resize", (call, response) => {
    apply_resize(call.body)
    response.send(JSON.stringify(call.body))
})

responder.get("/hierarchy", (call, response) => {
    hierarchy(call.query.address, (body) => response.send(body))
})

module.exports = responder