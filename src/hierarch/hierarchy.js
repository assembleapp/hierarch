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
        <Hierarchical name={h[3]} begin={h[0]} end={h[1]} under={h[2]} />
        {"\n"}
        {display_hierarchy_index(index + 1, h)}
        </>
    ))
)

const Hierarchical = ({name, begin, end, under}) => (
    under.length === 0
    ? <a
      key={`${begin}-${end}`}
      href="#"
      onClick={() => {
        fetch("http://0.0.0.0:4321/go", {
          method: "POST",
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
          },
        })
        .then(response => response.text())
        .then(response => console.log(response))
      }}>{name}</a>
    : <span
        key={`${begin}-${end}`}
      >{name}</span>
)

export default Hierarchy