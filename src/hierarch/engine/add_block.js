import push_upgrades from "./push_upgrades"

var add_ahead = (address, program, code, block_name) => {
  var block = choose_block(code, program)
  var lead = leading_spaces(program, block)
  var block_code = Math.random().toString()

  var upgrades = [{
    begin: block.startIndex,
    end: block.startIndex,
    grade:
    `<Box original={Div} code="${block_code}">\n` +
    `${lead}  click and change.\n` +
    `${lead}</Box>\n` +
    `\n` +
    `${lead}`
  }]

  return push_upgrades(address, upgrades).then(() => block_code)
}

var add_behind = (address, program, code, block_name) => {
  var block = choose_block(code, program)
  var lead = leading_spaces(program, block)
  var block_code = Math.random().toString()

  var lagging_1 = program.source.slice(block.endIndex, block.endIndex+1)

  var upgrades = [{
    begin: block.endIndex,
    end: block.endIndex,
    grade:
    `\n` +
    `\n` +
    `${lead}<Box original={Div} code="${block_code}">\n` +
    `${lead}  click and change.\n` +
    `${lead}</Box>` +
    (lagging_1 === "\n" ? '' : `\n${lead}`)
  }]


  return push_upgrades(address, upgrades).then(() => block_code)
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

  return matches[0].captures.filter(x => x.name === "element")[0].node
}

var leading_spaces = (program, block) => {
  var number_leading_spaces =
    program
    .source
    .slice(0, block.startIndex)
    .split("\n")
    .slice(-1)[0]
    .length

  return ' '.repeat(number_leading_spaces)
}

var display_surroundings = (program, block) => {
  console.log(
    program.source.slice(block.startIndex - 20, block.endIndex + 20)
  )
}

export { add_ahead, add_behind }
