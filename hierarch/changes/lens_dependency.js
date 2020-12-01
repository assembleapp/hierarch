const dependency = {
    prepare: {
        query: `
        (import_statement (import_clause (identifier) @identifier) source: (string) @source
            (#match? @source "./hierarch/lens")
            (#eq? @identifier "Lens")
        )
        `,
        clause: matches => !matches.length,
        change_nodes: {},
        change_indices: [
            [0, 0, "import Lens from './hierarch/lens'\n"],
        ],
    },
    apply: {
        query: `
        (import_statement (import_clause (identifier) @identifier) source: (string) @source
            (#match? @source "./hierarch/lens")
            (#eq? @identifier "Lens")
        ) @import
        `,
        change_nodes: {
            import: ["", { endingOffset: 1 }],
        },
    }
}

module.exports = dependency