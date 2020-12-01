const Parser = require("tree-sitter")
const JavaScript = require("tree-sitter-javascript")

class Program {
    constructor(source) {
        this.source = source
        this.parser = new Parser()
        this.parser.setLanguage(JavaScript)
        this.parsed = this.parser.parse(this.source)
    }

    replace_in_program_by_node(node, upgrade = "") {
        this.replace_in_program_by_indices(node.startIndex, node.endIndex, upgrade)
    }

    replace_in_program_by_indices(begin, end, upgrade = "") {
        if(begin < 0) {
            begin = str.length + begin
            if(begin < 0) begin = 0
        }

        var changed_source = ''
        var change = {}
        ;([changed_source, change] = spliceInput(this.source, begin, end - begin, upgrade));
        // this.source = this.source.slice(0, begin) + upgrade + this.source.slice(end)

        this.parsed.edit(change)
        this.source = changed_source
    }

    reparse() {
        this.parsed = this.parser.parse(this.source, this.parsed)
    }

    query(query) {
        return new Parser.Query(JavaScript, query).matches(this.parsed.rootNode)
    }
}

// source:
// https://github.com/tree-sitter/node-tree-sitter/blob/a95bc5c723d0/test/tree_test.js#L327-L352
function spliceInput(input, startIndex, lengthRemoved, newText) {
    const oldEndIndex = startIndex + lengthRemoved;
    const newEndIndex = startIndex + newText.length;
    const startPosition = getExtent(input.slice(0, startIndex));
    const oldEndPosition = getExtent(input.slice(0, oldEndIndex));
    input = input.slice(0, startIndex) + newText + input.slice(oldEndIndex);
    const newEndPosition = getExtent(input.slice(0, newEndIndex));
    return [
      input,
      {
        startIndex, startPosition,
        oldEndIndex, oldEndPosition,
        newEndIndex, newEndPosition
      }
    ];
}

function getExtent(text) {
    let row = 0
    let index;
    for (index = 0; index != -1; index = text.indexOf('\n', index)) {
      index++
      row++;
    }
    return {row, column: text.length - index};
}

module.exports = Program
