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
                    {model => (
                        <Modal>
                            <Grid
                            schema={JSON.parse(this.state.scope.code).schema}
                            model={model}
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
}

const Display = styled.div`
display: grid;
grid-template-columns: 1fr auto;
width: 100vw;
margin: 0;
`

const Modal = styled.div`
position: absolute;
height: 90vh;
width: 90vw;
background: blue;
top: 5vh;
left: 5vw;
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