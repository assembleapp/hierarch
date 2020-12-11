import React from "react"

const Hierarchy = ({ h }) => (
    <pre>
        {display_hierarchy_index(0, h)}
    </pre>
)

const display_hierarchy_index = (index, hierarchy) => (
    hierarchy[2].map(h => (
        ("  ".repeat(index)) +
        h[3] +
        "\n" +
        display_hierarchy_index(index + 1, h)
    )).join("\n")
)

export default Hierarchy