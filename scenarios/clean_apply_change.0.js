// Source: 79d9bb8a137b53efe495bac56cd6965e04c6db7f

var approach = {
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
