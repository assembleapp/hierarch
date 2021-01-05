import styled from "styled-components"

import Box from "./box"
const Code = styled.code``
const P = styled.p.attrs(p => ({
    "data-code": p.code
}))``

export { Code, P, Box }
