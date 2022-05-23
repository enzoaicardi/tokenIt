
// all global rules
var listOfRules = {};

// add Rule
function addRule(rules, name){
    listOfRules[name] = rules;
}

// add Rule
function deleteRule(name){
    delete listOfRules[name];
}

var errorIt = function(type, token, errorTrace){
    switch(type){
        case 'missing-closure': throw 'Missing "' + token.type + '" closure.';
    }
}

function tokenIt(code, name){

    var rules = listOfRules[name];
    var syntaxes = rules.syntaxes || {};
    var tokens = rules.tokens || {};
    var options = rules.options || {defaultIgnore: true};

    var arrayOfTokens = [];
    var i = 0;

    var line = 0;
    var linechar = 0;

    for(i=0; i<code.length; i++){
        var result = explore(tokens);
        if(result) arrayOfTokens.push(result);
    }

    function explore(object){

        var token = false;
        var trace = {inner:{}};
        var include = object.include || false;

        // start trace
        trace.start = getTrace();

        if(include.all) addAllProperties(object, include.all);
        if(include.path) addAllProperties(object, include.path);

        if(code[i] === '\n') addBreak();

        for(var key in object){

            if(key === 'include') continue;

            var syntax = syntaxes[key];

            if(!syntax) throw 'Missing "' + key + '" syntax.';
            if(!syntax.begin) throw 'Missing begin parameter in "' + key + '" syntax.';

            var begin = syntax.begin, end = syntax.end;

            var beginLength = syntax.beginLength || 1;
            var endLength   = syntax.endLength || 1;

            if(!code[i+beginLength-1] || !code[i+endLength-1]) continue;

            var beginStr = code.substring(i, i+beginLength);
            var beginCond = begin.test(beginStr);

            if(beginCond){

                findBreaks(beginStr);

                token = setToken(key);

                var beginToken = setToken(key, 'begin', beginStr);
                token.content.push(beginToken);

                i += beginLength;
                trace.inner.start = getTrace();
                beginToken.trace = {start: trace.start, end: trace.inner.start};

                function endStr() { return end ? code.substring(i, i+endLength) : ''; }
                function endCond(){ return end ? !end.test(endStr()) : code[i]; }

                while(endCond() && (syntax.while ? syntax.while.test(code[i]) : end ? true : false)){

                    var escaped = false;

                    if(end && !code[i+endLength-1]) errorIt('missing-closure', token, getTrace());
                    if(syntax.escape && code[i] === '\\') { i++; escaped = true; }

                    if((object[key] || include) && !escaped) {

                        var obj = include.self ? object : object[key];
                        var inside = explore(obj);

                        if(inside) {
                            token.content.push(inside);
                            token.inner += inside.outer;
                            i++; continue;
                        }

                    }

                    token.inner += code[i];
                    i++;

                }

                token.outer = beginStr + token.inner;

                if(end){

                    var str = endStr();
                    var endToken = setToken(key, 'end', str);
                    trace.inner.end = getTrace();
                    
                    token.content.push(endToken);
                    token.outer += str;
                    
                    i += endLength-1;

                    endToken.trace = {start: trace.inner.end, end: getTrace(i+1)};

                } else {
                    i--;
                    trace.inner.end = getTrace();
                }

                break;

            }

        }

        // if no syntax match
        if(!token){
            
            if(options.defaultIgnore) return;
            if(options.ignore && options.ignore.test(code[i])) return;
            
            token = setToken('default', '', code[i]);

        }

        // end trace
        trace.end = getTrace(i+1);
        token.trace = trace;

        return token;

    }

    function getTrace(index){
        return {
            index: index || i,
            line: line,
            col: (index || i) - linechar
        }
    }

    function findBreaks(str, index){
        for(var i=0; i<str.length; i++){
            if(str[i] === '\n') addBreak(index + i);
        }
    }

    function addBreak(){
        linechar = i+1;
        line++;
    }

    function addAllProperties(object, options){

        var pathObject = false;
        if(options.cd) pathObject = getPathObject(options.cd);

        for(var key in (pathObject || syntaxes)){
            if(key === 'include') continue;
            if(options.ignore && options.ignore.hasOwnProperty(key)) continue;
            object[key] = pathObject[key] || '';
        }

    }

    function getPathObject(path){
        var current = tokens;
        for(var i=0; i<path.length; i++){
            current = current[path[i]];
            if(!current) throw 'Error in "path" inclusion, "cd" : [' + path.join(', ') + '] is incorrect.';
        }
        return current;
    }

    function setToken(type, role, outer){
        return {
            type: type,
            role: role || '',
            outer: outer || '',
            inner: '',
            content: [],
            trace: {}
        }
    }

    return arrayOfTokens;

}