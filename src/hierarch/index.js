import React from "react"
import styled from "styled-components"
import Logo from "./logo"
import Sidebar from "./sidebar"

class Hierarch extends React.Component {
    state = { open: false }

    render = () => (
        <>
        <Page>
            {this.props.children}
        </Page>
        {this.state.open
        ? <Sidebar close={() => this.setState({ open: false })} />
        : <Corner>
            <Logo
                size={20}
                repeat={2000}
                onClick={() => this.setState({ open: true })}
            />
        </Corner>
        }
        </>
    )
}

const Page = styled.div`
  height: 80vh;
  width: 80vw;
  margin: 10vh 10vw;
  overflow: hidden;
  transform: scale(0.8);
`

const Corner = styled.div`
position: absolute;
bottom: 40px;
right: 80px;
height: 40px;
width: 40px;
`

export default Hierarch