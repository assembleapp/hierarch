// Source: 1f051fc7efbd4721a1c017c4f5c52e0d6ca929cd

            // change by nodes
            var keys = Object.keys(change_nodes())
            keys.forEach((k) => {
                var captures = m.captures.filter(c => c.name === k)
                captures.forEach(c => {
                    var upgrade = change_nodes()[k]
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
