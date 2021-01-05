const add_dependency = (program) => {
    var approach = {
        clause: (matches, callback) => { matches.length ? null : callback(null) },
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
    })
}
