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
    state = {
        scroll: 0,
    }

    render = () => (
        <Place
            place={this.props.place}
            hold={this.props.hold}
            onScroll={(e) => {
                debugger
            }}
        >
            <ScrollColumn>
                <ScrollBox onChange={num => this.setState({ scroll: num })} />
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
            </ScrollColumn>

            <Column>
                <span>Hierarch</span>
                <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>

                {this.props.children}
            </Column>
        </Place>
    )
}

class ScrollBox extends React.Component {
    handleScroll(e) {
        console.log('scrolling')
        debugger
    }

    render = () => (
        <Scrollable onScroll={this.handleScroll}>
            <Scroller/>
        </Scrollable>
    )
}

const Place = styled.div.attrs(p => ({
    style: {
        top: -20 + (p.place.y || 0) + 'px',
        left: (p.place.hold ? -20 : 40) + (p.place.x || 0) + 'px',
        overflowY: p.place.hold ? 'scroll' : 'hidden',
    }
}))`
display: flex;
flex-direction: row;
align-items: flex-start;
::-webkit-scrollbar {
    display: none;
}
width: auto;
height: auto;
position: fixed;
`

const BaseColumn = styled.div`
background: #2a2a2a60;
color: #b1b1e2cc;
`

const Column = styled(BaseColumn)`
padding: 0.5rem;
`

const ScrollColumn = styled(Column)`
position: relative;
overflow: hidden;
display: flex;
flex-direction: column;
justify-content: space-between;
height: 6rem;
`

const Scroller = styled.div`
background: #2a2a2a88;
width: 100%;
height: 10000px;
display: flex;
flex-direction: column;
`
const Scrollable = styled.div`
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
overflow-y: scroll;
::-webkit-scrollbar {
    display: none;
}
`

const Close = styled.span`
float: right;
`

export default Sidebar