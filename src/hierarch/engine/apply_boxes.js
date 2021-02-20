const apply_boxes = (program) => {
  // Plan A: drop boxes.
  console.log("Plan A")
  var plan_a = 0
  // run query
  while(true) {
      program.reparse()
      var query = program.query(`
      (jsx_element
          open_tag: (
              jsx_opening_element
              name: (_) @opening-name
              attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
              attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)
          )
          close_tag: (
              jsx_closing_element
              name: (_) @closing-name
              (#eq? @closing-name "Box")
          )

          (#eq? @opening-name "Box")
          (#eq? @_original "original")
          (#eq? @_code "code")
      ) @element
      `)

      if(query.length > 0) {
          var m = query[0]
          program.debug_query([m])

          var close = m.captures.filter(c => c.name === "closing-name")[0].node
          var open = m.captures.filter(c => c.name === "opening-name")[0].node
          var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

          var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
          var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

          program.replace_by_node(close, original)
          program.replace_by_indices(open.startIndex, code_attr.endIndex, original)
          plan_a += 1
      } else {
          break
      }
  }

  // run second query
  while(true) {
      program.reparse()

      query = program.query(`
      (jsx_self_closing_element
          name: (_) @name
          attribute: (jsx_attribute (property_identifier) @_original "=" (jsx_expression (_) @original))
          attribute: (jsx_attribute (property_identifier) @_code "=" (string) @code)

          (#eq? @name "Box")
          (#eq? @_original "original")
          (#eq? @_code "code")
      ) @element
      `)
      if(query.length > 0) {
          var m = query[0]
          program.debug_query([m])

          var name = m.captures.filter(c => c.name === "name")[0].node
          var original = program.display(m.captures.filter(c => c.name === "original")[0].node)

          var code_attr = m.captures.filter(c => c.name === "_code")[0].node.parent
          var original_attr = m.captures.filter(c => c.name === "_original")[0].node.parent

          program.replace_by_indices(name.startIndex, code_attr.endIndex, original)

          plan_a += 1
      } else {
          break
      }
  }

  program.reparse()
  if(plan_a > 0) {
      fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
      return null
  }

  // Plan B: add boxes.
  console.log("Plan B")

  // begin
  var plan_b = 0
  while(true) {
      program.reparse()
      // run query
      query = program.query(`
      (jsx_element
          open_tag: (
              jsx_opening_element
              name: (_) @opening-name
          )
          close_tag: (
              jsx_closing_element
              name: (_) @closing-name
          )
          (#eq? @opening-name @closing-name)
      ) @element
      `)
      query = query.filter(m => !(m.captures.some(c => c.name === 'opening-name' && program.display(c.node) === 'Box')))
      query = query.filter(m => !(m.captures.some(c => c.name === 'opening-name' && program.display(c.node) === 'Scope')))

      if(query.length > 0) {
          var m = query[0]
          program.debug_query([m])

          const opening_name= m.captures.filter(c => c.name === "opening-name")[0].node
          const closing_name = m.captures.filter(c => c.name === "closing-name")[0].node
          const original = program.display(opening_name)

          // code: abc123-123132
          // source file hash - content hash
          program.replace_by_node(closing_name, "Box")
          program.replace_by_node(opening_name, `Box original={${original}} code="${Math.random()}"`)

          plan_b += 1
      } else {
          break
      }
  }

  while(true) {
      program.reparse()
      // run second query
      query = program.query(`
      (jsx_self_closing_element
          name: (_) @name
      ) @element
      `)
      query = query.filter(m => !(m.captures.some(c => c.name === 'name' && program.display(c.node) === 'Box')))
      query = query.filter(m => !(m.captures.some(c => c.name === 'name' && program.display(c.node) === 'br')))

      if(query.length > 0) {
          var m = query[0]
          program.debug_query([m])

          const name = m.captures.filter(c => c.name === "name")[0].node
          const original = program.display(name)

          // code: abc123-123132
          // source file hash - content hash
          program.replace_by_node(name, `Box original={${original}} code="${Math.random()}"`)

          plan_b += 1
      } else {
          break
      }
  }

  program.reparse()
  if(plan_b > 0) {
      fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
      return null
  }

  // program.reparse()
  // fs.writeFile(sourceAddress, program.source, err => { if(error) console.log(err) })
}
