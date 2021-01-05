captures.forEach(c => {
    var upgrade = (change, _) => change.upgrade

    upgrade = upgrade(change, c)

    program.replace_by_node(c.node, upgrade, {})
})