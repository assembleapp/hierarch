captures.forEach(c => {
    var upgrade = (change) => change.upgrade
    upgrade = upgrade(change)

    program.replace_by_node(c.node, upgrade, {})
})