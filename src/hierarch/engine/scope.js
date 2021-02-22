import React from "react"

import { autorun } from "mobx"
import { types } from "mobx-state-tree"
import { Observer } from "mobx-react"

import { useMutation } from "@apollo/client";
import gql from "graphql-tag"
import graph from "./graph"

/* example schema
{ companies: {
    name: 'symbols',
    address: 'address',
    danger: 'number?',
    labels: 'symbols?',
  }
}
*/

const makeQuery = (schema, order = {}) => {
  // console.log(schema)

  let keys = Object.keys(schema) // -> 'companies'
  let model = {}
  let builder = {}

  let inner_model = []
  keys.forEach(k => {

    if(typeof(schema[k]) === "object") {
      let subkeys = Object.keys(schema[k]).filter(x => x !== "_")
      if(schema[k]["_"] instanceof Array)
        subkeys = subkeys.concat(schema[k]["_"])

      // console.log("subkeys", subkeys)
      subkeys.forEach(sk => {
        // console.log('subkey', k, "->", sk)

        if(schema[k][sk] instanceof Array) {
          let inner_inner_model = []
          let subsubkeys = schema[k][sk].filter(x => x !== "_")

          if(schema[k][sk] instanceof Array)
            subsubkeys = subsubkeys.concat(schema[k][sk]["_"] || [])

          // console.log("subsubkeys", subsubkeys)
          subsubkeys.forEach(ssk => {
            // if(kind instanceof Array) { ... }

            // console.log("subsubkey", k, "->", sk, "->", ssk)

            inner_inner_model = inner_inner_model.concat([ssk])
          })

          inner_model = inner_model.concat([`
            ${sk} {
                ${inner_inner_model.join("\n\t\t\t\t")}
            }
          `])
        } else {
            inner_model = inner_model.concat([sk])
        }
      })
    }
  })
  if(schema["_"]) {
    keys = keys.concat(schema["_"])
  }

  const order_by = "( order_by: {" + Object.keys(order).map(o => `${o}: ${order[o]}`).join(", ") + "})"
  // console.log(order_by)

  const query = gql`
  subscription ${keys[0]} {
    ${keys[0]} ${order_by} {
      ${inner_model.join("\n\t\t\t")}
    }
  }
  `
  // console.log(query.loc.source.body)
  return query
}
// window.makeQuery = makeQuery

const makeModel = (schema) => {
  // console.log(schema)

  let keys = Object.keys(schema) // -> 'companies'
  let model = {}
  let builder = {}

  keys.forEach(k => {
    // console.log("Modeling", k)
    let inner_model = {}

    if(typeof(schema[k]) === "object") {
      let subkeys = Object.keys(schema[k]).filter(x => x !== "_")
      if(schema[k]["_"] instanceof Array)
        subkeys = subkeys.concat(schema[k]["_"])

      // console.log("subkeys", subkeys)
      subkeys.forEach(sk => {
        let kind = schema[k][sk] || 'string'

        if(kind instanceof Array) {
          let inner_inner_model = {}
          let subsubkeys = schema[k][sk].filter(x => x !== "_")

          if(schema[k][sk] instanceof Array)
            subsubkeys = subsubkeys.concat(schema[k][sk]["_"] || [])

          // console.log("subsubkeys", subsubkeys)
          subsubkeys.forEach(ssk => {
            let kind = schema[k][sk][ssk] || 'string'
            // if(kind instanceof Array) { ... }
            let maybeNull = false
            if(kind[kind.length - 1] === "?") {
              maybeNull = true
              kind = kind.slice(0, kind.length - 1)
            }
            // console.log("subsubkey", k, "->", sk, "->", ssk, ":", kind, maybeNull ? "?" : "")

            if(maybeNull)
              inner_inner_model[ssk] = types.maybeNull(types[kind])
            else
              inner_inner_model[ssk] = types[kind]
          })

          // console.log(inner_inner_model)
          inner_model[sk] = types.maybeNull(types.model(k + "_singular", inner_inner_model))
        } else {
          let maybeNull = false
          if(kind[kind.length -1] === "?") {
            maybeNull = true
            kind = kind.slice(0, kind.length - 1)
          }
          // console.log('subkey', k, "->", sk, ":", kind, maybeNull ? "?" : "")

          if(maybeNull)
            inner_model[sk] = types.maybeNull(types[kind])
          else
            inner_model[sk] = types[kind]
        }
      })
    }
    // console.log(inner_model)

    model[k] = types.array(types.model(k + "_singular", inner_model))
    builder["companies"] = []
  })
  if(schema["_"]) {
    keys = keys.concat(schema["_"])
  }

  // console.log("keys", keys)


  const made = types
  .model("Model", model)
  .actions(m => ({ assign(name, x) { m[name] = x } }))
  .create(builder)

  return made
}
// window.makeModel = makeModel

class Scope extends React.Component {
  constructor(p) {
    super(p)

    this.graph = graph(p.source, p.passcode)
    this.query = makeQuery(p.schema, p.order)

    if(window.source !== p.source || window.schema !== JSON.stringify(p.schema) || !window.model) {
        window.source = p.source
        window.schema = JSON.stringify(p.schema)
        window.model = makeModel(p.schema)
    }

    this.subscribe()
  }

  subscribe() {
    this.graph.subscribe({ query: this.query }).subscribe({
      next: response => {
        Object.keys(response.data).forEach(m => {
          window.model.assign(m, response.data[m])
        })
      },
      error: err => console.error("err", err),
    })
  }

  render = () => (
    <Observer>
      {() => (this.props.children(window.model))}
    </Observer>
  )
}

export default Scope
