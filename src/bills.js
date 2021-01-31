import React from "react"
import styled from "styled-components"

import Scope from "./hierarch/scope"

const Bills = () => (
  <Page>
    <H1>Bills</H1>

    <Column>
      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        passcode={process.env.REACT_APP_HASURA_PASSCODE}
        schema={{ bills: { '_': [ 'occurrence', 'label' ], price: "number", payer: ["name"], schedule: ['name', 'begin', 'end' ] }}}
      >
        {model => (
          <>
          <H2>Sum: ${model.bills.filter(x => !x.payer_number).reduce((x, b) => x + b.price, 0).toFixed(2)} due</H2>

          {model.bills.map((b, i) => (
            <Border key={i}>
              <Clock>{b.occurrence}</Clock>
              <Schedule>{b.schedule.name}</Schedule>
              <Describe>{b.label}</Describe>
              <Describe>{b.payer && "Paid by " + b.payer.name}</Describe>
              <Price>${b.price}</Price>
            </Border>
          ))}
          </>
        )}
      </Scope>
    </Column>

    <Column>
      <Graph></Graph>
    </Column>
  </Page>
)

const H1 = styled.h1`
grid-area: 1 / 1 / 1 / -1;
color: #d2c998;
padding: 0.5em;
`

const H2 = styled(H1)`
font-size: 0.8em;
`

const Clock = styled.span`
color: grey;
font-size: 0.6rem;
`

const Schedule = styled.span`
float: right;
color: grey;
`

const Price = styled.div`
text-align: right;
`

const Describe = styled.div`
margin-top: 0.5rem;
`

const Graph = styled.div`
width: 24rem;
height: 12rem;
border-bottom: 1px solid #d2c998;
border-left: 1px solid #d2c998;
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

`

const Border = styled.div`
border: 1px solid #2a2a2a9a;
border-top: 1px solid #2a2a2a2a;
border-bottom: 1px solid #2a2a2a2a;
margin-bottom: 2px;
padding: 1rem;
background: #d2c998;
`

const Column = styled.div`
width: 24rem;
margin-left: 2rem;
`

export default Bills