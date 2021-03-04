const express = require('express')
const reload = require("express-reload")
const channel = parseInt(process.env.HIERARCH_CHANNEL, 10) || 4321

const responder = express()
const hierarchy = __dirname + "/hierarch/"

responder.use(reload(hierarchy))

responder.listen(channel, () => {
    console.log(`Hierarch up on ${channel}.`)
})
