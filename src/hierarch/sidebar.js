import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import { observable } from "mobx"
import { Observer } from "mobx-react"

const blocks = observable({})
const expose = (c) => {
    Object.keys(c).forEach(k => {
        blocks[k] = c[k]
    })
}
export { expose }

class Sidebar extends React.Component {
    render = () => (
        <Layout place={this.props.place} >
            <span>Hierarch</span>
            <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>

            {this.props.children}

            <Observer>
                {() => (
                    <div>
                        {Object.keys(blocks).map(b => {
                            var B = blocks[b]
                            return (
                                <div>
                                    {b}:
                                    <B>aaaa</B>
                                </div>
                                )
                        })}
                    </div>
                )}
            </Observer>
        </Layout>
    )
}

const Layout = styled.div.attrs(p => ({
    // style: {
    //     top: (p.place.y || 0) + 'px',
    //     left: 40 + (p.place.x || 0) + 'px',
    // }
}))`
// position: absolute;
width: auto;
height: auto;
// background: rgba(24, 12,   12, 40%);
padding: 0.5rem;
// color: #b1b1e2cc;
`

const Close = styled.span`
float: right;
`

export default Sidebar