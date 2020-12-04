import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Layout>
      <Header>
        <Logo src={logo} alt="logo" />
        <p onClick={() => {
          fetch("http://0.0.0.0:4321/go", {
            method: "POST",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
          })
          .then(response => response.text())
          .then(response => console.log(response))
        }}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Link
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </Link>
      </Header>
    </Layout>
  );
}

const LogoSpin = keyframes`
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
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

const Link = styled.a.attrs({
  a: "b"
})`
color: #61dafb;
`

export default App;
