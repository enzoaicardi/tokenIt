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

var testcode = `k(argument (a(ve)c) {texte dedans}) {texte avec (argument dedans)}`;

addRule(jsrules, 'js');

console.log(tokenIt(testcode, 'js'));