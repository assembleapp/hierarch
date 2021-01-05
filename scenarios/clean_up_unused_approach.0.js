// Source: a1aab3cca5a63e53b978c1991dd9c19a882ead4c

const drop_dependency = (program) => {
    var approach = {
        query: `
        (import_statement (import_clause (identifier) @identifier) source: (string) @source
            (#match? @source "./hierarch/lens")
            (#eq? @identifier "Lens")
        ) @import
        `,
        change_nodes: _ => ({
            import: ["", { endingOffset: 1 }],
        }),
        change_indices: [],
    }
    var clause = approach.clause || ((matches, callback) => { matches.forEach(m => callback(m))})

    matches = program.query(approach.query)
    clause(matches, m => {
        var k = "import"
        var captures = m.captures.filter(c => c.name === k)
        captures.forEach(c => {
            var upgrade = ""
            var options = { endingOffset: 1 }
            program.replace_by_node(c.node, upgrade, options)
        })
    })
}
