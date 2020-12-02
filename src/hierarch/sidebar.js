import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"

const Sidebar = ({ close }) => (
    <Layout>
        <span>Hierarch</span>
        <Close onClick={() => close()}><Icon path={mdiClose} size={1} /></Close>
    </Layout>
)

const Layout = styled.div`
width: 10rem;
height: auto;
position: absolute;
top: 0;
bottom: 0;
right: 0;
background: rgba(212, 212, 212, 40%);
padding: 0.5rem;
`

const Close = styled.span`
float: right;
`

export default Sidebar