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
            begin: /{/,
            // while: /[^\n]/,
            end: /}/,
            escape: true
        }
    },

    structure: {
        arguments: {
            include: {
                path: {
                    cd: []
                }
            }
        }

    },

    options: {
        defaultIgnore: true
    }

}

var testcode = `k(argument`;

addRule(jsrules, 'js');

console.log(tokenIt(testcode, 'js'));