const Parser = require("tree-sitter")
const JavaScript = require("tree-sitter-javascript")
const Css = require("tree-sitter-css")

const languages = {
    js: JavaScript,
    css: Css,
}

class Program {
    constructor(name, source) {
        this.name = name
        this.source = source
        this.parser = new Parser()
        this.parser.setLanguage(JavaScript)
        this.parsed = this.parser.parse(this.source)
    }

    display = (node) => this.parsed.getText(node)

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

    parse_range_as_language(begin, end, lang) {
        this.parser.setLanguage(languages[lang])
        return this.parser.parse(this.source, null, {
            includedRanges: [{
                startIndex: begin,
                endIndex: end,
                startPosition: getExtent(this.source.slice(0, begin)),
                endPosition: getExtent(this.source.slice(0, end)),
            }]
        })
    }

    use_language(lang) {
        this.parser.setLanguage(languages[lang])
    }

    query(query, node = this.parsed.rootNode, lang = 'js') {
        try {
            if(query instanceof Array) {
                return query.map(q => (
                    new Parser.Query(languages[lang], q).matches(node)
                    )).flat(1)
            }

            console.log('making query')
            const q = new Parser.Query(languages[lang], query)
            console.log('running query')
            const response = q.matches(node)
            console.log(response.length)
            console.log()
            console.log()
            console.log()
            return response
        } catch(e) {
            console.log('error')
            console.log('error')
            console.log('error')
            console.log('error')
            console.log(e)
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

module.exports = Program
