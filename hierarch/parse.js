var fs = require('fs')
var Program = require("./program")

var dependency = require("./changes/lens_dependency")
var jsx_tag = require("./changes/simple_jsx_tag")

var sourceAddress = __dirname + '/../src/App.js'
var source_name = sourceAddress.split("../").slice(-1)[0]

const run_change = (program, plan, change) => {
    //prepare
    var matches = program.query(plan.prepare.query)
    var clause = plan.prepare.clause || ((matches, program, callback) => { matches.forEach(m => callback(m))})
    clause(matches, program, m => {
        plan.prepare.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_in_program_by_indices(x[0], x[1], x[2])
        })

        // change by nodes
        var keys = Object.keys(plan.prepare.change_nodes(program))
        keys.forEach((k) => {
            var captures = m.captures.filter(c => c.name === k)
            captures.forEach(c => {
                var upgrade = plan.prepare.change_nodes(program)[k]
                var options = {}
                if(upgrade instanceof Array) {
                    options = upgrade[1]
                    upgrade = upgrade[0]
                }
                program.replace_in_program_by_node(c.node, upgrade, options)
            })
        })
    })

    // apply
    if(change &&
        change.code &&
        change.source === source_name &&
        change.upgrade
    ) {
        matches = program.query(plan.apply.query)
        var clause = plan.apply.clause || ((matches, program, callback) => { matches.forEach(m => callback(m))})
        clause(matches, program, m => {
            // change by indices
            plan.apply.change_indices.forEach(x => {
                // beginning, ending, upgrade
                program.replace_in_program_by_indices(x[0], x[1], x[2])
            })

            // change by nodes
            var keys = Object.keys(plan.apply.change_nodes(program))
            keys.forEach((k) => {
                var captures = m.captures.filter(c => c.name === k)
                captures.forEach(c => {
                    var upgrade = plan.apply.change_nodes(program)[k]
                    var options = {}
                    if(upgrade instanceof Array) {
                        options = upgrade[1]
                        upgrade = upgrade[0]
                    }
                    if(typeof upgrade === "function")
                        upgrade = upgrade(change)
                    program.replace_in_program_by_node(c.node, upgrade, options)
                })
            })
        })
    }
}

const go = (change = null) => {
    fs.readFile(sourceAddress, 'utf8', (error, response) => {
        if(error) return console.log(error)
        var source = response

        var program = new Program(source_name, source)

        run_change(program, dependency, change)
        run_change(program, jsx_tag, change)

        var remade = program.source

        fs.writeFile(sourceAddress, remade, err => console.log(err))
    })
}

module.exports = go