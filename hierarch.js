const express = require('express')
const reload = require("express-reload")
const port = 4321

const responder = express()
const hierarchy = __dirname + "/hierarch/"

responder.use(reload(hierarchy))

responder.listen(port, () => {
    console.log(`Hierarch up on ${port}.`)
})