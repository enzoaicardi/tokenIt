function highlightCode(code, lang){

    if(!lang) {return code;}

    if(!/^(html|css|js|xml|sdom)$/.test(lang)){
        lang = 'generic';
    }

    // TAGS and ATTRIBUTES
    if(lang === "html" || lang === "xml"){
        var matches = code.match(/(&lt;\/?)(.+?)(&gt;)/gi);

        for(var i in matches){
            var str = matches[i].replace(/([-a-z0-9:]+)(=)/gi, '<span class="attribute">$1</span><span class="declaration">$2</span>')
                                .replace(/(&lt;\/?(!--)?)(.+?)((--)?&gt;)/gi, '<span class="declaration">$1</span><span class="tag">$3</span><span class="declaration">$4</span>');
            
            code = code.replace(matches[i], str);
        }
    }

    else if(lang === "sdom"){
        code = code.replace(/(^(\t| )*| (\+|-)*)([a-z0-9]+[-a-z0-9]*!?)(( *\.[-_a-z0-9 ]+)*)/gi, '<span class="declaration">$1</span><span class="tag">$4</span><span class="class">$5</span>')
                   .replace(/( ?[a-zA-Z]+)<\/span><span class="class"> ?<\/span>\(/gi, '<span class="function">$1</span></span>(')
                   .replace(/( ?\[.+?\])/gi, '<span class="attribute">$1</span>')
                   .replace(/( ?\((\\\)|[^\)][^\)\\]?)*\))/gi, '<span class="declaration">$1</span>');
    }

    // JAVASCRIPT KEYWORDS
    else if(lang === "js"){
        code = code.replace(/(^| )(new |return )/gi, '$1<span class="tag">$2</span>')
        .replace(/(^| )(continue|break)( *;)/gi, '$1<span class="tag">$2</span>$3')
        .replace(/(^| )(else|try|catch)( *\{)/gi, '$1<span class="tag">$2</span>$3')
        .replace(/(^| )(if|for|while)( *\()/gi, '$1<span class="tag">$2</span>$3')
        .replace(/([a-z_]+):(.*?)(,|[^;]?$)/gi, '<span class="declaration">$1</span>:$2$3')
        .replace(/\(([^\(]*?)\)( *\=\&gt;)/gi, '(<span class="declaration">$1</span>)<span class="function">$2</span>')
        .replace(/([a-z_]+)\(([^\(]*?)\)/gi, '<span class="function">$1</span>(<span class="declaration">$2</span>)')
        .replace(/([a-z_]+ *)\(/gi, '<span class="function">$1</span>(')
        .replace(/(function |class )/gi, '<span class="keyword">$1</span>')
        .replace(/(var |let |const )( *[a-z_]+)/gi, '<span class="attribute">$1</span><span class="declaration">$2</span>');
    }

    // ALL STRINGS
    if(lang === 'sdom'){
        code = code.replace(/( (-|\+)+)(&quot;|\{)/gi, '<span class="declaration">$1</span>$3')
                   .replace(/( ?\{(\\\}|[^\}][^\}\\]?)*\})/gi, '<span class="string">$1</span>');
                   
    }

    code = code.replace(/( ?\&quot\;(\\\&quot\;|.[^&\\]?)*?\&quot\;)/gi, '<span class="string">$1</span>');
    
    if(lang !== 'sdom'){
        code = code.replace(/( ?\&\#39\;(\\\&\#39\;|.[^&\\]?)*?\&\#39\;)/gi, '<span class="string">$1</span>')
                   .replace(/( ?`.*?`)/gi, '<span class="string">$1</span>');
    }

    // CSS
    if(lang === 'css'){
        code = code
                   .replace(/( ?--[-_a-z0-9]+)( *:)/gi, '<span class="declaration">$1</span>$2')
                   .replace(/( |\(|,|;|:)( ?[0-9]+[a-z\%µ]*)( |\)|,|;)/gi, '$1<span class="tag">$2</span>$3')
                   .replace(/( ?\[.+?\])/gi, '<span class="attribute">$1</span>')
                   .replace(/( ?&gt;)/gi, '<span class="declaration">$1</span>')
                   .replace(/(^ *[-_a-z0-9]+)( *:)/gi, '<span class="declaration">$1</span>$2')
                   .replace(/([-_a-z0-9]+)(\()/gi, '<span class="function">$1</span>$2')
                   .replace(/( ?@[-_a-z0-9]+ +[-a-z]+)/gi, '<span class="tag">$1</span>');
    }

    // GENERIC LANG
    if(lang === 'generic'){
        code = code.replace(/( ?(&amp;|&gt;=?|&lt;=?|\||={2,}))/gi, '<span class="declaration">$1</span>')
                   .replace(/( ?[0-9]+[a-z]+)/gi, '<span class="tag">$1</span>')
                   .replace(/((^| )[-_a-z]+ *)\(/gi, '<span class="function">$1</span>(')
                   .replace(/\[(.*?)\]/gi, '[<span class="declaration">$1</span>]')
                   .replace(/\((.*?)\)/gi, '(<span class="declaration">$1</span>)')
                   .replace(/( ?(\{|\}|:| \+ | - |;$|\(|\)|\[|\]))/gi, '<span class="keyword">$1</span>');
    }

    // ALL COMMENTS
    var comment_match;
    if(lang === 'html'){ comment_match = code.match(/&lt;!--.*?--&gt;/gi); }
    if(lang === 'sdom'){ comment_match = code.match(/(^| )#[^a-z0-9].*/gi); }
    if(lang === "css"){ comment_match = code.match(/\/\*.*?\*\//gi); }
    if(lang === 'js' || lang === 'generic'){ comment_match = code.match(/(\/\/.*|\/\*.*?\*\/)/gi); }

    for(var i in comment_match){
        var str = comment_match[i].replace(/<span class="[-a-z]+">/gi, '').replace(/<\/span>/gi, '');
        code = code.replace(comment_match[i], '<span class="comment">' + str + '</span>');
    }

    code = code.replace(/^(( |\t)+)/, '<span class="line-start">$1</span>')

    return code;

}