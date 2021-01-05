import Scope from './hierarch/scope'
import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Layout>
      <Header>
        <Logo src={logo} alt="logo" />

        <p>
          Change <code>code</code> by clicking and clacking.
        </p>

        <Link address="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
          Learn Hierarch.
        </Link>
      </Header>

      <Header>
        <Scope
          source="https://assemble-opposed.herokuapp.com/v1/graphql"
          schema={{ companies: { '_': ['name', 'address' ]}}}
          // anonymous
          callback={(model, drop_clock) => {
            if(model.companies.length >= 144) {
              drop_clock('clock')
              drop_clock('big_clock')
              console.log(new Date().toISOString())
            }
          }}
        >
          {(model, _) => (
            <>
            <h3>See also:</h3>
            <Board>
              {model.companies.map((c, i) => (
                <Link key={i} address={c.address} style={{fontSize: (6 + (c.danger || 5) * 2) + 'px'}}>{c.name}</Link>
              ))}
            </Board>
            </>
          )}
        </Scope>
      </Header>
    </Box>
  );
}

const Board = styled.ul`
display: grid;
grid-template-columns: repeat(2, auto);
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
grid-template-columns: 1fr auto;

@media(max-width: 800px) {
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr;
}
`

const Logo = styled.img`
height: 20vmin;

@media (prefers-reduced-motion: no-preference) {
  animation: ${LogoSpin} infinite 20s linear;
}
`

const Header = styled.header`
background-color: #8ab7ab;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: #365a92;
padding: 0 4rem;
`

const Link = styled.a.attrs(p => ({
  href: p.address,
}))`
color: #365a92;
`

export default App;
