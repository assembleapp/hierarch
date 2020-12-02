import React from "react"
import styled from "styled-components"
import Logo from "./logo"
import Sidebar from "./sidebar"

class Hierarch extends React.Component {
    state = { open: false }

    render = () => (
        this.state.open
        ? <Sidebar close={() => this.setState({ open: false })}>
            * a
                - b
                - c
                    . 1
                    . 2
                    . 3
        </Sidebar>
        : <Corner>
            <Logo
                size={20}
                repeat={2000}
                onClick={() => this.setState({ open: true })}
            />
        </Corner>
    )
}


const Corner = styled.div`
position: absolute;
bottom: 40px;
right: 80px;
height: 40px;
width: 40px;
`

export default Hierarch