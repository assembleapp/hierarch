matches.forEach(m => {
    // change by nodes
    var captures = m.captures.filter(c => c.name === 'element')
    captures.forEach(c => {
        var upgrade = (change, _) => change.upgrade
        var options = {}

        if(typeof upgrade === "function")
            upgrade = upgrade(change, c)

        program.replace_by_node(c.node, upgrade, options)
    })
})