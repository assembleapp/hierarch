// Source: 10fecf9de6818ad442d466118625b495b85dce9d
const add_dependency = (program) => {
    var approach = {
        clause: (matches, callback) => { matches.length ? null : callback(null) },
        change_nodes: _ => ({}),
        change_indices: [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ],
    }
    var clause = approach.clause || ((matches, callback) => { matches.forEach(m => callback(m))})
    matches = program.query(`
    (import_statement (import_clause (identifier) @identifier) source: (string) @source
        (#match? @source "./hierarch/lens")
        (#eq? @identifier "Lens")
    )
    `)
    clause(matches, m => {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })

        // change by nodes
        var keys = Object.keys(approach.change_nodes(program))
        keys.forEach((k) => {
            var captures = m.captures.filter(c => c.name === k)
            captures.forEach(c => {
                var upgrade = approach.change_nodes(program)[k]
                var options = {}

                if(upgrade instanceof Array) {
                    options = upgrade[1]
                    upgrade = upgrade[0]
                }

                program.replace_by_node(c.node, upgrade, options)
            })
        })
    })
}
