var fs = require('fs')
var Program = require("./program")

// ! add address argument to functions.
var sourceAddress = __dirname + '/../src/App.js'

const apply_lens = (range) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = sourceAddress.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var lens_node = program.parsed.rootNode.descendantForIndex(range[0], range[1])

        if(lens_node.startIndex !== range[0] || lens_node.endIndex !== range[1]) {
            console.log(program.display(lens_node))
            console.log(range)
            console.log([lens_node.startIndex, lens_node.endIndex])
            throw("oh no! applying a lens on an improper node.")
        }

        if(lens_node.type === "jsx_text") {
            var child = program.display(lens_node)

            // account for spacing
            var begin = lens_node.startIndex + child.search(/\S/)
            var end = lens_node.endIndex - child.split("").reverse().join("").search(/\S/)
            var concise_child = program.source.slice(begin, end)

            program.replace_by_indices(
                begin,
                end,
                `<Lens.Change source="${program.name}" code="abcd" >${
                    concise_child
                }</Lens.Change>`
            )
        }

        add_dependency(program)

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const add_dependency = (program) => {
    var approach = {
        change_indices: [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ],
    }

    matches = program.query(`
    (import_statement (import_clause (identifier) @identifier) source: (string) @source
        (#match? @source "./hierarch/lens")
        (#eq? @identifier "Lens")
    )
    `)

    if(!matches.length) {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    }
}

const drop_dependency = (program) => {
    var approach = {
        query: `
        (import_statement (import_clause (identifier) @identifier) source: (string) @source
            (#match? @source "./hierarch/lens")
            (#eq? @identifier "Lens")
        ) @import
        `,
        change_nodes: _ => ({
            import: ["", { endingOffset: 1 }],
        }),
        change_indices: [],
    }
    var clause = approach.clause || ((matches, callback) => { matches.forEach(m => callback(m))})

    matches = program.query(approach.query)
    clause(matches, m => {
        var k = "import"
        var captures = m.captures.filter(c => c.name === k)
        captures.forEach(c => {
            var upgrade = ""
            var options = { endingOffset: 1 }

            program.replace_by_node(c.node, upgrade, options)
        })
    })
}

