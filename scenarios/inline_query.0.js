// Source: 24975043221d220ca6d3c0ff984496ffc3e23b4f
    var approach = {
        query: `
        (import_statement (import_clause (identifier) @identifier) source: (string) @source
            (#match? @source "./hierarch/lens")
            (#eq? @identifier "Lens")
        )
        `,
        clause: (matches, callback) => { matches.length ? null : callback(null) },
        change_nodes: _ => ({}),
        change_indices: [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ],
    }

    var clause = approach.clause || ((matches, callback) => { matches.forEach(m => callback(m))})

    matches = program.query(approach.query)
