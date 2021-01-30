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

const makeQuery = (schema) => {
    console.log(schema)
    return gql`
    subscription Companies {
        companies(order_by: {danger: desc, name: asc}) {
          number
          address
          danger
          labels
          name
        }
    }`
}

const makeModel = (schema) => {
    console.log(schema)

    let keys = Object.keys(schema) // -> 'companies'
    keys.forEach(k => {
        if(typeof(schema[k]) === "object") {
          let subkeys = Object.keys(schema[k]).filter(x => x !== "_")
          if(schema[k]["_"] instanceof Array) {
              subkeys = subkeys.concat(schema[k]["_"])
          }
          console.log("subkeys", subkeys)
          subkeys.forEach(sk => {
              let kind = schema[k][sk] || 'string'
              console.log('subkey', sk, kind)
          })
        }
    })
    if(schema["_"]) {
        keys = keys.concat(schema["_"])
    }

    console.log("keys", keys)

    let model = {}
    let company = {}

    company["number"] = types.string
    company["name"] = types.string
    company["address"] = types.string
    company["danger"] = types.maybeNull(types.integer)

    let builder = {}
    builder["companies"] = []

    model['companies'] = types.array(types.model("Company", company))
    const made = types
    .model("Model", model)
    .actions(m => ({ assign(name, x) { m[name] = x } }))
    .create(builder)

    return made
}

const clock = () =>
    (Math.random() * Math.random() * 0.4 + 0.9) * 1000

class Scope extends React.Component {
    constructor(p) {
        super(p)

        this.graph = graph(p.source, p.passcode)
        this.query = makeQuery(p.schema)

        // if(window.source !== p.source || window.schema !== JSON.stringify(p.schema) || !window.model) {
            window.source = p.source
            window.schema = JSON.stringify(p.schema)
            window.model = makeModel(p.schema)
        // }

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
