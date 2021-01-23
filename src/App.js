import { P, Box, Div, H1, H2 } from './hierarch/lens'
import { expose } from './hierarch/sidebar'
import Scope from './hierarch/scope'
import styled, { keyframes } from "styled-components"
import logo from './hierarch.svg'

function App() {
  return (
    <Column>
      <H1>Some big plans, by Assemble Company.</H1>

      <H2>~ already running ~</H2>

      <Block>
        <Header>
          <Logo src={logo} alt="hierarch logo" />

          <Div>
            <H3>Hierarch</H3>

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

      <H2>~ and on our horizon ~</H2>
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

      <Scope
        source="assemble-company.herokuapp.com/v1/graphql"
        schema={{ companies: { '_': ['name', 'address' ]}}}
        // anonymous
      >
        {(model) => (
          <>
          <H3>Keep building! Some similar programs:</H3>
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
          </>
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

const LogoSpin = keyframes`
// from { transform: rotate(0deg); }
// to { transform: rotate(360deg); }
`

const Column = styled.div`
// display: grid;
// grid-template-columns: 1fr auto;
// grid-template-rows: 100vh;
min-height: 100vh;

@media(max-width: 800px) {
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  min-height: 100vh;
}

background-color: #8ab7ab;
// min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
color: #365a92;
padding: 0 4rem;
`

const Logo = styled.img`
height: 100%;
margin-right: 2rem;
@media (prefers-reduced-motion: no-preference) {
  animation: ${LogoSpin} infinite 20s linear;
}
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
color: #365a92;
`

const H3 = styled.h3`
margin-top: 2rem;
margin-bottom: 0;
// color: purple;
`

expose({
  Link,
  Header,
})

export default App;
