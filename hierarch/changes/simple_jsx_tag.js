const simple_jsx_tag = {
    prepare: {
        query: `
        (jsx_element
            open_tag: (jsx_opening_element name: (identifier) @opening-name)
            (jsx_text) @children
            close_tag: (jsx_closing_element name: (identifier) @closing-name)
            (#eq? @opening-name @closing-name)
            (#eq? @opening-name "code")
        )
        `,
        change_nodes: program => ({
            children: (_, c) => `<Lens.Change source="${program.name}" code="abcd" >${
                program.parsed.getText(c.node)
            }</Lens.Change>`,
        }),
        change_indices: [
        ],
    },
    apply: {
        query: `(jsx_element
            open_tag: (
                jsx_opening_element
                name: (_) @opening-name
                attribute: (jsx_attribute (property_identifier) @source_ "=" (_)) @source
                attribute: (jsx_attribute (property_identifier) @code_ "=" (_)) @code
                )
            (jsx_text) @children
            close_tag: (jsx_closing_element name: (_) @closing-name)

            (#eq? @source_ "source")
            (#eq? @code_ "code")
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