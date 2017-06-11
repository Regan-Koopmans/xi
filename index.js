// XI

var fs = require("fs");
var colors = require("colors")
var Lexer = require("lex");
var file = fs.readFileSync("input.txt", "utf8");

// Lexer

var row = 1;
var col = 1;

tokens = [];
syntax_tree = [];
ftable = [];

function warning(text) {
    console.log("Warning: ".yellow + text);
}

function error(text) {
    console.log("Error: ".red + text);
    process.exit();
}

var lexer = new Lexer(function (char) {
    error("Unexpected character at row " + row + ", col " + col + ": " + char);
});

// rules

lexer.addRule(/@/, function (lexeme) {
    tokens.push({ "type" : "activator", "text" : lexeme, "line" : row})
    return;
});

lexer.addRule(/->/, function (lexeme) {
    tokens.push({ "type" : "arrow", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/:=/, function (lexeme) {
    tokens.push({ "type" : "assignment", "text" : lexeme, "line" : row })
    return;
});

// Comments

lexer.addRule(/\/\/.*/, function (lexeme) {
    return;
});

// New lines

lexer.addRule(/\r?\n/, function (lexeme) {
    row++;
    return;
});

lexer.addRule(/print/, function (lexeme) {
    tokens.push({ "type" : "print", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/\+/, function (lexeme) {
    tokens.push({ "type" : "plus", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/\(/, function (lexeme) {
    tokens.push({ "type" : "open-paren", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/\)/, function (lexeme) {
    tokens.push({ "type" : "close-paren", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/,/, function (lexeme) {
    tokens.push({ "type" : "comma", "text" : lexeme, "line" : row })
    return;
});

lexer.addRule(/ +/, function (lexeme) { return "WHITESPACE"; });

lexer.addRule(/[a-zA-Z\d]+/i, function (lexeme) {
    tokens.push({ "type" : "identifier", "text" : lexeme, "line" : row })
    return;
});

lexer.input = file;
while (token = lexer.lex() != undefined) {}

/////////////////////////////////////////////////////////////////////////////////////

// Parser

for (var x = 0; x < tokens.length; x++) {
    if (tokens[x].type == "identifier") {
        if (x < tokens.length-2) {
            if (tokens[x+1].type == "assignment") {
                current_line = tokens[x].line;
                syntax_object = { "type" : "assignment", "items" : [] };
                while (x < tokens.length && tokens[x].line == current_line) {
                    syntax_object.items.push(tokens[x]);
                    x += 1;
                }
                x -= 1;
                syntax_tree.push(syntax_object);
            } else if (tokens[x+1].type == "open-paren") {
                current_line = tokens[x].line;
                syntax_object = { "type" : "call", "items" : [] };
                while (x < tokens.length && tokens[x].line == current_line) {
                    syntax_object.items.push(tokens[x]);
                    x += 1;
                }
                syntax_tree.push(syntax_object);
            } 
        }
    }
}

/////////////////////////////////////////////////////////////////////////////////////////

// Translation

function translate_function(array) {
    var function_params = [];
    var translation = "function(";
    var count = 0;
    while (array[count].type != "arrow") {
        translation += array[count].text;
        if (array[count].type == "identifier") {
            function_params.push(array[count].text);
        }
        count += 1;
    }
    count += 1;
    translation += ") { \n";
    translation += "\treturn ";
    while (count < array.length) {
        if (array[count].type == "identifier") {
            index = function_params.indexOf(array[count].text);
            if (index > -1) {
                function_params.splice(index,1);
            }
        } else if (array[count].type == "print") {
            array[count].text = "console.log"
        }
        translation += array[count].text;
        count += 1;
    }
    translation += ";";
    translation += "\n}";
    for (var x = 0; x < function_params.length; x++) {
        warning("Variable \""+function_params[x]+"\" is not used on line " + array[count-1].line);
    }
    return translation;
}

function translate_assignment(node) {
    var translation = "var ";
    translation += node.items[0].text;
    translation += " = ";
    translation += translate_function(node.items.slice(3,node.items.length));
    translation += ";";
    ftable.push(node.items[0].text);
    return translation;
}

function translate_call(node) {
    var translation = "";
    for (var x = 0; x < node.items.length; x++) {
        if (node.items[x].type == "identifier") {
            if (ftable.indexOf(node.items[x].text) == -1) {
                error("On line " + node.items[x].line + ", " + node.items[x].text + 
                        " has not been defined.");
            }
        }
        translation += node.items[x].text;
    }
    translation += ";";
    return translation;
}


var target_code = "// generated by Xi Compiler \n";
for (var x = 0; x < syntax_tree.length; x++) {
    switch (syntax_tree[x].type) {
        case "assignment" : target_code += translate_assignment(syntax_tree[x]); break;
        case "call" : target_code += translate_call(syntax_tree[x]); break;
    }
    target_code += "\n";
}
fs.writeFileSync("output.js", target_code);