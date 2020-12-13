import React from "react"
import styled from "styled-components"

class Change extends React.Component {
    state = { value: null }

    render = () => (
        <Field
        key={this.props.children}
        ref={(e) => e ? e.focus() : null}
        type="text"
        value={this.state.value || this.props.children}
        onChange={(e) => {
            this.setState({ value: e.target.value })
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
        height: "10rem",
        width: "10rem",
    }

    render = () => {
        const Component = styled(this.props.class)`
        height: ${(p) => p.height};
        width: ${(p) => p.width};
        `

        return (
            <ResizeBox {...this.state}>
                <Corner onResize={dimensions => this.setState(dimensions)} x={-1} y={-1} />
                <Corner onResize={dimensions => this.setState(dimensions)} x={-1} y={1} />
                <Corner onResize={dimensions => this.setState(dimensions)} x={1} y={-1} />
                <Corner onResize={dimensions => this.setState(dimensions)} x={1} y={1} />
                <Component {...this.state} {...this.props} />
            </ResizeBox>
        )
    }
}

var original_mouseX = 0
var original_mouseY = 0
var element_original_x = 0
var element_original_y = 0
var element_original_width = 0
var element_original_height = 0

const resize = p => e => {
    var mouseX = e.pageX
    var mouseY = e.pageY
    var new_width = 0
    var new_height = 0
    var new_x = 0
    var new_y = 0


    // bottom-right:
    if(p.x > 0 && p.y > 0) {
        new_width = element_original_width + (mouseX - original_mouseX)
        new_height = element_original_height + (mouseY - original_mouseY)
    }
    // bottom-left:
    if(p.x < 0 && p.y > 0) {
        new_width = element_original_width - (mouseX - original_mouseX)
        new_height = element_original_height + (mouseY - original_mouseY)
        new_x = element_original_x - (mouseX - original_mouseX)
    }
    // top-right:
    if(p.x > 0 && p.y < 0) {
        new_width = element_original_width + (mouseX - original_mouseX)
        new_height = element_original_height - (mouseY - original_mouseY)
        new_y = element_original_y + (mouseY - original_mouseY)
    }
    // top-left:
    if(p.x < 0 && p.y > 0) {
        new_width = element_original_width - (mouseX - original_mouseX)
        new_height = element_original_height - (mouseY - original_mouseY)
        new_x = element_original_x + (mouseX - original_mouseX)
        new_y = element_original_y + (mouseY - original_mouseY)
    }

    p.onResize({width: new_width, height: new_height})
}

const stopResize = resizer => () => {
    window.removeEventListener('mousemove', resizer)
}


const ResizeBox = styled.div`
border: 1px dashed #a0a0c0;
overflow: hidden;
height: ${(p) => p.height};
width: ${(p) => p.width};
position: relative;
overflow: visible;
`

const Corner = styled.span.attrs(p => ({
    onMouseDown: (e) => {
        e.preventDefault()
        original_mouseX = e.pageX
        original_mouseY = e.pageY
        element_original_width = e.target.parentElement.getBoundingClientRect().width
        element_original_height = e.target.parentElement.getBoundingClientRect().height
        var resizer = resize(p)
        window.addEventListener('mousemove', resizer)
        window.addEventListener('mouseup', stopResize(resizer))
    }
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

export default Lens