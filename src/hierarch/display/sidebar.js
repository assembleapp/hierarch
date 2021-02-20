import React from "react"
import styled from "styled-components"
import Icon from "@mdi/react"
import { mdiClose } from "@mdi/js"
import { observable } from "mobx"
import { Observer } from "mobx-react"

import size from "../mockup/size.png"
import spacing from "../mockup/spacing.png"
import symbols from "../mockup/typography.png"
import place from "../mockup/position.png"
import dynamics from "../mockup/layout.png"

const panes = {
  size,
  spacing,
  symbols,
  place,
  dynamics,
}

class Sidebar extends React.Component {
  state = {
    scroll: 0,
  }

  render = () => (
    <Place
      place={this.props.place}
      hold={this.props.hold}
    >
      <ScrollColumn>
        <ScrollBox onChange={num => {
          console.log(num)
          this.setState({ scroll: num })
        }} />
        <Pane chosen={this.state.scroll === 0}>Hierarch</Pane>

        {Object.keys(panes).map((pane, i) => (
          <Pane chosen={this.state.scroll === (i + 1)}>{pane}</Pane>
        ))}
      </ScrollColumn>

      <Column>
        <div>
          <span>Hierarch</span>
          <Close onClick={() => this.props.close()}><Icon path={mdiClose} size={1} /></Close>
        </div>

        {this.state.scroll === 0
        ? this.props.children
        : <img
          src={panes[Object.keys(panes)[this.state.scroll - 1]]}
          alt={Object.keys(panes)[this.state.scroll - 1]}
          />
        }
      </Column>
    </Place>
  )
}

class ScrollBox extends React.Component {
  render = () => (
    <Scrollable onScroll={(e) =>
      this.props.onChange(Math.floor(e.target.scrollTop / 10) % (Object.keys(panes).length + 1))
    }>
      <Scroller/>
    </Scrollable>
  )
}

const Pane = styled.span`
color: ${({ chosen }) => chosen ? '#3a3ad4' : '#d0d0d0'};
`

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
background: #2a2a2aa0;
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
height: 8rem;
`

const Scroller = styled.div`
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
