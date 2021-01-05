
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

    var clause = (matches, callback) => { matches.length ? null : callback(null) }
