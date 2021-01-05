// Source: 9756cd5a7b1c7ed556c4a3a41ec9466523dfc74f

            // change by nodes
            var captures = m.captures.filter(c => c.name === 'element')
            captures.forEach(c => {
                var upgrade = change.upgrade
                program.replace_by_node(c.node, upgrade, {})
            })
