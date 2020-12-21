import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Box Original={Layout}>
      <Box Original={Header}>
        <Box Original={Logo} src={logo} alt="logo" />
        <Box Original={P}>
          Change <Box Original={Code}>src/App.js</Box> using Hierarch.
        </Box>
        <Box Original={Link} href="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
          Learn Hierarch.
        </Box>
      </Box>
    </Box>
  );
}

const Code = styled.code``
const P = styled.p``

const Box = ({ Original, children, ...remainder }) => {
  const B = styled(Original)`
  outline: 1px solid red;
  &:hover {
    outline-color: blue;
  }
  `
  return (
    <B {...remainder}>
      {children}
    </B>
  )
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
