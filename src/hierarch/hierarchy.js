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
        <Hierarchical name={h[3]} begin={h[0]} end={h[1]} changeable={h[4]} />
        {"\n"}
        {display_hierarchy_index(index + 1, h)}
        </>
    ))
)

const Hierarchical = ({name, begin, end, changeable}) => (
    changeable
    ? <a
      key={`${begin}-${end}`}
      href="#"
      onClick={() => use_lens(begin, end)}
      >{name}</a>
    : <span
        key={`${begin}-${end}`}
      >{name}</span>
)

const use_lens = (begin, end) => {
    fetch("http://0.0.0.0:4321/lens", {
        method: "POST",
        body: JSON.stringify({ begin, end }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.text())
    .then(response => console.log(response))
}

export default Hierarchy