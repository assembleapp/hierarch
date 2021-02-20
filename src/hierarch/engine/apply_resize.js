
const apply_resize = async (program, address, code, width, height) => {
  var upgrades = []

  console.log(
    "HOLD UP!\n" +
    "Serious insecure code here; by passing a sneaky `code` param,\n" +
    "someone could hack our parser's query."
  )

  var original_matches = program.query(`
  (
    jsx_self_closing_element
    name: (_) @name
    attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
    attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
    (#eq? @name "Box")
    (#eq? @_original "original")
    (#eq? @_code "code")
    (#match? @code "^.${code}.$")
  ) @element
  `)
  // program.debug_query(original_matches)
  if(original_matches.length > 1) {
    program.debug_query(original_matches)
    throw `oh no! more than 1 match`
  }
  if(original_matches.length < 1) {
    program.debug_query(original_matches)
    throw `oh no! no match`
  }
  var original_name = program.display(original_matches[0].captures.filter(c => c.name === "original")[0].node)
  // console.log(original_name)

  var matches = program.query([
  `(
    variable_declarator
    (identifier) @name
    "="
    (call_expression
        function: (member_expression
            object: (identifier) @_styled
            property: (property_identifier) @property
            (#eq? @_styled "styled")
        )
        arguments: (template_string) @css
    )
    ${original_name && `(#eq? @name "${original_name}")` || ""}
  )`,
  `(
    variable_declarator
    (identifier) @name
    "="
    (call_expression
      function: (call_expression
        function: (member_expression
          object: (member_expression
            object: (identifier) @_styled
            property: (property_identifier) @property
            (#eq? @_styled "styled")
          )
          property: (property_identifier) @attrs
          (#eq? @attrs "attrs")
        )
        arguments: (arguments
          (object) @attributes
        )
      )
      arguments: (template_string) @css
    )
  )`,
  `(
    variable_declarator
    (identifier) @name
    "="
    (call_expression
      function: (call_expression
        function: (identifier) @_styled
        arguments: (arguments (_) @base)
      )
      arguments: (template_string) @css
      (#eq? @_styled "styled")
    ) @expr
    ${original_name && `(#eq? @name "${original_name}")` || ""}
  )`
  ])
  // program.debug_query(matches)

  const css_string = matches.slice(-1)[0].captures.slice(-1)[0].node

  var css = await program.load_language(`/tree-sitter-css.wasm`)
  var css_node = program.parse_range_as_language(
    css_string.startIndex + 1,
    css_string.endIndex - 1,
    css,
  ).rootNode

  var query = program.query(`
  (stylesheet
    (declaration (property_name) @prop (_) @value)
    (#eq? @prop "height")
  )
  `, css_node, 'css')
  if(query[0] && query[0].captures[1]) {
    program.replace_by_node(query[0].captures[1].node, height)
  } else {
    program.replace_by_indices(css_string.startIndex + 1, css_string.startIndex + 1, `\nheight: ${height};`)
  }

  var query = program.query(`
  (stylesheet
    (declaration (property_name) @prop (_) @value)
    (#eq? @prop "width")
  )
  `, css_node, 'css')
  if(query[0] && query[0].captures[1]) {
    program.replace_by_node(query[0].captures[1].node, width)
  } else {
    program.replace_by_indices(css_string.startIndex + 1, css_string.startIndex + 1, `\nwidth: ${width};`)
  }
  program.use_language('js')

  return push_upgrades(upgrades, address)
}

const push_upgrades = (upgrades, address) => {
  upgrades.sort((x, y) => x.begin < y.begin ? -1 : 1)

  return fetch("http://0.0.0.0:4321/upgrade", {
    method: "POST",
    body: JSON.stringify({ address, upgrades }),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
}

export default apply_resize
