import { P, Box, Code, Div, H1, S } from './hierarch/display/lens'
import { expose } from './hierarch/display/sidebar'

import Scope from './hierarch/engine/scope'
import styled, { keyframes } from "styled-components"
import logo from './hierarch.svg'

function App() {
  return (
    <Column>
      <H1>Some big plans</H1>
      ...by Assemble Company.

      <H2>~ already running ~</H2>

      <Block>
        <Header>
          <Logo src={logo} alt="hierarch logo" />

          <Div>
            <H3>Hierarch!</H3>

            <P>
              A programming engine breaking many rules –<br/>
              change code by clicking and clacking.
            </P>

            <Link address="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
              Read our engine's code and raise issues.
            </Link>
          </Div>
        </Header>
      </Block>

      <H2>~ on our horizon ~</H2>
      <Pair>
        <Block>
          <H3>Copper</H3>

          <P>
            Chromium rules our modern machines.
            Copper's goal is a more malleable end-user layer,
            making online programs more dynamic and mesmerizing.
          </P>
        </Block>

        <Block>
          <H3>Greenhouse</H3>

          <P>
            A booming garden and nursery helping machine kernels
            reach rigorous uses and rich ends.
            Inspired by code a couple decades old
            on <Link address="https://kernel.org">Kernel.org</Link>.
          </P>
        </Block>
      </Pair>

      <H2>~ and our long roadmap ~</H2>
      <San>
        <Block>
          No more `<Code>git</Code>`s in our codebases.
        </Block>

        <Block>
          Process legal code and recommend changes.
        </Block>

        <Block>
          Keep people's records more secure online.
        </Block>
      </San>

      <H2>Your <S>money</S> help is needed.</H2>
      Become a sponsor and help keep our program running.

      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        passcode={process.env.REACT_APP_HASURA_PASSCODE}
        schema={{ companies: { '_': [ 'number', 'name', 'address' ], danger: "integer?"}}}
        order={{danger: 'desc', name: 'asc'}}
      >
        {(model) => (
          <Margin>
            {model.companies.length > 0 &&
              <>
                <H3>Keep building!</H3>
                ...using some similar programs:
              </>
            }
            <Board>
              {model.companies.map((c, i) => (
                <Link
                  key={i}
                  address={c.address}
                  style={{fontSize: (6 + (c.danger || 5) * 2) + 'px'}}
                  target="_blank"
                >
                  {c.name}
                </Link>
              ))}
            </Board>
          </Margin>
        )}
      </Scope>
    </Column>
  );
}

const Pair = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
grid-gap: 2rem;
width: 40rem;
`

const San = styled(Pair)`
grid-template-columns: repeat(3, 1fr);
`

const Block = styled.div`
border: 2px solid purple;
border-radius: 6px;
padding: 2rem;
overflow: hidden;
background: #2a2a2a2a;
`

const Board = styled.ul`
display: grid;
grid-template-columns: repeat(4, auto);
grid-row-gap: 0.2rem;
grid-column-gap: 0.6rem;
text-align: center;
`

const Column = styled.div`
min-height: 100vh;

@media(max-width: 800px) {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
}

background: rgb(15,12,73);
background: linear-gradient(0deg, rgba(15,12,73,1) 0%, rgba(16,116,181,1) 23%, rgba(26,228,202,1) 100%);
color: #2209a4;

display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 0 4rem;
`

const Logo = styled.img`
height: 100%;
margin-right: 2rem;
`

const Header = styled.header`
display: flex;
flex-direction: row;
font-size: 1rem;
height: 6rem;
align-items: flex-end;
`

const Link = styled.a.attrs(p => ({
  href: p.address,
}))`
color: #ccc3da;
`

const H2 = styled.h2`
color: #6502ff;
`

const H3 = styled.h3`
margin: 0;
`

const Margin = styled.div`
margin-top: 2rem;
text-align: center;
`

expose({
  Link,
  Header,
})

export default App;
