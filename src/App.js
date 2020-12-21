import styled, { keyframes } from "styled-components"
import logo from './logo.svg';

function App() {
  return (
    <Box original={Layout}>
      <Box original={Header}>
        <Box original={Logo} src={logo} alt="logo" />
        <Box original={P}>
          Change <Box original={Code}>src/App.js</Box> using Hierarch.
        </Box>
        <Box original={Link} href="https://github.com/assembleapp/hierarch" target="_blank" rel="noopener noreferrer" >
          Learn Hierarch.
        </Box>
      </Box>
    </Box>
  );
}

const Code = styled.code``
const P = styled.p``

const Box = ({ original, children, ...remainder }) => {
  const Original = styled(original)`
  outline: 1px solid red;
  &:hover {
    outline-color: blue;
  }
  `
  return (
    <Original {...remainder}>
      {children}
    </Original>
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
