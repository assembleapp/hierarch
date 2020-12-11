const simple_jsx_tag = {
    prepare: {
        query: `()`,
        change_nodes: _ => ({}),
        change_indices: [
        ],
    },
    apply: {
        query: `(jsx_element
            open_tag: (
                jsx_opening_element
                name: (_) @opening-name
                attribute: (jsx_attribute (property_identifier) @_source "=" (_) @source)
                attribute: (jsx_attribute (property_identifier) @_code "=" (_) @code)
                )
            .
            (jsx_text) @children
            .
            close_tag: (jsx_closing_element name: (_) @closing-name)

            (#eq? @_source "source")
            (#eq? @_code "code")
            (#eq? @opening-name "Lens.Change")
            (#eq? @closing-name "Lens.Change")
        ) @element`,
        change_nodes: _ => ({
            element: (change, _) => change.upgrade,
        }),
        change_indices: [],
    }
}

module.exports = simple_jsx_tag