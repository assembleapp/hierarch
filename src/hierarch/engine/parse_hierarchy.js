import makeProgram from "./program"

const parse_hierarchy = async (source, callback) => {
  var program = await makeProgram(source)

  var blocks = pull_blocks(program)

  var hierarchy = [0, program.source.length, [], "program", false]
  var upper_chain = [hierarchy]

  // place each block on the hierarchical mesh
  blocks.forEach(e => {
    var upper = upper_chain.slice(-1)[0]

    // compare opening indices; upper blocks should be seen and processed prior.
    if(e[0] < upper[0]) {
      throw(
        "oh no! " +
        "our blocks are being processed backwards, basd on opening index;\n" +
        JSON.stringify(blocks, null, 2) +
        "\n---\n" +
        JSON.stringify(hierarchy, null, 2)
      )
    }

    // choose a chain link, `upper`;
    // so long as our block exceeds the bounds higher up the chain...
    while(e[1] > upper[1]) {
      // ...walk back up the chain
      upper_chain = upper_chain.slice(0, upper_chain.length - 1)
      upper = upper_chain.slice(-1)[0]
    }

    // append our block on the chosen chain link
    upper[2] = upper[2].concat([e])
    upper_chain = upper_chain.concat([e])
  })

  callback(hierarchy)
}

// For each `(jsx_element)` or `(jsx_self_closing_element)` in the program,
// respond using:
//
// [
//   c.node.startIndex,
//   c.node.endIndex,
//   [],
//   name,
//   permissions,
//   code,
// ]
const pull_blocks = (program) => {
  var query = program.query(`
    [(jsx_element) (jsx_self_closing_element)] @element
  `)

  return query.map(m => {
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
        [name, code] = parse_box_opening_node(program, c.node.namedChildren[0])
        permissions = permissions.concat("g-4:change")
      }

      if(name === "Scope") {
        // <Scope source="" schema={...}>...</Scope>
        //        ...attrs ->        ...
        var attrs = c.node.namedChildren[0].namedChildren.slice(1)
        attrs = attrs.filter(a => (a.children[0] && a.children[0].type) === "property_identifier")
        attrs = attrs.filter(a => ["source", "schema"].some(s => s === program.display(a.children[0])))

        code = {}
        attrs.forEach(a => code[program.display(a).split('=')[0]] = program.display(a).split('=').slice(1).join('='))
        code.source = code.source.split('"').join('') // chop quotes.
        code = JSON.stringify(code)

        permissions = permissions.concat("g-4:scope:grid")
      }

    } else if (c.node.type === "jsx_self_closing_element") {
      name = program.display(c.node.firstNamedChild)

      if(name === "Box") {
        [name, code] = parse_box_opening_node(program, c.node)
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
}

// <Box original="Label" code="0.111" >...</Box>
//    0 1.0       1.1    2.0   2.1
const parse_box_opening_node = (program, node) => {
  var name = program.display(node.namedChildren[1].namedChildren[1])
  var code = program.display(node.namedChildren[2].namedChildren[1])
    .split('"')
    .join('')

  return [name, code]
}

export default parse_hierarchy
