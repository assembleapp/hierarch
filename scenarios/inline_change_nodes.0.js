// Source: 07c5670e00d07c5f108c8f8fc777eecdb2b24786

var approach = {
    change_nodes: _ => ({
        element: (change, _) => change.upgrade,
    }),
}

matches = program.query(`(jsx_element
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
) @element`)
matches.forEach(m => {
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
