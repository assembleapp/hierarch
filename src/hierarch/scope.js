import React from "react"

import { autorun } from "mobx"
import { types } from "mobx-state-tree"
import { Observer } from "mobx-react"

import gql from "graphql-tag"
import graph from "./graph"

/* example schema
{ companies: {
        name: 'string',
        address: 'string',
        danger: 'number?',
        labels: 'string?',
        }
    }
*/

class Scope extends React.Component {
    constructor(p) {
        super(p)
        this.model = this.makeModel(p.schema)
        this.query = this.makeQuery(p.schema)

        if(!this.props.anonymous) {
            this.subscribe()
        } else {
            this.model.assign('companies', [{ name: '~~~', address: 'https://example.com'}])
        }
    }

    makeQuery = (schema) => {
        return gql`
        subscription Companies {
            companies(order_by: {name: asc}) {
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
        graph.subscribe({ query: this.query }).subscribe({
            next: response => {
                Object.keys(response.data).forEach(m => {
                    this.model.assign(m, response.data[m])
                })
            },
            error: err => console.error("err", err),
        })

        autorun(() => console.log(this.model.toJSON()))
    }

    render() {
        return <Observer>{() => this.props.children(this.model)}</Observer>
    }
}

export default Scope
