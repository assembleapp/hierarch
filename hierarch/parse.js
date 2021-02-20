var fs = require('fs')
var Program = require("./program")

// ! add address argument to functions.
var sourceAddress = __dirname + '/../src/App.js'

const apply_upgrades = (address, upgrades) => {
  fs.readFile(address, 'utf8', (error, source) => {
    if(error) return console.log(error)

    var program = new Program(address, source)

    upgrades.reverse().forEach(upgrade => {
      program.replace_by_indices(
        upgrade.begin,
        upgrade.end,
        upgrade.grade,
      )
    })

    fs.writeFile(
      address,
      program.source,
      err => { if(error) console.log(err) },
    )
  })
}

const source = (address, callback) => {
  fs.readFile(address, 'utf8', (error, source) => {
    if(error) return console.log(error)
    callback(source)
  })
}

module.exports = {
  apply_upgrades,
  source,
}
