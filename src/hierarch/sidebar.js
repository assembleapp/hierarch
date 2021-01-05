import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import Hierarchy from "./hierarchy"

class Sidebar extends React.Component {
    state = {
        address: "src/App.js",
    }

    render = () => (
        <Layout place={this.props.place} >
            <span>Hierarch</span>
            <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>

            {
                this.props.children
                ? this.props.children
                :
                <Hierarchy
                address={this.state.address}
                display={this.props.display}
                />
            }
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
width: auto;
height: auto;
background: rgba(24, 12,   12, 40%);
padding: 0.5rem;
color: #b1b1e2cc;
`

const Close = styled.span`
float: right;
`

export default Sidebar