// Source: 700678b53d88652f57088738c6c5824e6d9d13de

matches.forEach(m => {
    var change_nodes = _ => ({
        element: (change, _) => change.upgrade,
    })

    // change by nodes
    var keys = Object.keys(change_nodes(program))
    keys.forEach((k) => {
        var captures = m.captures.filter(c => c.name === k)
        captures.forEach(c => {
            var upgrade = change_nodes(program)[k]
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
