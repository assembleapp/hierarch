// Source: 8658dd0084a540f7e91d187c396f75506f1da358

var approach = {
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
}

matches = program.query(approach.query)
