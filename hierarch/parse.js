var fs = require('fs')
var Program = require("./program")

var dependency = require("./changes/lens_dependency")
var jsx_tag = require("./changes/simple_jsx_tag")

var sourceAddress = __dirname + '/../src/App.js'
var source_name = sourceAddress.split("../").slice(-1)[0]

const apply_lens = (range) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(source_name, source)

        var lens_node = program.parsed.rootNode.descendantForIndex(range[0], range[1])

        if(lens_node.startIndex !== range[0] || lens_node.endIndex !== range[1]) {
            console.log(program.parsed.getText(lens_node))
            console.log(range)
            console.log([lens_node.startIndex, lens_node.endIndex])
            throw("oh no! applying a lens on an improper node.")
        }

        if(lens_node.type === "jsx_text") {
            program.replace_by_node(
                lens_node,
                `<Lens.Change source="${program.name}" code="abcd" >
                    ${program.parsed.getText(lens_node)}
                </Lens.Change>`
            )
        }

        run_change(program, dependency, null)
        // run_change(program, jsx_tag, null)

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const apply_change = (change = null) => {
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
                    upgrade = upgrade(change, c)

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
        [(jsx_element) (jsx_self_closing_element) (jsx_text)] @element
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
            } else if (c.node.type === "jsx_text") {
                name = "..."
            } else {
                throw (
                    "oh no! our query has responded on an undesired node;\n" +
                    c.node.toString() +
                    "\n---\n" +
                    program.parsed.getText(c.node)
                )
            }

            var appendages = {
                jsx_self_closing_element: ["<", "/>"],
                jsx_element: ["<", ">"],
            }[c.node.type] || ["", ""]

            name = appendages[0] + name + appendages[1]
            return [
                c.node.startIndex,
                c.node.endIndex,
                [],
                name,
                c.node.type === "jsx_text"
            ]
        })

        var hierarchy = [0, program.source.length, [], "program", false]
        var upper_chain = [hierarchy]
        elements.forEach(e => {
            var upper = upper_chain.slice(-1)[0]

            if(e[0] < upper[0]) {
                throw(
                    "oh no! our hierarchy is being processed out of order;\n" +
                    JSON.stringify(elements, null, 2) +
                    "\n---\n" +
                    JSON.stringify(hierarchy, null, 2)
                )
            }

            while(e[1] > upper[1]) {
                upper_chain = upper_chain.slice(0, upper_chain.length - 1)
                upper = upper_chain.slice(-1)[0]
            }

            upper[2] = upper[2].concat([e])
            upper[4] = false
            upper_chain = upper_chain.concat([e])
        })

        // console.log(program.parsed.rootNode.toString())
        // console.log(JSON.stringify(hierarchy, null, 2))
        callback(JSON.stringify(hierarchy, null, 2))
    })
}

module.exports = { apply_lens, apply_change, hierarchy }