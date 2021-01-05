// Source: 5d25c4683c0c4aa8e8615da4b425954a38424613

    var approach = {
        change_indices: [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ],
    }

    matches = program.query(`
    (import_statement (import_clause (identifier) @identifier) source: (string) @source
        (#match? @source "./hierarch/lens")
        (#eq? @identifier "Lens")
    )
    `)

    if(!matches.length) {
        // change by indices
        approach.change_indices.forEach(x => {
            // beginning, ending, upgrade
            program.replace_by_indices(x[0], x[1], x[2])
        })
    }
