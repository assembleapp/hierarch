            // change by nodes
            var changeable_nodes = change_nodes()
            var keys = Object.keys(changeable_nodes)
            keys.forEach((k) => {
                var captures = m.captures.filter(c => c.name === k)
                captures.forEach(c => {
                    var upgrade = changeable_nodes[k]
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