import push_upgrades from "./push_upgrades"

var apply_changes = (address, program, code, changeArray) => {
  console.log(code)

  // * choose node <Box original={...} code=${this.props.code}
  var matches = program.query(`(jsx_element
    open_tag: (
      jsx_opening_element
      name: (_) @opening-name
      attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
      )

    [(jsx_text) (jsx_element) (jsx_self_closing_element)]* @children

    close_tag: (jsx_closing_element name: (_) @closing-name)
    (#eq? @_code "code")
    (#match? @code "^.${code}.$")
    (#eq? @opening-name "Box")
    (#eq? @closing-name "Box")
  ) @element`)

  if(matches.length > 1)
    throw("oh no! more than one matching code during a change. " + code)

  program.debug_query(matches)
  var block = matches[0].captures.filter(x => x.name === "element")[0]

  // * query `(jsx_text)` opening and closing indices
  var indices = block.node.children
    .filter(x => x.type === "jsx_text")
    .map((x, i) => {
      var beginning_skip = program.display(x).search(/\S/)
      var ending_skip = program.display(x).split('').reverse().join('').search(/\S/)

      return {
        begin: x.startIndex + beginning_skip,
        end: x.endIndex - ending_skip,
        grade: changeArray[i]
      }
    })

  return push_upgrades(address, indices)
}

export default apply_changes
