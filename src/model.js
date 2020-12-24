import graph from "./hierarch/graph"

import { autorun } from "mobx"
import { types } from "mobx-state-tree"
import gql from "graphql-tag"

const Model = types.model({
    companies: types.array(types.model("Company", {
        name: types.string,
        address: types.string,
        danger: types.maybeNull(types.integer),
        labels: types.maybeNull(types.string),
    }))
}).actions(m => ({
    assign(name, x) { m[name] = x },
}))

const model = Model.create({companies: []})

graph
.subscribe({
    query: gql`
    query Companies {
        companies {
          address
          danger
          labels
          name
        }
    }
`})
.subscribe({
    next: response => model.assign("companies", response.data.companies),
    error: err => console.error("err", err),
})

autorun(() => console.log(model.companies.toJSON()))