const drop_dependency = (program) => {
    matches = program.query(`
    (import_statement (import_clause (identifier) @identifier) source: (string) @source
        (#match? @source "./hierarch/lens")
        (#eq? @identifier "Lens")
    ) @import
    `)

    matches.forEach(m => {
        var k = "import"
        var captures = m.captures.filter(c => c.name === k)
        captures.forEach(c => {
            var upgrade = ""
            var options = { endingOffset: 1 }
            program.replace_by_node(c.node, upgrade, options)
        })
    })
}
