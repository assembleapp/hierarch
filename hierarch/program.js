class Program {
  constructor(name, source) {
    this.name = name
    this.source = source
  }

  replace_by_indices(begin, end, upgrade = "") {
    if(begin < 0) {
      begin = str.length + begin
      if(begin < 0) begin = 0
    }

    var changed_source = ''
    var change = {}
    ;([changed_source, change] = spliceInput(this.source, begin, end - begin, upgrade));
    // this.source = this.source.slice(0, begin) + upgrade + this.source.slice(end)


    this.source = changed_source
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
