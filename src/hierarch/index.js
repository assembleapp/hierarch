import React from "react"
import styled from "styled-components"

import Grid from "./grid"
import Hierarchy from "./hierarchy"
import Logo from "./logo"
import Scope from "./scope"
import Sidebar from "./sidebar"

const HierarchScope = React.createContext({
    chosen: { code: null, signal: null },
    signal: (s, code) => {},
})

class Hierarch extends React.Component {
    state = {
        address: "src/App.js",
        open: false,
        scope: {
            code: "display",
            signal: null,
        },
        mouse: {
            x: 0,
            y: 0,
            hold: false,
        },
    }

    componentDidMount() {
        document.onkeydown = e => {
            if(e.code === "Space")
              this.setState({ mouse: Object.assign(
                  this.state.mouse,
                  { hold: !this.state.mouse.hold },
              )})
        }
    }

    componentDidUpdate() {
        document.oncontextmenu = this.state.open
            ? this.secondaryClick
            : null
    }

    secondaryClick = (e) => {
        e.preventDefault()

        fetch(`http://0.0.0.0:4321/apply_boxes`, {
            method: "POST",
            body: JSON.stringify({
                address: this.state.address,
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.text())
        .then(_ => {
            var original_address = this.state.address

            // cause a re-pull on our page's hierarchy.
            this.setState({address: null})
            this.setState({address: original_address})
        })
    }

    signal = (signal, code) => {
        console.log("Signal", signal, code)
        this.setState({ scope: { code, signal } })
    }

    render = () => (
        <HierarchScope.Provider
            value={{
                open: this.state.open,
                chosen: this.state.scope,
                signal: this.signal,
            }}
        >
            <Display
                open={this.state.open}
                onMouseMove={(e) => {
                    if(this.state.open && !this.state.mouse.hold)
                        this.setState({ mouse: { x: e.clientX, y: e.clientY }})

                    var code_key = e.target
                        && typeof e.target.getAttribute === 'function'
                        ? e.target.getAttribute("data-code")
                        : null

                    if(code_key && this.state.scope.signal === "display")
                        this.signal("display", code_key)
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
                            callback={(model, _) => console.log(model.toJSON())}
                            >
                                {(model, upgrade) => (
                                    <Grid
                                    schema={JSON.parse(this.state.scope.code).schema}
                                    model={model}
                                    upgradeRecord={this.upgradeRecord(model, upgrade)}
                                    />
                                )}
                            </Scope>
                        :
                            <Hierarchy
                                address={this.state.address}
                                display={this.props.display}
                            />
                        }
                    </Sidebar>
                :
                    <Corner>
                        <Logo
                            size={20}
                            repeat={100000}
                            onClick={() => this.setState({ open: true })}
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
${({open}) => open && `
display: grid;
grid-template-columns: 1fr 12rem;
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
position: absolute;
bottom: 40px;
right: 80px;
height: 40px;
width: 40px;
`

export { HierarchScope }
export default Hierarch