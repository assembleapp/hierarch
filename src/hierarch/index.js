import React from "react"
import styled from "styled-components"
import Logo from "./logo"
import Scope from "./scope"
import Sidebar from "./sidebar"
import Grid from "./grid"

const HierarchScope = React.createContext({
    chosen: { code: null, signal: null },
    signal: (s, code) => {},
})

class Hierarch extends React.Component {
    state = {
        open: false,
        scope: {
            code: null,
            signal: null,
        },
    }

    render = () => (
        this.state.open
        ?
        <HierarchScope.Provider value={Object.assign({}, {chosen: this.state.scope}, {
            signal: (s, code) => {
                console.log("Signal", s, code)
                this.setState({scope: { code, signal: s}})
            },
        })}>
            <Display>
                <Page>
                    {this.props.children}
                </Page>
                <Sidebar
                    close={() => this.setState({ open: false })}
                    display={(code) => this.setState({ scope: { chosen: code, signal: "display" } })}
                />
            </Display>
            {this.state.scope.signal === 'grid' && (
                <Scope
                {...JSON.parse(this.state.scope.code)}
                callback={(model, _) => console.log(model.toJSON())}
                >
                    {(model, upgrade) => (
                        <Modal>
                            <Grid
                            schema={JSON.parse(this.state.scope.code).schema}
                            model={model}
                            upgradeRecord={this.upgradeRecord(model, upgrade)}
                            />
                        </Modal>
                    )}
                </Scope>
            )}
        </HierarchScope.Provider>
        :
        <>
        {this.props.children}
        <Corner>
            <Logo
                size={20}
                repeat={100000}
                onClick={() => this.setState({ open: true })}
            />
        </Corner>
        </>
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
display: grid;
grid-template-columns: 1fr auto;
width: 100vw;
margin: 0;
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
  overflow: hidden;
  transform: scale(0.8);
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