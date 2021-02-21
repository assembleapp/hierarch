import React from "react"
import styled from "styled-components"

import Change from "./display/change"
import Grid from "./display/grid"
import Hierarchy from "./display/hierarchy"
import Logo from "./display/logo"
import Sidebar from "./display/sidebar"

import makeProgram from "./engine/program"
import apply_boxes from "./engine/apply_boxes"
import Scope from "./engine/scope"
import parse_hierarchy from "./engine/parse_hierarchy"

const HierarchScope = React.createContext({
  address: null,
  open: false,
  index: null,
  chosen: { code: null, signal: null },
  signal: (s, code) => {},
})

class Hierarch extends React.Component {
  state = {
    address: "src/App.js",
    index: null,
    open: false,
    hierarchy: [0,0,[],"",false],
    scope: {
      code: null,
      signal: "display",
    },
    mouse: {
      x: 0,
      y: 0,
      scroll: 0,
      hold: false,
    },
  }

  pullSource = () => {
    fetch(`http://0.0.0.0:4321/source?address=${this.state.address}`)
      .then(response => response.text())
      .then(response => makeProgram(response))
      .then(program => {
        this.setState({ index: program })
        parse_hierarchy(program, h => this.setState({ hierarchy: h }))
      })
  }

  constructor(p) {
    super(p)
    this.pullSource()
  }

  componentDidMount() {
    if(!window.assemble || !window.assemble.repull) {
      window.assemble = {}
      window.assemble.repull = this.pullSource.bind(this)
    }

    document.onkeydown = e => {
      if(e.code === "Space") {
        e.preventDefault()
        var original_scroll = this.state.mouse.scroll
        this.setState({ mouse: Object.assign(
          this.state.mouse,
          {
            hold: !this.state.mouse.hold,
            scroll: this.state.mouse.hold
            ? 0
            : window.pageYOffset,
          },
        )})
        if(!this.state.mouse.hold) {
          window.scrollBy(0, original_scroll)
        }
      }
    }
  }

  componentWillUnmount() {
    document.onkeydown = null

    window.assemble.repull = null
    if(!Object.keys(window.assemble).length) window.assemble = null
  }

  componentDidUpdate() {
    document.oncontextmenu = this.state.open
      ? this.secondaryClick
      : null
  }

  secondaryClick = (e) => {
    e.preventDefault()
    apply_boxes(this.state.index, this.state.address)
      // .then(response => response.text())
      // .then(response => makeProgram(response))
      // .then(program => this.setState({ index: program }))
      .then(this.pullSource)
  }

  signal = (signal, code) => {
    console.log("Signal", signal, code)
    this.setState({ scope: { code, signal } })
  }

  render = () => (
    <HierarchScope.Provider
      value={{
        address: this.state.address,
        index: this.state.index,
        open: this.state.open,
        chosen: this.state.scope,
        signal: this.signal,
      }}
    >
      <Display
        hold={this.state.mouse.hold}
        scroll={this.state.mouse.scroll}
        open={this.state.open}
        onMouseMove={(e) => {
          if(this.state.open && !this.state.mouse.hold)
            this.setState({ mouse: { x: e.clientX, y: e.clientY }})

          var code_key = e.target
            && typeof e.target.getAttribute === 'function'
            ? e.target.getAttribute("data-code")
            : null

          if(
            code_key
            && ["display", "add_prior", "add_behind"].some(x => this.state.scope.signal === x)
          )
            this.signal(this.state.scope.signal, code_key)
        }}
      >
        {this.props.children}

        {this.state.open
        ?
          <Sidebar
            close={() => this.setState({ open: false })}
            display={(code) => this.signal("display", code)}
            place={this.state.mouse}
          >
            {this.state.scope.signal === 'grid'
            ?
              <Scope
              {...JSON.parse(this.state.scope.code)}
              >
                {(model, upgrade) => (
                  <Grid
                  schema={JSON.parse(this.state.scope.code).schema}
                  model={model}
                  upgradeRecord={this.upgradeRecord(model, upgrade)}
                  />
                )}
              </Scope>
            : (
              this.state.scope.signal === 'change'
              ?
                <Change.Board>
                  <Change.Color name="background-color" />
                  <Change.Color name="color" />
                  <Change.Size name="font-size" />
                  <Change.Size name="width" />
                  <Change.Size name="height" />
                </Change.Board>
              :
                <Hierarchy
                  hierarchy={this.state.hierarchy}
                  display={this.props.display}
                />
              )
            }
          </Sidebar>
        :
          <Corner>
            <Logo
              size={20}
              repeat={100000}
              onClick={() => this.setState({ open: true, mouse: { hold: false } })}
            />
          </Corner>
        }
      </Display>
    </HierarchScope.Provider>
  )

  upgradeRecord = (model, upgrade) => (rowIndex, columnId, value) => {
    var company = model.companies.toJSON()[rowIndex]
    console.log(company)
    var grade = Object.assign(
      {},
      {
        name: company.name,
        address: company.address,
        number: company.number,
      },
      { [columnId]: value },
    )

    upgrade(grade)
  }
}

const Display = styled.div`
margin: 0;
${({hold, scroll, open}) => open && hold && `
  position: fixed;
  top: ${-1 * (scroll || 0)}px;
  left: 0;
  right: 0;
  bottom: 0;
`}
`

const Modal = styled.div`
text-align: left;
position: absolute;
height: 90vh;
width: 90vw;
background: #08080a;
background: #a0a080;
top: 5vh;
left: 5vw;
overflow: scroll;
`

const Page = styled.div`
`

const Corner = styled.div`
position: fixed;
bottom: 40px;
right: 80px;
height: 40px;
width: 40px;
`

export { HierarchScope }
export default Hierarch
