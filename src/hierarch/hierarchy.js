import React from "react"

const Hierarchy = ({ h }) => (
    <pre>
        {display_hierarchy_index(0, h)}
    </pre>
)

const display_hierarchy_index = (index, hierarchy) => (
    hierarchy[2].map(h => (
        <>
        {("  ".repeat(index))}
        <Hierarchical name={h[3]} begin={h[0]} end={h[1]} />
        {"\n"}
        {display_hierarchy_index(index + 1, h)}
        </>
    ))
)

const Hierarchical = ({name, begin, end}) => (
    <span>{name}</span>
)

export default Hierarchy