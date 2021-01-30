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
    let model = {}
    let builder = {}

    keys.forEach(k => {
        let inner_model = {}

        if(typeof(schema[k]) === "object") {
            let subkeys = Object.keys(schema[k]).filter(x => x !== "_")
            if(schema[k]["_"] instanceof Array) {
                subkeys = subkeys.concat(schema[k]["_"])
            }

            console.log("subkeys", subkeys)
            subkeys.forEach(sk => {
                let kind = schema[k][sk] || 'string'

                let maybeNull = false
                if(kind[kind.length -1] === "?") {
                    maybeNull = true
                    kind = kind.slice(0, kind.length - 1)
                }
                console.log('subkey', sk, kind)

                if(maybeNull)
                    inner_model[sk] = types.maybe(types[kind])
                else
                    inner_model[sk] = types[kind]
            })
        }
        console.log(inner_model)

        model[k] = types.array(types.model(k = "_singular", inner_model))
        builder["companies"] = []
    })
    if(schema["_"]) {
        keys = keys.concat(schema["_"])
    }

    console.log("keys", keys)


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
