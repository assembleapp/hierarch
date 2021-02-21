var add_ahead = (address, program, code, block_name) => {
  console.log("adding ahead", code)
  var block = choose_block(code, program)
  var upgrades = []

  return push_upgrades(address, upgrades)
}

var add_behind = (address, program, code, block_name) => {
  console.log("adding behind", code)
  var block = choose_block(code, program)
  var upgrades = []

  return push_upgrades(address, upgrades)
}

var choose_block = (code, program) => {
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

  program.debug_query(matches)
  return matches.captures.filter(x => x.name === "element")[0]
}

var push_upgrades = (address, upgrades) => (
  fetch("http://0.0.0.0:4321/upgrade", {
    method: "POST",
    body: JSON.stringify({ address, upgrades }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then(() => {
    if(window.assemble && window.assemble.repull)
      window.assemble.repull()
  })
)

export { add_ahead, add_behind }
