// Source: 26e01f9b7a4c6912d9c7447c9aac7b5712c9e05e

            // change by nodes
            var captures = m.captures.filter(c => c.name === 'element')
            captures.forEach(c => {
                var upgrade = (change) => change.upgrade
                upgrade = upgrade(change)

                program.replace_by_node(c.node, upgrade, {})
            })
