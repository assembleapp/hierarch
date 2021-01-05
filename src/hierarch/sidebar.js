import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import Hierarchy from "./hierarchy"

class Sidebar extends React.Component {
    state = {
        address: "src/App.js"
    }

    render = () => (
        <Layout place={this.props.place} >
            <span>Hierarch</span>
            <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>

            <Hierarchy
            address={this.state.address}
            display={this.props.display}
            />
        </Layout>
    )
}

const Layout = styled.div.attrs(p => ({
    style: {
        top: p.place.y + 'px',
        left: 40 + p.place.x + 'px',
    }
}))`
position: absolute;
width: 22rem;
height: auto;
background: rgba(212, 212, 212, 40%);
padding: 0.5rem;
overflow-y: scroll;
`

const Close = styled.span`
float: right;
`

export default Sidebar