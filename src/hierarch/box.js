import React from "react"
import styled from "styled-components"

import Resize from "./resize"
import { HierarchScope } from "./index"

class Box extends React.Component {
    changeableBox = React.createRef()
    state = { changes: [] }

    render = () => {
        var { original, children, code, ...remainder } = this.props

        const Original = styled(original).attrs(p => ({
            "data-code": p.code,
            style: {
                outlineWidth: p.signal.signal === "display" ? "1px" : 0,
                outlineStyle: p.signal.signal === "display" ? "solid" : null,
                outlineColor: (p.signal.signal === "display" && p.signal.code === p.code) ? "red" : "blue",
            },
        }))``

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
                                    record={() => this.recordChanges(scope.index).then(() => scope.signal('display', code))}
                                    escape={() => scope.signal('display', code)}
                                >
                                    {c}
                                </Change>
                            }
                            return c
                        })
                        :
                        (typeof(children) === 'string'
                            ? <Change
                                focus={e => e && e.focus()}
                                record={() => this.recordChanges(scope.index).then(() => scope.signal('display', code))}
                                escape={() => scope.signal('display', code)}
                            >
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
                    >
                        {children instanceof Array
                        ? children.map((c, i) => (typeof(this.state.changes[i]) === 'string' ? this.state.changes[i] : c))
                        : (this.state.changes[0] || children)
                        }
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
                    />
                )
            }}
        </HierarchScope.Consumer>
        )
    }

    recordChanges(index) {
      var changeArray = [];

      // Query index, see `jsx_text` begin and end.
      [...this.changeableBox.current.children].forEach((child, x) => {
        if(
          [...child.classList].some(klass => klass === Field.toString().slice(1))
          && child.value !== this.props.children[x]
        ) {
          changeArray = changeArray.concat(child.value)
        }
      })

      // * choose node <Box original={...} code=${this.props.code}
      // * query `(jsx_text)` opening and closing indices
      // * pass indices in on `changeArray` changes
      debugger

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
            console.log(changeArray)
            this.setState({ changes: changeArray })
        })
    }
}

class Change extends React.Component {
    state = { value: null }

    render = () => (
    <Field
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
            console.log(e.key)
            if(e.key === ' ') {
                e.stopPropagation()
            }
            if(e.key === "Escape") {
                this.props.escape()
            }
            if(e.key === "Enter") {
                this.props.record()
                e.preventDefault();
                e.stopPropagation();
                return false
            }
        }}
    />
    )
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
