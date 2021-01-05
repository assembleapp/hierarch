// Source: bb23dcd6a58090a01f78b83756f4935b6d674ff8
// rename: `drop_unused_assignment`

const add_dependency = (program) => {
    var approach = {
    }

    matches = program.query(`
    (import_statement (import_clause (identifier) @identifier) source: (string) @source
        (#match? @source "./hierarch/lens")
        (#eq? @identifier "Lens")
    )
    `)
    if(!matches.length) {
        // change by indices
        [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ].forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    }
}
