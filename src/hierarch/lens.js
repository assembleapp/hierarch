import React from "react"
import styled from "styled-components"

class Change extends React.Component {
    state = { value: null }

    render = () => (
        <Field
        key={this.props.children}
        ref={(e) => e ? e.focus() : null}
        type="text"
        value={this.state.value === null ? this.props.children : this.state.value}
        onChange={(e) => {
            this.setState({ value: e.target.value || "" })
        }}
        onKeyDown={(e) => {
            if(e.key !== "Enter") return true

            fetch("http://0.0.0.0:4321/change", {
                method: "POST",
                body: JSON.stringify({
                    upgrade: this.state.value || this.props.children,
                    source: this.props.source,
                    code: this.props.code,
                }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            // .then(response => response.text())
            // .then(response => console.log(response))
            .then(() => {
                if(window.assemble && window.assemble.repull)
                    window.assemble.repull()
            })

            e.preventDefault();
            e.stopPropagation();
            return false
        }}
        />
    )
}

class Box extends React.Component {
    state = {
        clicked: false,
    }

    render = () => {
        var { original, children, code, ...remainder } = this.props

        const Original = styled(original).attrs({
            onClick: (e) => {
                this.setState({clicked: true})
                e.stopPropagation()
            }
        })`
        outline: 1px solid red;
        &:hover {
        outline-color: blue;
        }
        `
        // console.log('rendering Box:', code, this.state)

        // code: abc123-123132
        // source file hash - content hash

        // image or block element?
        // -> resize
        // has text children?
        // -> <Change>...</>
        return (
            this.state.clicked
            ?
            <Resize original={original} code={code} {...remainder}>
                {children}
            </Resize>
            :
            <Original {...remainder}>
                {children}
            </Original>
        )
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

class Resize extends React.Component {
    state = {
        height: null,
        width: null,
    }

    constructor(p) {
        super(p)
        this.component = styled(p.original).attrs(p => {
            var styles = {}
            styles.height = p.height || null
            styles.width = p.width || null
            return { style: styles }
        })``
    }

    render = () => {
        const Component = this.component

        return (
            <ResizeBox {...this.state}>
                <Corner resize={dimensions => this.setState(dimensions)} recordSize={this.recordSize.bind(this)} x={-1} y={-1} />
                <Corner resize={dimensions => this.setState(dimensions)} recordSize={this.recordSize.bind(this)} x={-1} y={1} />
                <Corner resize={dimensions => this.setState(dimensions)} recordSize={this.recordSize.bind(this)} x={1} y={-1} />
                <Corner resize={dimensions => this.setState(dimensions)} recordSize={this.recordSize.bind(this)} x={1} y={1} />
                <Component {...this.state} {...this.props} />
            </ResizeBox>
        )
    }

    recordSize = () => {
        fetch("http://0.0.0.0:4321/resize", {
            method: "POST",
            body: JSON.stringify({
                width: this.state.width,
                height: this.state.height,
                code: this.props.code,
            }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        // .then(response => response.text())
        // .then(response => console.log(response))
        .then(() => {
            // if(window.assemble && window.assemble.repull)
            //     window.assemble.repull()
        })
    }
}

var original_mouseX = 0
var original_mouseY = 0
// var element_original_x = 0
// var element_original_y = 0
var element_original_width = 0
var element_original_height = 0

const resize = p => e => {
    var mouseX = e.pageX
    var mouseY = e.pageY
    var new_width = 0
    var new_height = 0
    // var new_x = 0
    // var new_y = 0

    var width_scaling_factor = 2
    var height_scaling_factor = 1

    // bottom-right:
    if(p.x > 0 && p.y > 0) {
        new_width = element_original_width + width_scaling_factor * (mouseX - original_mouseX)
        new_height = element_original_height - height_scaling_factor * (mouseY - original_mouseY)
    }
    // bottom-left:
    if(p.x < 0 && p.y > 0) {
        new_width = element_original_width - width_scaling_factor * (mouseX - original_mouseX)
        new_height = element_original_height - height_scaling_factor * (mouseY - original_mouseY)
        // new_x = element_original_x - (mouseX - original_mouseX)
    }
    // top-right:
    if(p.x > 0 && p.y < 0) {
        new_width = element_original_width + width_scaling_factor * (mouseX - original_mouseX)
        new_height = element_original_height + height_scaling_factor * (mouseY - original_mouseY)
        // new_y = element_original_y + (mouseY - original_mouseY)
    }
    // top-left:
    if(p.x < 0 && p.y < 0) {
        new_width = element_original_width - width_scaling_factor * (mouseX - original_mouseX)
        new_height = element_original_height + height_scaling_factor * (mouseY - original_mouseY)
        // new_x = element_original_x + (mouseX - original_mouseX)
        // new_y = element_original_y + (mouseY - original_mouseY)
    }

    p.resize({width: `${new_width}px`, height: `${new_height}px`})
}

const endResize = (resizer, recordSize) => () => {
    window.removeEventListener('mousemove', resizer)
    window.removeEventListener('mouseup', recordSize)
}


const ResizeBox = styled.div`
border: 1px dashed #a0a0c0;
overflow: hidden;
position: relative;
overflow: visible;
`

const Corner = styled.span.attrs(p => ({
    onMouseDown: (e) => {
        e.preventDefault()
        original_mouseX = e.pageX
        original_mouseY = e.pageY
        // element_original_x = e.target.parentElement.getBoundingClientRect().left
        // element_original_y = e.target.parentElement.getBoundingClientRect().bottom
        element_original_width = e.target.parentElement.getBoundingClientRect().width
        element_original_height = e.target.parentElement.getBoundingClientRect().height
        var resizer = resize(p)
        window.addEventListener('mousemove', resizer)
        window.addEventListener('mouseup', p.recordSize)
        window.addEventListener('mouseup', endResize(resizer, p.recordSize))
    },
    onClick: (e) => { e.stopPropagation() },
}))`
position: absolute;
height: 1rem;
width: 1rem;
background-color: rgba(128,128,212,0.2);
border: 1px solid darkgrey;
border-radius: 50%;
${p => p.x > 0 ? "right" : "left"}: -0.5rem;
${p => p.y > 0 ? "top" : "bottom"}: -0.5rem;
cursor: ${p => p.x === p.y ? "nesw" : "nwse"}-resize;
`

const Lens = { Change, Resize }

const Code = styled.code``
const P = styled.p``

export { Code, P, Box }
export default Lens