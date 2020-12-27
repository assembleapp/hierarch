import Lens, { Code, P, Box } from './hierarch/lens'
import Scope from './hierarch/scope'
import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Box original={Layout} code="abc1">
      <Box original={Header} code="abc2">
        <Box original={Logo} code="abc31" src={logo} alt="logo" />

        <Box original={P} code="abc4">
          Change <Box original={Code} code="abc5">code</Box> by clicking and clacking.
        </Box>

        <Box original={Link} code="abc6" address="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
          Learn Hierarch.
        </Box>
      </Box>

      <Header>
        <Scope
          source="https://assemble-opposed.herokuapp.com/v1/graphql"
          schema={{ companies: { '_': ['name', 'address' ]}}}
          anonymous
          callback={(model, drop_clock) => {
            if(model.companies.length >= 144) {
              drop_clock('clock')
              drop_clock('big_clock')
              console.log(new Date().toISOString())
            }
          }}
        >
          {model => (
            <Board>
              {model.companies.map((c, i) => (
                <Link key={i} address={c.address}>{c.name}</Link>
              ))}
            </Board>
          )}
        </Scope>
      </Header>
    </Box>
  );
}

const Board = styled.ul`
display: grid;
grid-template-columns: repeat(12, auto);
grid-template-rows: repeat(12, 1fr);
grid-row-gap: 0.2rem;
grid-column-gap: 0.2rem;
`

const LogoSpin = keyframes`
// from { transform: rotate(0deg); }
// to { transform: rotate(360deg); }
`

const Layout = styled.div`
text-align: center;
display: grid;
grid-template-columns: auto 1fr;
`

const Logo = styled.img`
height: 40vmin;

@media (prefers-reduced-motion: no-preference) {
  animation: ${LogoSpin} infinite 20s linear;
}
`

const Header = styled.header`
background-color: #bda862;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: #0d408e;
`

const Link = styled.a.attrs(p => ({
  href: p.address,
}))`
`

export default App;
