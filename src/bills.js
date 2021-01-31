import React from "react"
import styled from "styled-components"

import Scope from "./hierarch/scope"

const Bills = () => (
  <>
    <h1>Bills</h1>

    <Column>
      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        passcode={process.env.REACT_APP_HASURA_PASSCODE}
        schema={{ bills: { '_': [ 'occurrence' ], price: "number" /*, schedule: ['name', 'begin', 'end' ]*/ }}}
      >
        {model => (
          model.bills.map((b, i) => (
            <Border key={i}>
              {/* {b.name} */}
              {b.occurrence} - {b.price} in ---{/* b.schedule.name */}
            </Border>
          ))
        )}
      </Scope>
    </Column>
  </>
)

const Border = styled.div`
height: 2rem;
border: 1px solid #2a2a2a9a;
border-top: 1px solid #2a2a2a2a;
border-bottom: 1px solid #2a2a2a2a;
margin-bottom: 2px;
`

const Column = styled.div`
width: 18rem;
margin-left: 2rem;
`

export default Bills