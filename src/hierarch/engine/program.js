const makeProgram = async (source) => {
  const Parser = window.TreeSitter

  await Parser.init()
  var js = await Parser.Language.load(`/tree-sitter-javascript.wasm`);

  return new Program(source, js, Parser)
}

class Program {
  constructor(source, language, Parser) {
    this.Parser = Parser
    this.parser = new this.Parser()
    this.parser.setLanguage(language);

    this.source = source
    this.parsed = this.parser.parse(this.source)
  }

  display = (node) => this.source.slice(node.startIndex, node.endIndex)

  replace_by_node(node, upgrade = "", options = {}) {
    console.log("Replacing by node:")
    console.log(this.display(node), " -> ", upgrade)

    this.replace_by_indices(
      node.startIndex + (options.beginningOffset || 0),
      node.endIndex + (options.endingOffset || 0),
      upgrade,
    )
  }

  replace_by_indices(begin, end, upgrade = "") {
    if(begin < 0) {
      begin = this.source.length + begin
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

  load_language(language_address) {
    return this.Parser.Language.load(language_address)
  }

  parse_range_as_language(begin, end, language) {
    this.parser.setLanguage(language)
    return this.parser.parse(this.source, null, {
      includedRanges: [{
        startIndex: begin,
        endIndex: end,
        startPosition: getExtent(this.source.slice(0, begin)),
        endPosition: getExtent(this.source.slice(0, end)),
      }]
    })
  }

  use_language(language) {
    this.parser.setLanguage(language)
  }

  query(query, node = this.parsed.rootNode) {
    try {
      if(query instanceof Array) {
        return query.map(q => (
          this.parsed.language.query(q).matches(node).filter(x => x)
        )).flat(1)
      }
      return this.parsed.language.query(query).matches(node).filter(x => x)
    } catch(e) {
      console.log(e)
      return []
    }
  }

  debug_query(query) {
    var elements = query.map(m => {
      return m.captures.map(c => {
        return [
          c.name,
          // c.node.toString(),
          this.display(c.node),
        ]
      })
    })
    console.log(elements)
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

export default makeProgram
