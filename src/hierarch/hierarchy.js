import React from "react"
import { HierarchScope } from "./index"
import styled from "styled-components"
import parse_hierarchy from "./engine/parse_hierarchy"

class Hierarchy extends React.Component {
    state = {
      hierarchy: [0,0,[],"",false],
      source: "",
    }

    componentDidMount = () => {
        if(!window.assemble || !window.assemble.repull) {
            window.assemble = {}
            window.assemble.repull = this.pullHierarchy.bind(this)
        }
        this.pullHierarchy()
    }

    componentWillUnmount = () => {
        window.assemble.repull = null
        if(!Object.keys(window.assemble).length) window.assemble = null
    }

    componentDidUpdate = (original) => {
        if(original.address !== this.props.address)
            this.pullHierarchy()
    }

    pullHierarchy = () => {
      fetch(`http://0.0.0.0:4321/source?address=${this.props.address}`)
        .then(response => response.text())
        .then(response => this.setState({ source: response }))
        .then(() => parse_hierarchy(
          this.state.source,
          (h) => this.setState({ hierarchy: h })
        ))
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
        <Hierarchical name={h[3]} permissions={h[4]} code={h[5]} />
        {"\n"}
        {display_hierarchy_index(index + 1, h)}
        </>
    ))
)

const Hierarchical = ({name, permissions, code}) => (
    <HierarchScope.Consumer>
    {scope => (
        <Border running={code === scope.chosen.code}>

        {
        permissions.indexOf("g-4:change") !== -1
        ?
        <a
            key={code}
            href="#"
            onClick={() => scope.signal("change", code)}
            onMouseOver={() => scope.signal("display", code)}
        >{name}</a>
        :
        <span
            key={code}
            onMouseOver={() => scope.signal("display", code)}
        >{name}</span>
        }

        {permissions.indexOf("g-4:resize") !== -1
        && <a
            href="#"
            onClick={() => scope.signal("resize", code) }
        >resize</a>
        }

        {permissions.indexOf("g-4:scope:grid") !== -1
        && <a
            href="#"
            onClick={() => scope.signal("grid", code) }
        >display grid</a>
        }
        </Border>
    )}
    </HierarchScope.Consumer>
)

const Border = styled.span`
    border: ${p => p.running ? "1px solid #ee00ee" : "none"};
`

export default Hierarchy
