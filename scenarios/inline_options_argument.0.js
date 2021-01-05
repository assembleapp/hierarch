// Source: b01b081c8ed022251bdee22cf11384ce963e8ddd

captures.forEach(c => {
    var upgrade = (change, _) => change.upgrade
    var options = {}

    upgrade = upgrade(change, c)

    program.replace_by_node(c.node, upgrade, options)
})
