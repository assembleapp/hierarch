const node_range = (program, node, range) => {
    if(node.startIndex !== range[0] || node.endIndex !== range[1]) {
        console.log(program.display(node))
        console.log(range)
        console.log([node.startIndex, node.endIndex])
        throw("on guard! applied a range misaligned on any node.")
    }
}

const guard = { node_range }
module.exports = guard