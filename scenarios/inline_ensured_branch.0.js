// Source: 39f4a0279f335fc3332dccd64465287e1a9a4d41

captures.forEach(c => {
    var upgrade = (change, _) => change.upgrade
    var options = {}

    if(typeof upgrade === "function")
        upgrade = upgrade(change, c)

    program.replace_by_node(c.node, upgrade, options)
})
