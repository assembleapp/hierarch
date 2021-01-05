// Source: 1ee7611b29c396d48e0f487acd0d33ac35321c1d

matches.forEach(m => {
    var changeable_nodes = {
        element: (change, _) => change.upgrade,
    }
    // change by nodes
    var captures = m.captures.filter(c => c.name === 'element')
    captures.forEach(c => {
        var upgrade = changeable_nodes['element']
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
