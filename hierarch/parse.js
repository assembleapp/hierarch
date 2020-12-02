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
        (jsx_element
            open_tag: (jsx_opening_element name: (_) @name)
        )`)

        var branches = {}
        query.forEach(m => m.captures.forEach(c => {
            node = c.node
            var node_id = `${node.type}:${node.startIndex}-${node.endIndex}`
            if(node.type === "identifier")
                node_id = node_id + "/" + program.parsed.getText(node)

            while(node.parent) {
                var upper = node.parent

                // record hierarchy
                var upper_id = `${upper.type}:${upper.startIndex}-${upper.endIndex}`

                if(node_id.split("/")[1]) {
                    var mapping = {
                        "identifier": ["jsx_opening_element", "jsx_closing_element", "function_declaration"],
                        "jsx_closing_element": ["jsx_element"],
                        "jsx_opening_element": ["jsx_element"],
                    }
                    if(Object.keys(mapping).includes(node.type) &&
                        mapping[node.type].includes(upper.type)
                    ) {
                        upper_id = upper_id + "/" + node_id.split("/")[1]
                    }
                }

                var upper_already_included_key = Object.keys(branches)
                    .filter(k => k.split("/")[0] === upper_id.split("/")[0])[0]

                if(upper_already_included_key) {
                    if(!upper_id.split("/")[1] && upper_already_included_key.split("/")[1]) {
                        upper_id = upper_id + "/" + upper_already_included_key.split("/")[1]
                    }
                    if(upper_id.split("/")[1] && !upper_already_included_key.split("/")[1]) {
                        branches[upper_id] = branches[upper_already_included_key]
                        delete branches[upper_already_included_key]
                    }
                }

                branches[upper_id] = branches[upper_id]
                ? branches[upper_id].indexOf(node_id) === -1
                  ? branches[upper_id].concat(node_id)
                  : branches[upper_id]
                : [node_id]

                node = upper
                node_id = upper_id
            }
        }))
        console.log(branches)

        callback(JSON.stringify(branches, null, 2))
    })
}

module.exports = { go, hierarchy }