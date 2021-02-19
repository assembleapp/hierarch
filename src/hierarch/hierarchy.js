import React from "react"
import { HierarchScope } from "./index"
import styled from "styled-components"
import makeProgram from "./program"

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
      fetch(`http://0.0.0.0:4321/source?address=${this.state.address}`)
        .then(response => response.text())
        .then(response => this.setState({ source: response }))
      this.parse_hierarchy()
    }

    render = () => (
        <pre>
            {display_hierarchy_index(0, this.state.hierarchy)}
        </pre>
    )

  parse_hierarchy = () => {
    hierarchy(
      this.state.source,
      (h) => this.setState({ hierarchy: h })
    )
  }
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

const hierarchy = async (source, callback) => {
  var program = await makeProgram(source)
  debugger

  var query = program.query(`
    [(jsx_element) (jsx_self_closing_element)] @element
  `)

  var elements = query.map(m => {
    if(m.captures.length !== 1) {
      throw(
        "oh no! our query has responded using a non-unique capture;\n" +
        JSON.stringify(m.captures.map(c => program.display(c.node)))
      )
    }

    var c = m.captures[0]
    var name = null
    var code = null
    var permissions = []

    if(c.node.type === "jsx_element") {
      name = program.display(c.node.firstNamedChild.firstNamedChild)
      if(name === "Box") {
        // console.log()
        // console.log(program.display(c.node))

        code = program.display(c.node.namedChildren[0].namedChildren[2].namedChildren[1])
        code = code.split('"').join('') // chop quotes.

        name = program.display(c.node.namedChildren[0].namedChildren[1].namedChildren[1])
        // console.log(name, code)
        permissions = permissions.concat("g-4:change")
      }
      if(name === "Scope") {
        permissions = permissions.concat("g-4:scope:grid")
        var attrs = c.node.namedChildren[0].namedChildren.slice(1)
        attrs = attrs.filter(a => (a.children[0] && a.children[0].type) === "property_identifier")
        attrs = attrs.filter(a => ["source", "schema"].some(s => s === program.display(a.children[0])))
        code = {}
        attrs.forEach(a => code[program.display(a).split('=')[0]] = program.display(a).split('=').slice(1).join('='))
        code.source = code.source.split('"').join('') // chop quotes.
        code = JSON.stringify(code)
        // console.log(code)
      }
    } else if (c.node.type === "jsx_self_closing_element") {
      name = program.display(c.node.firstNamedChild)
      if(name === "Box") {
        // console.log()
        // console.log(program.display(c.node))

        code = program.display(c.node.namedChildren[2].namedChildren[1])
        code = code.split('"').join('') // chop quotes.

        name = program.display(c.node.namedChildren[1].namedChildren[1])
        // console.log(name, code)
        permissions = permissions.concat("g-4:resize")
      }
    } else {
      throw (
        "oh no! our query has responded on an undesired node;\n" +
        c.node.toString() +
        "\n---\n" +
        program.display(c.node)
      )
    }

    // console.log(program.display(c.node))
    // console.log(permissions)

    var appendages = {
      jsx_self_closing_element: ["<", "/>"],
      jsx_element: ["<", ">"],
    }[c.node.type] || ["", ""]
    name = appendages[0] + name + appendages[1]

    return [
      c.node.startIndex,
      c.node.endIndex,
      [],
      name,
      permissions,
      code,
    ]
  })

  var hierarchy = [0, program.source.length, [], "program", false]
  var upper_chain = [hierarchy]
  elements.forEach(e => {
    var upper = upper_chain.slice(-1)[0]

    if(e[0] < upper[0]) {
      throw(
        "oh no! our hierarchy is being processed out of order;\n" +
        JSON.stringify(elements, null, 2) +
        "\n---\n" +
        JSON.stringify(hierarchy, null, 2)
      )
    }

    while(e[1] > upper[1]) {
      upper_chain = upper_chain.slice(0, upper_chain.length - 1)
      upper = upper_chain.slice(-1)[0]
    }

    upper[2] = upper[2].concat([e])
    // upper[4] = []
    upper_chain = upper_chain.concat([e])
  })

  // const chop_arrays = (hierarchical) => {
  //     hierarchical.shift()
  //     hierarchical.shift()
  //     if(hierarchical[0].length)
  //         chop_arrays(hierarchical[0])
  // }
  // chop_arrays(hierarchy)

  callback(hierarchy)
}

export default Hierarchy
