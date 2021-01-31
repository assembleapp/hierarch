import React from "react"
import styled from "styled-components"

import Scope from "./hierarch/scope"

const Bills = () => (
  <Page>
    <h1>Bills</h1>

    <Column>
      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        passcode={process.env.REACT_APP_HASURA_PASSCODE}
        schema={{ bills: { '_': [ 'occurrence' ], price: "number", schedule: ['name', 'begin', 'end' ] }}}
      >
        {model => (
          model.bills.map((b, i) => (
            <Border key={i}>
              {b.occurrence} - {b.price} in {b.schedule.name}
            </Border>
          ))
        )}
      </Scope>
    </Column>

    <Column>
      <Graph></Graph>
    </Column>
  </Page>
)

const Graph = styled.div`
width: 24rem;
height: 12rem;
border-bottom: 1px solid black;
border-left: 1px solid black;
`

const Page = styled.div`
height: 100vh;
width: 100vw;
position: fixed;
overflow-y: scroll;
background: #4060a8;
display: grid;
grid-template-columns: auto 1fr;
grid-template-rows: auto 1fr;
h1 {
  grid-area: 1 / 1 / 1 / -1;
}
`

const Border = styled.div`
height: 2rem;
border: 1px solid #2a2a2a9a;
border-top: 1px solid #2a2a2a2a;
border-bottom: 1px solid #2a2a2a2a;
margin-bottom: 2px;
padding: 1rem;
background: #d2c998;
`

const Column = styled.div`
width: 18rem;
margin-left: 2rem;
`

export default Bills