const apply_change = (change = null) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = sourceAddress.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var approach = {}

        if(change &&
            change.code &&
            change.source === program.name &&
            change.upgrade
        ) var approach = {
            query: `(jsx_element
                open_tag: (
                    jsx_opening_element
                    name: (_) @opening-name
                    attribute: (jsx_attribute (property_identifier) @_source "=" (_) @source)
                    attribute: (jsx_attribute (property_identifier) @_code "=" (_) @code)
                    )
                .
                (jsx_text) @children
                .
                close_tag: (jsx_closing_element name: (_) @closing-name)
                (#eq? @_source "source")
                (#eq? @_code "code")
                (#eq? @opening-name "Lens.Change")
                (#eq? @closing-name "Lens.Change")
            ) @element`,
            change_nodes: _ => ({
                element: (change, _) => change.upgrade,
            }),
            change_indices: [],
        }

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

        program.reparse()
        if(change &&
            change.code &&
            change.source === program.name &&
            change.upgrade
        ) {
            drop_dependency(program)
        } else {
            add_dependency(program)
        }

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const use_resize = (range) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = sourceAddress.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var resize_node = program.parsed.rootNode.descendantForIndex(range[0], range[1])

        if(resize_node.startIndex !== range[0] || resize_node.endIndex !== range[1]) {
            console.log(program.display(resize_node))
            console.log(range)
            console.log([resize_node.startIndex, resize_node.endIndex])
            throw("oh no! applying a lens on an improper node.")
        }

        if(resize_node.type === "jsx_self_closing_element") {
            var name_query = program.query(`(jsx_self_closing_element name: (_) @name)`, resize_node)
            var name = name_query[0].captures[0].node

            program.replace_by_node(name, `Lens.Resize original={${program.display(name)}}`)
        }

        add_dependency(program)

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const end_resize = (range) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = sourceAddress.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var resize_node = program.parsed.rootNode.descendantForIndex(range[0], range[1])

        if(resize_node.startIndex !== range[0] || resize_node.endIndex !== range[1]) {
            console.log(program.display(resize_node))
            console.log(range)
            console.log([resize_node.startIndex, resize_node.endIndex])
            throw("oh no! applying a lens on an improper node.")
        }

        if(resize_node.type === "jsx_self_closing_element") {
            var query = program.query(`(
                jsx_self_closing_element
                name: (_) @name
                .
                attribute: (
                    jsx_attribute
                    (property_identifier) @prop
                    (jsx_expression (_) @original)
                ) @attr
                (#eq? @name "Lens.Resize")
                (#eq? @prop "original")
            )`, resize_node)

            var name = query[0].captures.filter(c => c.name === "name")[0].node
            var original = query[0].captures.filter(c => c.name === "original")[0].node
            var attr = query[0].captures.filter(c => c.name === "attr")[0].node

            program.replace_by_indices(name.startIndex, attr.endIndex, program.display(original))
        }

        drop_dependency(program)

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const apply_resize = (change) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = sourceAddress.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var original_matches = program.query(`
        (
            jsx_self_closing_element
            name: (_) @name
            attribute: (jsx_attribute (property_identifier) @prop (jsx_expression (_) @original))
            (#eq? @name "Lens.Resize")
            (#eq? @prop "original")
        )
        `)
        if(original_matches.length > 1) {
            program.debug_query(original_matches)
            throw `oh no! more than 1 match`
        }
        var original_name = program.display(original_matches[0].captures.filter(c => c.name === "original")[0].node)

        var matches = program.query([
        `(
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
            ${original_name && `(#eq? @name "${original_name}")` || ""}
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
            ${original_name && `(#eq? @name "${original_name}")` || ""}
        )`
        ])

        const css_string = matches.slice(-1)[0].captures.slice(-1)[0].node
        var css_node = program.parse_range_as_language(css_string.startIndex + 1, css_string.endIndex - 1, "css").rootNode

        var query = program.query(`
        (stylesheet
            (declaration (property_name) @prop (_) @value)
            (#eq? @prop "height")
        )
        `, css_node, 'css')
        if(query[0] && query[0].captures[1]) {
            program.replace_by_node(query[0].captures[1].node, change.height)
        } else {
            program.replace_by_indices(css_string.startIndex + 1, css_string.startIndex + 1, `\nheight: ${change.height};`)
        }

        var query = program.query(`
        (stylesheet
            (declaration (property_name) @prop (_) @value)
            (#eq? @prop "width")
        )
        `, css_node, 'css')
        if(query[0] && query[0].captures[1]) {
            program.replace_by_node(query[0].captures[1].node, change.width)
        } else {
            program.replace_by_indices(css_string.startIndex + 1, css_string.startIndex + 1, `\nwidth: ${change.width};`)
        }
        program.use_language('js')

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const hierarchy = (address, callback) => {
    fs.readFile(address, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var source_name = address.split("../").slice(-1)[0]
        var program = new Program(source_name, source)

        var query = program.query(`
        [(jsx_element) (jsx_self_closing_element) (jsx_text)] @element
        `)

        var elements = query.map(m => {
            if(m.captures.length !== 1) {
                throw(
                    "oh no! our query has responded using a non-unique capture;\n" +
                    JSON.stringify(m.captures.map(c => program.display(c.node)))
                )
            }

            var c = m.captures[0]
            var name = null

            if(c.node.type === "jsx_element") {
                name = program.display(c.node.firstNamedChild.firstNamedChild)
            } else if (c.node.type === "jsx_self_closing_element") {
                name = program.display(c.node.firstNamedChild)
            } else if (c.node.type === "jsx_text") {
                name = program.display(c.node).trim()
                // should `name` be exceedingly long, truncate using "..."
            } else {
                throw (
                    "oh no! our query has responded on an undesired node;\n" +
                    c.node.toString() +
                    "\n---\n" +
                    program.display(c.node)
                )
            }

            var permissions = []
                .concat(c.node.type === "jsx_text" ? "g-4:change" : [])
                .concat(c.node.type === "jsx_self_closing_element" ?
                  name === "Lens.Resize"
                  ? "g-4:resize:end"
                  : "g-4:resize"
                : [])

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
                permissions
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
            upper[4] = []
            upper_chain = upper_chain.concat([e])
        })

        callback(JSON.stringify(hierarchy, null, 2))
    })
}

module.exports = { apply_lens, apply_change, use_resize, end_resize, apply_resize, hierarchy }
