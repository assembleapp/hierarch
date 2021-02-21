import React from "react"
import styled, { css } from "styled-components"

import Resize from "./resize"
import apply_changes from "../engine/apply_changes"
import { HierarchScope } from "../index"

class Box extends React.Component {
  changeableBox = React.createRef()
  state = { changes: [] }

  render = () => {
    var { original, children, code, ...remainder } = this.props

    var add_icon = `
      font-size: 1.6rem;
      border: 2px solid #ccc3da;
      border-radius: 50%;
      display: block;
      width: 1.2rem;
      height: 1.2rem;
      content: "+";
      align-self: center;
      color: #ccc3da;
      text-align: center;
      line-height: 1rem;
    `

    const Original = styled(original).attrs(p => ({
      "data-code": p.code,
      style: {
        outlineWidth: p.signal.signal === "display" ? "1px" : 0,
        outlineStyle: p.signal.signal === "display" ? "solid" : null,
        outlineColor: (p.signal.signal === "display" && p.signal.code === p.code) ? "red" : "blue",
      },
    }))`
    ${p => (p.signal.signal === "add_prior" && p.signal.code === p.code)
      && css`&:before {${add_icon}}
    `}
    ${p => (p.signal.signal === "add_behind" && p.signal.code === p.code)
      && css`&:after {${add_icon}}
    `}
    `

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
            ? children.map((c, i) => {
              if(typeof(c) === 'string') {

                return (
                  <Change
                    key={i}
                    focus={(e) => {
                      console.log('focusing?', focus_count, c)
                      if(e && focus_count === 0) {
                        e.focus()
                        focus_count += 1
                      }
                    }}
                    record={() => this.recordChanges(scope.address, scope.index).then(() => scope.signal('display', code))}
                    escape={() => scope.signal('display', code)}
                  >
                    {c}
                  </Change>
                )
              }
              return c
            })
            :
            (typeof(children) === 'string'
              ? <Change
                focus={e => e && e.focus()}
                record={() => this.recordChanges(scope.address, scope.index).then(() => scope.signal('display', code))}
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
            ? (() => {
              var child_index = 0
              return children.map((c, i) => {
                if(typeof(c) === 'string' && this.state.changes[child_index]) {
                  child_index += 1
                  return this.state.changes[child_index - 1]
                }
                return c
              })
            })()
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

  recordChanges(address, index) {
    var changeArray = [];

    // Group all possibly-changed values
    [...this.changeableBox.current.children].forEach((child, x) => {
      if(
        [...child.classList]
        .some(klass => klass === Field.toString().slice(1))
      )
        changeArray = changeArray.concat(child.value)
    })

    return (
      apply_changes(address, index, this.props.code, changeArray)
      .then(() => this.setState({ changes: changeArray }))
    )
  }
}

class Change extends React.Component {
  state = { value: null }

  shouldComponentUpdate = (incomingProps, incomingState) => (
    incomingProps.children !== this.props.children ||
    this.state.value !== incomingState.value
  )

  render = () => (
  <Field
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      return false
    }}

    onChange={(e) => {
      this.setState({ value: e.target.value || "" })
    }}

    key={this.props.children}
    type="text"
    ref={e => this.props.focus(e)}
    value={this.state.value === null ? this.props.children : this.state.value}

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
