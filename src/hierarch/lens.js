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

const Lens = { Change }

export default Lens