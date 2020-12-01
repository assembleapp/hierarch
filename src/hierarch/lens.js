import React from "react"
import styled from "styled-components"

class change extends React.Component {
    state = { value: null }

    render = () => (
        <textarea
        key={this.props.children}
        style={{ display: "block" }}
        type="text"
        value={this.state.value || this.props.children}
        onChange={(e) => {
            this.setState({ value: e.target.value })
        }}
        onKeyDown={(e) => {
            if(e.key === "Enter") {
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
                .then(response => response.text())
                .then(response => console.log(response))
                e.preventDefault();
                e.stopPropagation();
                return false
            } else {
                console.log(e.key)
            }
        }}
        />
    )
}

const Lens = { change }

export default Lens