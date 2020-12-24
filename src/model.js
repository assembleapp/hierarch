import graph from "./hierarch/graph"

import { observer } from "mobx-react"
// import { DateTime } from "luxon"
import { computed, observable, reaction } from "mobx"
import { types } from "mobx-state-tree"
import gql from "graphql-tag"

const Model = types.model({
    companies: types.array(types.model("Company", {
        name: types.string,
        address: types.string,
        danger: types.maybeNull(types.integer),
        labels: types.array(types.string),
    }))
})

var query = gql`
query Companies {
    companies {
      address
      danger
      labels
      name
    }
}
`

const model = Model.create({companies: []})

const check = model => response => {
    return null
}

graph.subscribe({ query }).subscribe({
    next: check(model),
    error: err => console.error("err", err),
})