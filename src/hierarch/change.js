import React from "react"
import { SketchPicker } from 'react-color'
import styled from "styled-components"

const Board = ({children}) => (
    <div>
        {children.map(child => (
            <Accordion>
                {child}
            </Accordion>
        ))}
    </div>
)

const Accordion = styled.div`
border: 1px solid darkgrey;
`

class Color extends React.Component {
  state = {
    background: '#fff',
  };

  handleChange = (color) => {
    this.setState({ background: color.hex });
  };

  render() {
    return (
    <div>
        {this.props.name}
        <SketchPicker
        color={ this.state.background }
        onChangeComplete={ this.handleChange }
        />
    </div>
    );
  }
}

const Size = ({name}) => (
    <div>Size: {name}</div>
)

export default {
  Size,
  Color,
  Board,
}