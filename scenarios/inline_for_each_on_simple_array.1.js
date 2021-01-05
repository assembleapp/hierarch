
            // change by nodes
            var k = 'element'
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