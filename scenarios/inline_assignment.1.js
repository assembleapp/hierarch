            // change by nodes
            var captures = m.captures.filter(c => c.name === 'element')
            captures.forEach(c => {
                var upgrade = changeable_nodes['element']
                var options = {}

                if(upgrade instanceof Array) {
                    options = upgrade[1]
                    upgrade = upgrade[0]
                }
                if(typeof upgrade === "function")
                    upgrade = upgrade(change, c)
                program.replace_by_node(c.node, upgrade, options)
            })