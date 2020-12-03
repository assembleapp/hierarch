import React from "react"
import styled from "styled-components"
import Logo from "./logo"

const Hierarch = () => (
    <Corner>
        <Logo size={20} repeat={2000} onClick={() => {
            fetch("http://0.0.0.0:4321/lens", {
                method: "POST",
            })
        }} />
    </Corner>
)

const Corner = styled.div`
position: absolute;
bottom: 40px;
right: 80px;
height: 40px;
width: 40px;
`

export default Hierarch