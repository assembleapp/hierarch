const express = require('express')
const bodyParser = require("body-parser")
const escape = require("escape-html")
const responder = express.Router()

const {
  apply_change,
  apply_resize,
  apply_upgrades,
  source,
} = require("./parse")

responder.use(bodyParser.json())

// https://enable-cors.org/server_expressjs.html
responder.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://0.0.0.0:3000")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
});

responder.get("/source", (call, response) => {
  source(call.query.address, s => response.send(s))
})

responder.post("/upgrade", (call, response) => {
  check_upgrade_sequence_collisions(call.body.upgrades)
  apply_upgrades(call.body.address, call.body.upgrades)

  source(call.body.address, s => response.send(s))
})

const check_upgrade_sequence_collisions = (upgrades) => {
  // change.
}

// - - - Dumped; old addresses. begin cleaning up uses. - - - //

responder.post("/resize", (call, response) => {
    apply_resize(call.body)
    response.send(JSON.stringify(call.body))
})

module.exports = responder
