const dependency = {
    prepare: {
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
    },
    apply: {
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
}

module.exports = dependency