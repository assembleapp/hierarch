import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Layout>
      <Header>
        <Logo src={logo} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Link href="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
          Learn Hierarch.
        </Link>
      </Header>
    </Layout>
  );
}

const LogoSpin = keyframes`
// from { transform: rotate(0deg); }
// to { transform: rotate(360deg); }
`

const Layout = styled.div`
text-align: center;
`

const Logo = styled.img`
height: 40vmin;
pointer-events: none;

@media (prefers-reduced-motion: no-preference) {
  animation: ${LogoSpin} infinite 20s linear;
}
`

const Header = styled.header`
background-color: #282c34;
min-height: 100vh;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
font-size: calc(10px + 2vmin);
color: white;
`

const Link = styled.a`
color: #61dafb;
`

export default App;
