// Source: e1fd2b761b19a8636e03ee121ed9a76975a848c4


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
