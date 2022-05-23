
// all global rules
var tokenItRules = {};

// add Rule
function addRule(name, rules){
    tokenItRules[name] = rules;
}

// add Rule
function deleteRule(name){
    tokenItRules[name] = false;
}

function tokenIt(name, code){

    var arrayOfTokens = [];
    var arrayOfRules = tokenItRules[name];
    var rules = arrayOfRules.rules || {};
    var tokens = arrayOfRules.tokens || {};
    var nodes = arrayOfRules.nodes || {};
    var options = arrayOfRules.options || {defaultIgnore: true, blankIgnore: false};

    var spread = explore(code, tokens);
    arrayOfTokens = spread;

    function explore(code, array, backTrace){

        var toSpread = [];
        backTrace = backTrace || {};

        var line = 0;
        var linechar = 0;

        function br(index){
            linechar = (index+1) + (backTrace.index || 0);
            line++;
        }

        function getTrace(index){
            return {
                index: index + (backTrace.index || 0),
                line: line + (backTrace.line || 0),
                col: (index + (backTrace.index || 0)) - linechar
            }
        }

        for(var i=0; i<code.length; i++){

            var token = false;
            var content = [];
            var value = '';

            var trace = {start: {}, end: {}, inner: {}};

            trace.start = getTrace(i);

            // main loop
            for(prop in array){

                var key = prop;
                var rule = rules[key] || false;

                if(!rule) throw 'Missing rule "' + key + '"';
                if(!rule.begin) throw 'Missing begin parameter in "' + key + '" rule';

                var beginLength = rule.beginLength || 1;
                var endLength = rule.endLength || 1;

                if(!code[i+beginLength-1]) continue;

                var beginStr = sliceIt(code, i, i+beginLength, 'no-br');

                // if begin is true
                if(rule.begin.test(beginStr)){

                    token = setToken(key);
                    beginStr = sliceIt(code, i, i+beginLength);

                    value += beginStr;
                    
                    // increment i
                    i += beginLength;
                    trace.inner.start = getTrace(i);
                    content.push(setToken(key, 'begin', beginStr, [], {start: trace.start, end: trace.inner.start}));

                    while(
                        (rule.end ? !rule.end.test(sliceIt(code, i, i+endLength, 'no-br')) : code[i])
                        && (rule.while ? rule.while.test(code[i]) : rule.end ? true : false)
                    ){

                        if(rule.end && !code[i]) throw 'Missing "'+ key +'" closure';
                        if(!array[key] && code[i] === '\n') br(i);
                        if(rule.escape && code[i] === '\\') i++;

                        value += code[i];
                        i++;

                    }

                    token.inner = sliceIt(value, beginLength, value.length, 'no-br');

                    if(array[key] && array[key] !== true){
                        content.push(...explore(token.inner, array[key], trace.inner.start));
                    }

                    // push end token
                    if(rule.end) {

                        var endStr = sliceIt(code, i, i+endLength);
                        content.push(setToken(key, 'end', endStr));
                        value += endStr;

                        trace.inner.end = getTrace(i);
                        i += endLength-1;

                    }else{

                        i--;
                        trace.inner.end = getTrace(i);

                    }

                    token.content = content;
                    token.value = value;

                    break;

                }

            }

            // default token
            if(!token) {
                if(code[i] === '\n') br(i);

                if(options.defaultIgnore) continue;
                if(options.ignore && options.ignore.test(code[i])) continue;

                if(options.defaultError) { options.errorFunction(getTrace(i)); break; }
                if(options.error && options.error.test(code[i])) { options.errorFunction(getTrace(i)); break; }
                
                token = setToken('default', '', code[i]);
            }

            i++; trace.end = getTrace(i); i--;
            token.trace = trace;

            toSpread.push(token);

        }

        function sliceIt(array, start, end, nobr){
            var value = [];
            for(var i=start; i<end; i++){
                if(array[i] === '\n' && !nobr) br(i);
                value.push(array[i]);
            }
            if(typeof array === 'string') return value.join('');
            return value;
        }

        return toSpread;

    }

    function setToken(type, role, value, content, trace){
        return {
            type: type,
            role: role || '',
            value: value || '',
            inner: '',
            content: content || [],
            trace: trace || {
                start: {},
                end: {}
            }
        }
    }

    return arrayOfTokens;

}