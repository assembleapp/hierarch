import makeProgram from "./program"

const parse_hierarchy = async (source, callback) => {
  var program = await makeProgram(source)

  var elements = pull_blocks(program)

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
        // <Box original="Label" code="0.111" >...</Box>
        // 0 .0 -.1.0     -.-.1  -.2.0 -.-.1
        name = program.display(c.node.namedChildren[0].namedChildren[1].namedChildren[1])

        code = program.display(c.node.namedChildren[0].namedChildren[2].namedChildren[1])
        code = code.split('"').join('') // chop quotes.

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
}

export default parse_hierarchy
