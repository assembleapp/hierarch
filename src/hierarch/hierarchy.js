import React from "react"

class Hierarchy extends React.Component {
    state = {
        hierarchy: [0,0,[],"",false],
    }

    componentDidMount = () => this.pullHierarchy()

    pullHierarchy = () => {
        fetch(`http://0.0.0.0:4321/hierarchy?address=${this.props.address}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.text())
        .then(response => this.setState({
            hierarchy: JSON.parse(response),
        }))
    }

    render = () => (
        <pre>
            {display_hierarchy_index(0, this.state.hierarchy)}
        </pre>
    )
}


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