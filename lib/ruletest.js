var jsrules = {

    syntaxes: {
        keyword: {
            begin: /\w/,
            while: /\w/
        },
        arguments: {
            begin: /\(/,
            end: /\)/
        },
        string: {
            begin: /"/,
            while: /[^\n]/,
            end: /"""/,
            endLength: 3
        }
    },

    tokens: {
        
        string: ''

    },

    node: {

    },

    options: {
        defaultIgnore: false
    }

}

var testcode = `template (header, ("all")) "string" { brackets { inside } }`;
var testcode = `"string""" outside (argument(insidewith(
"string""")))`;

addRule(jsrules, 'js');

console.log(tokenIt(testcode, 'js'));