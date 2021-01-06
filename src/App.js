import { Code, P, Box } from './hierarch/lens'
import { expose } from './hierarch/sidebar'
import Scope from './hierarch/scope'
import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Column>
      <Header>
        <Logo src={logo} alt="logo" />

        <div>
          <P>
            Change <Code>code</Code> by clicking and clacking.
          </P>

          <Link address="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
            Learn Hierarch.
          </Link>
        </div>
      </Header>

      <Scope
        source="https://assemble-opposed.herokuapp.com/v1/graphql"
        schema={{ companies: { '_': ['name', 'address' ]}}}
        // anonymous
        callback={(model, drop_clock) => {
          if(model.companies.length >= 36) {
            drop_clock('clock')
            drop_clock('big_clock')
            console.log(new Date().toISOString())
          }
        }}
      >
        {(model, _) => (
          <>
          <H3>See also:</H3>
          <Board>
            {model.companies.map((c, i) => (
              <Link key={i} address={c.address} style={{fontSize: (6 + (c.danger || 5) * 2) + 'px'}}>{c.name}</Link>
            ))}
          </Board>
          </>
        )}
      </Scope>
    </Column>
  );
}

const Board = styled.ul`
display: grid;
grid-template-columns: repeat(4, auto);
grid-row-gap: 0.2rem;
grid-column-gap: 0.6rem;
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
color: purple;
`

expose({
  Link,
  Header,
})

export default App;
