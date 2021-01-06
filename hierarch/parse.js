var fs = require('fs')
var Program = require("./program")

// ! add address argument to functions.
var sourceAddress = __dirname + '/../src/App.js'

const apply_boxes = (address) => {
    if(!address || address === "null") return null
    // console.log(address)
    fs.readFile(address, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(address, source)

        // Plan A: drop boxes.
        // attributes in query are ordered... hm.
        var plan_a = 0
        var query = program.query(`
        (jsx_element
            open_tag: (
                jsx_opening_element
                name: (_) @opening-name
                attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
                attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
            )
            close_tag: (
                jsx_closing_element
                name: (_) @closing-name
                (#eq? @closing-name "Box")
            )

            (#eq? @opening-name "Box")
            (#eq? @_original "original")
            (#eq? @_code "code")
        ) @element
        `)
        program.debug_query(query)
        query.reverse().forEach(m => {
            var close = m.captures.filter(c => c.name === "closing-name")[0].node
            var open = m.captures.filter(c => c.name === "opening-name")[0].node
            var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

            var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
            var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

            program.replace_by_node(close, original)
            program.replace_by_indices(open.startIndex, code_attr.endIndex, original)
        })
        plan_a += query.length

        query = program.query(`
        (jsx_self_closing_element
            name: (_) @name
            attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
            attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)

            (#eq? @name "Box")
            (#eq? @_original "original")
            (#eq? @_code "code")
        ) @element
        `)
        program.debug_query(query)
        query.reverse().forEach(m => {
            var name = m.captures.filter(c => c.name === "name")[0].node
            var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

            var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
            var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

            program.replace_by_indices(name.startIndex, code_attr.endIndex, original)
        })
        plan_a += query.length

        if(plan_a !== 0) {
            program.reparse()
            fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
            return null
        }

        // Plan B: add boxes.
        query = program.query(`
        (jsx_element
            open_tag: (
                jsx_opening_element
                name: (_) @opening-name
            )
            close_tag: (
                jsx_closing_element
                name: (_) @closing-name
            )
            (#eq? @opening-name @closing-name)
        ) @element
        `)
        program.debug_query(query)

        query = program.query(`
        (jsx_self_closing_element
            name: (_) @name
        ) @element
        `)
        program.debug_query(query)
    })
}

