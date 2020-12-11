var fs = require('fs')
var Program = require("./program")

var dependency = require("./changes/lens_dependency")
var jsx_tag = require("./changes/simple_jsx_tag")

var sourceAddress = __dirname + '/../src/App.js'
var source_name = sourceAddress.split("../").slice(-1)[0]

const go = (change = null) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(source_name, source)
        run_change(program, dependency, change)
        run_change(program, jsx_tag, change)

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const run_change = (program, plan, change) => {
    var approach = plan.prepare

    if(change &&
        change.code &&
        change.source === source_name &&
        change.upgrade
    ) var approach = plan.apply

    var clause = approach.clause || ((matches, callback) => { matches.forEach(m => callback(m))})

    matches = program.query(approach.query)
    clause(matches, m => {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })

        // change by nodes
        var keys = Object.keys(approach.change_nodes(program))
        keys.forEach((k) => {
            var captures = m.captures.filter(c => c.name === k)
            captures.forEach(c => {
                var upgrade = approach.change_nodes(program)[k]
                var options = {}

                if(upgrade instanceof Array) {
                    options = upgrade[1]
                    upgrade = upgrade[0]
                }

                if(typeof upgrade === "function")
                    upgrade = upgrade(change)

                program.replace_by_node(c.node, upgrade, options)
            })
        })
    })
}

const hierarchy = (address, callback) => {
    fs.readFile(address, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(source_name, source)

        var query = program.query(`
        [(jsx_element) (jsx_self_closing_element)] @element
        `)

        var elements = query.map(m => {
            if(m.captures.length !== 1) {
                throw(
                    "oh no! our query has responded using a non-unique capture;\n" +
                    JSON.stringify(m.captures.map(c => program.parsed.getText(c.node)))
                )
            }

            var c = m.captures[0]
            var name = null

            if(c.node.type === "jsx_element") {
                name = program.parsed.getText(c.node.firstNamedChild.firstNamedChild)
            } else if (c.node.type === "jsx_self_closing_element") {
                name = program.parsed.getText(c.node.firstNamedChild)
            } else {
                throw (
                    "oh no! our query has responded on an undesired node;\n" +
                    c.node.toString() +
                    "\n---\n" +
                    program.parsed.getText(c.node)
                )
            }

            return [
                c.node.startIndex,
                c.node.endIndex,
                "<" + name + (c.node.type === "jsx_self_closing_element" ? "/" : "") + ">",
            ]
        })

        var hierarchy = [0, program.source.length, [], "program"]
        var upper_chain = [hierarchy]
        elements.forEach(e => {
            // console.log("hierarchy", hierarchy)
            var upper = upper_chain.slice(-1)[0]
            var adding = [e[0], e[1], [], e[2]]

            if(adding[0] < upper[0]) {
                throw(
                    "oh no! our hierarchy is being processed out of order;\n" +
                    JSON.stringify(elements, null, 2) +
                    "\n---\n" +
                    JSON.stringify(hierarchy, null, 2)
                )
            }

            while(adding[1] > upper[1]) {
                upper_chain = upper_chain.slice(0, upper_chain.length - 1)
                upper = upper_chain.slice(-1)[0]
            }

            // console.log("adding", adding, "to", upper)
            upper[2] = upper[2].concat([adding])
            // console.log("added ", upper[2][upper[2].length-1], "to", upper)
            upper_chain = upper_chain.concat([adding])
            // console.log("chain", upper_chain)
            // console.log()
        })

        callback(JSON.stringify(hierarchy, null, 2))
    })
}

module.exports = { go, hierarchy }