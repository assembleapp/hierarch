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

const lens = () => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(source_name, source)

        // add lens in program
        var matches = program.query([`(
            variable_declarator
            (identifier) @name
            "="
            (call_expression
                function: (member_expression
                    object: (identifier) @object
                    property: (property_identifier) @property
                    (#eq? @object "styled")
                )
                arguments: (template_string) @css
            )
        )`,
        `(
            variable_declarator
            (identifier) @name
            "="
            (call_expression
                function: (call_expression
                    function: (member_expression
                        object: (member_expression
                            object: (identifier) @object
                            property: (property_identifier) @property
                            (#eq? @object "styled")
                        )
                        property: (property_identifier) @attrs
                        (#eq? @attrs "attrs")
                    )
                    arguments: (arguments
                        (object) @attributes
                    )
                )
                arguments: (template_string) @css
            )
        )`
        ])

        var elements = matches.map(m => {
            // if(m.captures.length !== 1) throw `more than 1 capture; ${m}`
            return m.captures.map(c => {
                return [
                    c.name,
                    c.node.toString(),
                    program.parsed.getText(c.node),
                ]
            })
        })

        // console.log(elements)

        const css_node = matches.slice(-1)[0].captures.slice(-1)[0].node
        console.log(program.parse_range_as_language(css_node.startIndex + 1, css_node.endIndex - 1, "css").rootNode.toString())
        program.use_language('js')

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(error)})
    })
}

module.exports = { go, lens }