const apply_change = (change) => {
    console.log(change)
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(sourceAddress, source)

        if(!change ||
            !change.code ||
            !change.upgrade
        ) {
            throw 'oh no! improper `change` supplied in `apply_change`. please check caller.'
        }

        console.log("HOLD UP!\nSerious insecure code here; by passing a sneaky `code` param,\nsomeone could hack our parser's query.")
        matches = program.query(`(jsx_element
            open_tag: (
                jsx_opening_element
                name: (_) @opening-name
                attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
                )

            [(jsx_text) (jsx_element) (jsx_self_closing_element)]* @children

            close_tag: (jsx_closing_element name: (_) @closing-name)
            (#eq? @_code "code")
            (#match? @code "^.${change.code}.$")
            (#eq? @opening-name "Box")
            (#eq? @closing-name "Box")
        ) @element`)
        // program.debug_query(matches)

        if(matches.length !== 1) {
            throw("oh no! more than one match for an apply change operation.")
        }
        var m = matches[0]

        var children = m.captures.filter(c => c.name === 'children')
        var coded_children = {}
        children.forEach(c => {
            if (c.node.type === "jsx_element" &&
            program.display(c.node.firstNamedChild.firstNamedChild) === "Box"
            ) {
                var code = program.display(c.node.firstNamedChild.namedChildren[2].namedChildren[1])
                code = code.split('"').join('')
                // console.log(code)
                coded_children[code] = c.node
            }
        })
        // console.log(program.display(children[1].node.firstNamedChild.firstNamedChild))
        // console.log(JSON.stringify(coded_children))
        console.log(Object.keys(coded_children))
        console.log(children.map(c => program.display(c.node)))

        var beginning_skip = program.display(children[0].node).search(/\S/)
        var ending_skip = program.display(children.slice(-1)[0].node).split('').reverse().join('').search(/\S/)

        console.log(beginning_skip, ending_skip)
        change.upgrade.reverse().forEach((grade, back_index) => {
            // console.log(grade)
            var index = children.length - 1 - back_index
            var begin_cursor = children[index].node.startIndex + (index === 0 ? beginning_skip : 0)
            var end_cursor = children[index].node.endIndex - (index === children.length - 1 ? ending_skip : 0)

            console.log()
            console.log(index, children.length)
            console.log(children[index].node.startIndex, children[index].node.endIndex)
            console.log(begin_cursor, end_cursor)
            if(typeof(grade) === 'string') {
                program.replace_by_indices(begin_cursor, end_cursor, grade)
            } else if(Object.keys(grade).length === 1 && grade.code && coded_children[grade.code]) {
                console.log("inserting coded child")
                program.replace_by_indices(begin_cursor, end_cursor, program.display(coded_children[grade.code]))
            } else {
                throw("damn. no grade possible.\nindex:" + index + ",grade:" + grade)
            }
        })

        program.reparse()
        fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const apply_resize = (change) => {
    fs.readFile(sourceAddress, 'utf8', (error, source) => {
        if(error) return console.log(error)

        var program = new Program(sourceAddress, source)

        console.log("params", change)
        console.log("HOLD UP!\nSerious insecure code here; by passing a sneaky `code` param,\nsomeone could hack our parser's query.")
        var original_matches = program.query(`
        (
            jsx_self_closing_element
            name: (_) @name
            attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
            attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
            (#eq? @name "Box")
            (#eq? @_original "original")
            (#eq? @_code "code")
            (#match? @code "^.${change.code}.$")
        ) @element
        `)
        // program.debug_query(original_matches)
        if(original_matches.length > 1) {
            program.debug_query(original_matches)
            throw `oh no! more than 1 match`
        }
        if(original_matches.length < 1) {
            program.debug_query(original_matches)
            throw `oh no! no match`
        }
        var original_name = program.display(original_matches[0].captures.filter(c => c.name === "original")[0].node)
        // console.log(original_name)

        var matches = program.query([
        `(
            variable_declarator
            (identifier) @name
            "="
            (call_expression
                function: (member_expression
                    object: (identifier) @_styled
                    property: (property_identifier) @property
                    (#eq? @_styled "styled")
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
                            object: (identifier) @_styled
                            property: (property_identifier) @property
                            (#eq? @_styled "styled")
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
        )`,
        `(
            variable_declarator
            (identifier) @name
            "="
            (call_expression
                function: (call_expression
                    function: (identifier) @_styled
                    arguments: (arguments (_) @base)
                )
                arguments: (template_string) @css
                (#eq? @_styled "styled")
            ) @expr
            ${original_name && `(#eq? @name "${original_name}")` || ""}
        )`
        ])
        // program.debug_query(matches)

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

        var program = new Program(address, source)

        var query = program.query(`
        [(jsx_element) (jsx_self_closing_element)] @element
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
            var code = null
            var permissions = []

            if(c.node.type === "jsx_element") {
                name = program.display(c.node.firstNamedChild.firstNamedChild)
                if(name === "Box") {
                    // console.log()
                    // console.log(program.display(c.node))

                    code = program.display(c.node.namedChildren[0].namedChildren[2].namedChildren[1])
                    code = code.split('"').join('') // chop quotes.

                    name = program.display(c.node.namedChildren[0].namedChildren[1].namedChildren[1])
                    // console.log(name, code)
                    permissions = permissions.concat("g-4:change")
                }
                if(name === "Scope") {
                    permissions = permissions.concat("g-4:scope:grid")
                    var attrs = c.node.namedChildren[0].namedChildren.slice(1)
                    attrs = attrs.filter(a => (a.children[0] && a.children[0].type) === "property_identifier")
                    attrs = attrs.filter(a => ["source", "schema"].some(s => s === program.display(a.children[0])))
                    code = {}
                    attrs.forEach(a => code[program.display(a).split('=')[0]] = program.display(a).split('=').slice(1).join('='))
                    code.source = code.source.split('"').join('') // chop quotes.
                    code = JSON.stringify(code)
                    // console.log(code)
                }
            } else if (c.node.type === "jsx_self_closing_element") {
                name = program.display(c.node.firstNamedChild)
                if(name === "Box") {
                    // console.log()
                    // console.log(program.display(c.node))

                    code = program.display(c.node.namedChildren[2].namedChildren[1])
                    code = code.split('"').join('') // chop quotes.

                    name = program.display(c.node.namedChildren[1].namedChildren[1])
                    // console.log(name, code)
                    permissions = permissions.concat("g-4:resize")
                }
            } else {
                throw (
                    "oh no! our query has responded on an undesired node;\n" +
                    c.node.toString() +
                    "\n---\n" +
                    program.display(c.node)
                )
            }

            // console.log(program.display(c.node))
            // console.log(permissions)

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
                permissions,
                code,
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
            // upper[4] = []
            upper_chain = upper_chain.concat([e])
        })

        // const chop_arrays = (hierarchical) => {
        //     hierarchical.shift()
        //     hierarchical.shift()
        //     if(hierarchical[0].length)
        //         chop_arrays(hierarchical[0])
        // }
        // chop_arrays(hierarchy)

        callback(JSON.stringify(hierarchy, null, 2))
    })
}

module.exports = { apply_boxes, apply_change, apply_resize, hierarchy }
