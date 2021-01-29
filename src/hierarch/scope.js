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

const clock = () =>
    (Math.random() * Math.random() * 0.4 + 0.9) * 1000

class Scope extends React.Component {
    constructor(p) {
        super(p)

        this.graph = graph(p.source, p.passcode)
        this.query = this.makeQuery(p.schema)

        if(window.source !== p.source || window.schema !== JSON.stringify(p.schema) || !window.model) {
            window.source = p.source
            window.schema = JSON.stringify(p.schema)
            window.model = this.makeModel(p.schema)
        }

        this.subscribe()
    }

    makeQuery = (schema) => {
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

    makeModel = (schema) => {
        const model = types.model({
            companies: types.array(types.model("Company", {
                number: types.string,
                name: types.string,
                address: types.string,
                danger: types.maybeNull(types.integer),
                labels: types.maybeNull(types.string),
            }))
        }).actions(m => ({
            assign(name, x) { m[name] = x },
        })).create({companies: []})

        return model
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

        // autorun(() => console.log(window.model.toJSON()))
    }

    render() {
        // console.log("rendering scope", window.model.companies.length)
        return (
        <Observer>
            {() => {
                // console.log("rendering inside scope", window.model.companies.length)
                return (this.props.children(window.model))
            }}
        </Observer>
        )
    }
}

export default Scope
