import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import Hierarchy from "./hierarchy"

class Sidebar extends React.Component {
    state = {
        hierarchy: {},
        address: "src/App.js"
    }

    componentDidMount = () => (
        this.pullHierarchy(this.state.address)
    )

    pullHierarchy = (address) => {
        fetch(`http://0.0.0.0:4321/hierarchy?address=${address}`, {
            method: "GET",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.text())
        .then(response => this.setState({
            hierarchy: Object.assign(
                {},
                this.state.hierarchy,
                { [address]: JSON.parse(response) },
        )}))
    }

    render = () => (
        <Layout>
            <span>Hierarch</span>
            <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>

            <Hierarchy h={this.state.hierarchy[this.state.address] || [0,0,[],""]} />
        </Layout>
    )
}

const Layout = styled.div`
width: 22rem;
height: auto;
position: absolute;
top: 0;
bottom: 0;
right: 0;
background: rgba(212, 212, 212, 40%);
padding: 0.5rem;
overflow-y: scroll;
`

const Close = styled.span`
float: right;
`

export default Sidebar