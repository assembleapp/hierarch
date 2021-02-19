import React from "react"
import styled from "styled-components"

import Scope from "./hierarch/engine/scope"

const Bills = () => (
  <Page>
    <Header>
      <H1>Bills</H1>
      <Link href="/" >See our home page.</Link>
    </Header>

    <Column>
      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        passcode={process.env.REACT_APP_HASURA_PASSCODE}
        schema={{ bills: { '_': [ 'occurrence', 'label' ], price: "number", payer: ["name"], schedule: ['name', 'begin', 'end' ] }}}
        order={{occurrence: 'desc'}}
      >
        {model => (
          <>
          <H2>
            Sum: ${
              model.bills
              .filter(x => !x.payer)
              .reduce((x, b) => x + b.price, 0)
              .toFixed(2)
            } due
          </H2>

          {model.bills.map((b, i) => (
            <Border key={i}>
              <Clock>{b.occurrence}</Clock>
              <Schedule>{b.schedule.name}</Schedule>
              <Describe>{b.label}</Describe>
              <Describe>{b.payer && "Paid by a loan"}</Describe>
              <Price>${b.price}</Price>
            </Border>
          ))}
          </>
        )}
      </Scope>
    </Column>

    <Column>
      <Graph>Graph Coming Soon</Graph>

      <H2>Bill Reimbursal Policy</H2>
      <Markup>
        Assemble Company reimburses our employee-member's
        banking, housing, car, and medical bills,
        including as reasonable:<br/><br/>
        <li>Surgeries</li>
        <li>procedures, such as changing one's appearance</li>
        <li>Business dress</li>
        <li>Car loans</li>
        <li>Home loans and leases</li>
        <li>Meals and medicines</li>
      </Markup>
      <Markup>
        Assemble is a publicly-billed company,
        so your help is needed in sponsoring our bills due,
        as you can see here.
        <br/><br/>
        <Link href="https://github.com/assembleapp/hierarch/discussions/10">
          Please help us keep our records sensibly anonymous.
        </Link>
        <br/><br/>
        <Link href="https://assembled-donors.herokuapp.com/">
          Help pay our bills by becoming a sponsor.
        </Link>
        <br/>– as you help, you earn badges.
        <br/><br/>~ Badges Coming Soon ~
      </Markup>
    </Column>
  </Page>
)

const Markup = styled.p`
color: #d2c998;
`

const Link = styled.a`
color: #d2c998;
`

const H1 = styled.h1`
color: #d2c998;
`

const Header = styled.header`
grid-area: 1 / 1 / 1 / -1;
padding: 1rem;
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
text-align: center;
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
color: #d2c998;
`

const Border = styled.div`
border: 1px solid #2a2a2a9a;
border-top: 1px solid #2a2a2a2a;
border-bottom: 1px solid #2a2a2a2a;
margin-bottom: 2px;
padding: 1rem;
background: #d2c998;
color: #2a2a2a;
`

const Column = styled.div`
width: 24rem;
margin-left: 2rem;
`

export default Bills
