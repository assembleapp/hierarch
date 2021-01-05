// Source: 655906f3e87bfb5529525a3f5fccb667c7f95a4b?branch=655906f3e87bfb5529525a3f5fccb667c7f95a4b
            // var child = program.display(resize_node)
            var name_query = program.query(`(jsx_self_closing_element name: (_) @name)`, resize_node)
            // console.log(name_query)
            // debug_query(name_query, program)
            var name = name_query[0].captures[0].node
            // console.log(child)
            program.replace_by_node(name, `Lens.Resize original={${program.display(name)}}`)

            // program.replace_by_indices(
            //     begin,
            //     end,
            //     `<Lens.Change source="${program.name}" code="abcd" >${
            //         concise_child
            //     }</Lens.Change>`
            // )
