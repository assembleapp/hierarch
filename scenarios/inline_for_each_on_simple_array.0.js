// Source: ca4055699ed30ebc7f171fd2eb66af33a2890dd6


            // change by nodes
            var keys = ['element']
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
