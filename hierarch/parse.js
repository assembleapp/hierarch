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
        console.log("Plan A")
        var plan_a = 0
        // run query
        while(true) {
            program.reparse()
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

            if(query.length > 0) {
                var m = query[0]
                program.debug_query([m])

                var close = m.captures.filter(c => c.name === "closing-name")[0].node
                var open = m.captures.filter(c => c.name === "opening-name")[0].node
                var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

                var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
                var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

                program.replace_by_node(close, original)
                program.replace_by_indices(open.startIndex, code_attr.endIndex, original)
                plan_a += 1
            } else {
                break
            }
        }

        // run second query
        while(true) {
            program.reparse()

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
            if(query.length > 0) {
                var m = query[0]
                program.debug_query([m])

                var name = m.captures.filter(c => c.name === "name")[0].node
                var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

                var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
                var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

                program.replace_by_indices(name.startIndex, code_attr.endIndex, original)

                plan_a += 1
            } else {
                break
            }
        }

        program.reparse()
        if(plan_a > 0) {
            fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
            return null
        }

        // Plan B: add boxes.
        console.log("Plan B")

        // begin
        var plan_b = 0
        while(true) {
            program.reparse()
            // run query
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
            query = query.filter(m => !(m.captures.some(c => c.name === 'opening-name' && program.display(c.node) === 'Box')))
            query = query.filter(m => !(m.captures.some(c => c.name === 'opening-name' && program.display(c.node) === 'Scope')))

            if(query.length > 0) {
                var m = query[0]
                program.debug_query([m])

                const opening_name= m.captures.filter(c => c.name === "opening-name")[0].node
                const closing_name = m.captures.filter(c => c.name === "closing-name")[0].node
                const original = program.display(opening_name)

                // code: abc123-123132
                // source file hash - content hash
                program.replace_by_node(closing_name, "Box")
                program.replace_by_node(opening_name, `Box original={${original}} code="${Math.random()}"`)

                plan_b += 1
            } else {
                break
            }
        }

        while(true) {
            program.reparse()
            // run second query
            query = program.query(`
            (jsx_self_closing_element
                name: (_) @name
            ) @element
            `)
            query = query.filter(m => !(m.captures.some(c => c.name === 'name' && program.display(c.node) === 'Box')))
            query = query.filter(m => !(m.captures.some(c => c.name === 'name' && program.display(c.node) === 'br')))

            if(query.length > 0) {
                var m = query[0]
                program.debug_query([m])

                const name = m.captures.filter(c => c.name === "name")[0].node
                const original = program.display(name)

                // code: abc123-123132
                // source file hash - content hash
                program.replace_by_node(name, `Box original={${original}} code="${Math.random()}"`)

                plan_b += 1
            } else {
                break
            }
        }

        program.reparse()
        if(plan_b > 0) {
            fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
            return null
        }

        // program.reparse()
        // fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
    })
}

const apply_upgrade = (begin, end, upgrade) => {
  fs.readFile(sourceAddress, 'utf8', (error, source) => {
    if(error) return console.log(error)

    var program = new Program(sourceAddress, source)
    program.replace_by_indices(begin, end, upgrade)

    fs.writeFile(
      sourceAddress,
      program.source,
      err => { if(error) console.log(err) },
    )
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
            (#match? @code "^.${code}.$")
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

const source = (address, callback) => {
  fs.readFile(address, 'utf8', (error, source) => {
    if(error) return console.log(error)
    callback(source)
  })
}

module.exports = {
  apply_boxes,
  apply_resize,
  apply_upgrade,
  source,
}
