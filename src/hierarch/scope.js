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
            ? this.model.companies.concat([{ number: String(Math.random()), name: '~~~', address: 'https://example.com'}])
            : this.model.companies.slice(1)
        )
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
                return (
                    <Upgrade>
                        {g => this.props.children(this.model, g)}
                    </Upgrade>
                )
            }}
        </Observer>
        )
    }

    drop_clock = (clock_name) => {
        clearTimeout(this[clock_name])
        clearInterval(this[clock_name])
    }
}

const Upgrade = (p) => {
    var query = gql`
    mutation ($name: String, $address: String, $danger: Int, $number: uuid) {
        update_companies(where: {number: {_eq: $number}}, _set: {name: $name, address: $address, danger: $danger}) {
          affected_rows
        }
    }`
    const [upgrade_company] = useMutation(query, { client: graph })
    return p.children((grade) => {
        console.log(grade);
        upgrade_company({ variables: grade })
    })
}

export default Scope
