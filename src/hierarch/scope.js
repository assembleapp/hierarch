import React from "react"
import graph from "./graph"

import { autorun } from "mobx"
import { types } from "mobx-state-tree"
import gql from "graphql-tag"

/* example schema
{ companies: {
        name: 'string',
        address: 'string',
        danger: 'number?',
        labels: 'string?',
        }
    }
*/

const makeQuery = (schema) => {
    return gql`
    query Companies {
        companies {
          address
          danger
          labels
          name
        }
    }`
}

const makeModel = (schema) => {
    return types.model({
        companies: types.array(types.model("Company", {
            name: types.string,
            address: types.string,
            danger: types.maybeNull(types.integer),
            labels: types.maybeNull(types.string),
        }))
    }).actions(m => ({
        assign(name, x) { m[name] = x },
    }))
    .create({companies: []})
}

class Scope extends React.createClass {
    constructor(p) {
        super(p)
        this.model = makeModel(p.schema)
        this.query = makeQuery(p.schema)
        this.subscribe()
    }

    subscribe() {
        graph.subscribe({ this.query }).subscribe({
            next: response => {
                Object.keys(response.data).forEach(m => {
                    this.model.assign(m, response.data[m])
                })
            },
            error: err => console.error("err", err),
        })

        autorun(() => console.log(model.companies.toJSON()))
    }

    render() {
        return this.props.children(this.model)
    }
}
