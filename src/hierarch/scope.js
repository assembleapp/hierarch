import React from "react"

import { autorun } from "mobx"
import { types } from "mobx-state-tree"
import { Observer } from "mobx-react"

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
        this.model = this.makeModel(p.schema)
        this.query = this.makeQuery(p.schema)

        if(!this.props.anonymous) {
            this.subscribe()
        } else {
            this.prepare()
            this.big_clock = setInterval(() => this.model.assign('companies', []), clock() * 200)
        }
    }

    prepare = () => {
        clearTimeout(this.clock)
        this.clock = setTimeout(this.prepare, clock())

        this.model.assign(
            'companies',
            Math.random() < 0.6
            ? this.model.companies.concat([{ name: '~~~', address: 'https://example.com'}])
            : this.model.companies.slice(1)
        )
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

        // autorun(() => console.log(this.model.toJSON()))
    }

    render() {
        return (
        <Observer>
            {() => {
                this.props.callback && this.props.callback(this.model, this.drop_clock)
                return this.props.children(this.model)
            }}
        </Observer>
        )
    }

    drop_clock = (clock_name) => {
        clearTimeout(this[clock_name])
        clearInterval(this[clock_name])
    }
}

export default Scope
