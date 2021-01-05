// Source: 86370cfb018d902d73da3c1639785bde7466de7e

captures.forEach(c => {
    var upgrade = (change, _) => change.upgrade

    upgrade = upgrade(change, c)

    program.replace_by_node(c.node, upgrade, {})
})
