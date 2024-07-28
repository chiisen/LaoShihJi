/**
 * abstract syntax tree
 */
function commanderAbstractSyntaxTree(opts) {
    if (opts === undefined) {
        return;
    }
    const parser = require("@babel/parser");
    const traverse = require("@babel/traverse").default;
    const code = `
function square(n) {
  return n * n;
}
`;

    const ast = parser.parse(code);

    traverse(ast, {
        FunctionDeclaration(path) {
            console.log("Function name:", path.node.id.name);
        }
    });
}

module.exports = { commanderAbstractSyntaxTree };