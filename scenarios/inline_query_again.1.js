var approach = {
    change_nodes: _ => ({
        element: (change, _) => change.upgrade,
    }),
}

matches = program.query(`(jsx_element
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
) @element`)