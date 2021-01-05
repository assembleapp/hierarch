import React from "react"
import styled from "styled-components"

import Resize from "./resize"
import { HierarchScope } from "./index"

class Box extends React.Component {
    changeableBox = React.createRef()

    render = () => {
        var { original, children, code, ...remainder } = this.props

        const Original = styled(original)`
        ${({signal}) => signal.signal === "display" && "outline: 1px solid blue;"}
        ${({signal, code}) => signal.signal === "display" && signal.code === code && "outline-color: red;"}
        `

        // code: abc123-123132
        // source file hash - content hash

        var focus_count = 0

        return (
        <HierarchScope.Consumer>
            {scope => {
                var running = (
                    scope.chosen &&
                    scope.chosen.code === code
                )

                focus_count = 0
                return children
                ? ( running && scope.chosen.signal === "change"
                    ?
                    <Original
                        ref={this.changeableBox}
                        {...remainder}
                        signal={scope.chosen}
                        code={code}
                        onClick={(e) => {
                            scope.signal('change', code)
                            if(scope.open) {
                                e.stopPropagation()
                                e.preventDefault()
                                e.bubbles = false
                                return false
                            }
                        }}
                        onMouseEnter={(e) => {
                            scope.signal('display', code)
                            e.stopPropagation()
                        }}
                        onMouseLeave={(e) => {
                            var code_key = e.relatedTarget
                            && typeof e.relatedTarget.getAttribute === 'function'
                            ? e.relatedTarget.getAttribute("data-code")
                            : null

                            if(scope.chosen.code === code)
                                scope.signal('display', code_key)
                        }}
                    >
                        {children instanceof Array
                        ? children.map(c => {
                            if(typeof(c) === 'string') {
                                return <Change
                                    focus={(e) => {
                                        if(e && focus_count === 0) {
                                            e.focus()
                                            focus_count += 1
                                        }
                                    }}
                                    record={() => this.recordChanges().then(() => scope.signal('display', null))}
                                >
                                    {c}
                                </Change>
                            }
                            return c
                        })
                        :
                        (typeof(children) === 'string'
                            ? <Change focus={e => e && e.focus()} record={() => this.recordChanges().then(() => scope.signal('display', null))}>
                                {children}
                            </Change>
                            : children
                        )
                        }
                    </Original>
                    :
                    <Original
                        {...remainder}
                        signal={scope.chosen}
                        code={code}
                        onClick={(e) => {
                            scope.signal('change', code)
                            if(scope.open) {
                                e.stopPropagation()
                                e.preventDefault()
                                e.bubbles = false
                                return false
                            }
                        }}
                        onMouseEnter={(e) => {
                            scope.signal('display', code)
                            e.stopPropagation()
                        }}
                        onMouseLeave={(e) => {
                            var code_key = e.relatedTarget
                            && typeof e.relatedTarget.getAttribute === 'function'
                            ? e.relatedTarget.getAttribute("data-code")
                            : null

                            if(scope.chosen.code === code)
                                scope.signal('display', code_key)
                        }}
                    >
                        {children}
                    </Original>
                )
                : ( running && scope.chosen.signal === "resize"
                    ?
                    <Resize
                        original={original}
                        code={code}
                        {...remainder}
                    />
                    :
                    <Original
                        {...remainder}
                        signal={scope.chosen}
                        code={code}
                        onClick={(e) => {
                            scope.signal('resize', code)
                            if(scope.open) {
                                e.stopPropagation()
                                e.preventDefault()
                                e.bubbles = false
                                return false
                            }
                        }}
                        onMouseEnter={(e) => {
                            scope.signal('display', code)
                            e.stopPropagation()
                        }}
                        onMouseLeave={(e) => {
                            var code_key = e.relatedTarget
                            && typeof e.relatedTarget.getAttribute === 'function'
                            ? e.relatedTarget.getAttribute("data-code")
                            : null

                            if(scope.chosen.code === code)
                                scope.signal('display', code_key)
                        }}
                    />
                )
            }}
        </HierarchScope.Consumer>
        )
    }

    recordChanges() {
        var changeArray = [...this.changeableBox.current.children].map((child, x) => {
            if([...child.classList].some(klass => klass === Field.toString().slice(1))) {
                return child.value
            } else {
                return { code: this.props.children[x].props.code }
            }
        })

        return fetch("http://0.0.0.0:4321/change", {
            method: "POST",
            body: JSON.stringify({
                upgrade: changeArray,
                code: this.props.code,
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(() => {
            if(window.assemble && window.assemble.repull)
                window.assemble.repull()
        })
    }
}

class Change extends React.Component {
    state = { value: null }

    render = () => {
        // console.log("rendering change:",this.props.children)
        return <Field
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            return false
        }}
        key={this.props.children}
        type="text"
        ref={e => this.props.focus(e)}
        value={this.state.value === null ? this.props.children : this.state.value}
        onChange={(e) => {
            this.setState({ value: e.target.value || "" })
        }}
        onKeyDown={(e) => {
            if(e.key === "Enter") {
                this.props.record()
                e.preventDefault();
                e.stopPropagation();
                return false
            }
        }}
        />
    }
}

const Field = styled.input.attrs({
    type: "text",
})`
background: none;
outline: none;
border: none;
display: inline;
color: inherit;
border-bottom: 1px dashed pink;
font-family: "Monaco", monospace;
font-size: inherit;
width: ${p => `${p.value.length}ch`};
`

export default Box