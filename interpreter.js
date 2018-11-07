function go(){
    var res = new Array()
    var elelist = new Array()
    var funcval = new Array()
    var funcsize = new Array()
    var stack = new Array()
    var sat = new Array()
    var c0 = new Array('¬','∧','∨','→','⊕','↔','(',')',',')
    var c1 = new Array('¬','∧','∨','→','⊕','↔','(',')',',','0','1')

    function bug(t="语法错误"){
        document.getElementById('output').innerHTML = "<p align='center'><font color='red'>"+t+"</font></p>"
        throw new Error(t)
    }

    function check(t,op){
        if (t.length>10){
            bug('字符串长度过长:'+t)
        }
        if(t[0]>='0' && t[0]<='9'){
            if(op==1 ||(t!='0' && t!='1')){
                bug('字符串首字符必须是字母')
            }
        }
    }

    function isele(t){
        if(elelist.indexOf(t)!=-1 || t=='0' || t=='1'){
            return true
        }
        return false
    }

    function issec(t){
        if(t=='∧' || t=='∨' || t=='→' || t=='⊕' || t=='↔'){
            return true
        }
        return false
    }

    function read(){
        var origin = document.getElementById('input').value
        if(origin.length==0){
            bug('输入框为空')
        }
        var s = origin.split('\n')
        if(s[0].length==0){
            bug("未输入公式")
        }
        var t=""
        for(var i=0;i<s[0].length;i++){
            if(c0.indexOf(s[0][i])!=-1){
                if (t.length>0){
                    check(t,0)
                    res.push(t)
                    t = ""
                }
                res.push(s[0][i])
            }else if(/[A-Za-z0-9]/.test(s[0][i])){
                t+=s[0][i]
            }else{
                bug('非法字符:'+s[0][i])
            }
        }
        if(t.length>0){
            check(t,0)
            res.push(t)
        }
        if(s.length>1){
            for(var i=1;i<s.length;i++){
                var m = s[i].split(' ')
                if(m.length!=4){
                    bug("逻辑联结词定义格式错误")
                }
                if(m[0]!="#"){
                    bug("逻辑联结词定义行首必须为#")
                }
                check(m[1],1)
                if(/^([1-9]|10)$/.test(m[2])==false){
                    bug("逻辑联结词的元数应为1~10")
                }
                if(m[3].length!=Math.pow(2,parseInt(m[2]))){
                    bug("真值表长度错误:"+m[1])
                }
                var k = new Array()
                for(var j=0;j<m[3].length;j++){
                    if(m[3][j]!='0'&&m[3][j]!='1'){
                        bug("真值表只能包含0和1:"+m[1])
                    }
                    k.push(parseInt(m[3][j]))
                }
                if(m[1] in funcsize){
                    bug("逻辑联结词定义重复")
                }
                funcsize[m[1]] = parseInt(m[2])
                funcval[m[1]] = k
            }
        }
        if(funcsize.length>10){
            bug("新定义联结词的个数不得超出10")
        }
        for(var i=0;i<res.length;i++){
            if((c1.indexOf(res[i])==-1) && !(res[i] in funcsize) && (elelist.indexOf(res[i])==-1)){
                elelist.push(res[i])
            }
        }
    }

    function seceval(a,b,c){
        if(b=='∧' && (a+c)==2){
            return 1
        }else if(b=='∨' && (a+c)!=0){
            return 1
        }else if(b=='⊕' && a!=c){
            return 1
        }else if(b=='→' && (a-c)!=1){
            return 1
        }else if(b=='↔' && a==c){
            return 1
        }else{
            return 0
        }
    }

    function isbinary(t){
        if(t!=0 && t!=1){
            bug()
        }
    }

    function evaluate(){
        while(stack.length>1){
            var k = stack.pop()
            if(k==0||k==1){
                var k1 = stack.pop()
                if(k1=='¬'){
                    if(k==0){
                        stack.push(1)
                    }else{
                        stack.push(0)
                    }
                }else if(issec(k1)){
                    var k2 = stack.pop()
                    stack.push(seceval(k,k1,k2))
                }else{
                    stack.push(k1)
                    stack.push(k)
                    break
                }
            }else if(k==')'){
                var len = stack.length
                var i
                var nomatch = true
                for(i=len-1;i>=0;i--){
                    if(stack[i]=='('){
                        nomatch = false
                        break
                    }
                }
                if(nomatch){
                    bug("括号不匹配")
                }
                if(i==len-2){
                    if(i==0 || !(stack[i-1] in funcsize)){
                        var k1 = stack.pop()
                        isbinary(k1)
                        stack.pop()
                        stack.push(k1)
                        continue
                    }else{
                        var fvals = funcval[stack[i-1]]
                        var k1 = stack.pop()
                        isbinary(k1)
                        stack.pop()
                        stack.pop()
                        stack.push(fvals[k1])
                        continue
                    }
                }else{
                    if(i==0 || !(stack[i-1] in funcsize)){
                        bug()
                    }
                    var param = new Array()
                    while(true){
                        var k1 = stack.pop()
                        if(k1=='('){
                            break
                        }else if(k1==','){
                            continue
                        }else if(k1==0 || k1==1){
                            param.push(k1)
                        }else{
                            bug()
                        }
                    }
                    var funcname = stack.pop()
                    if(param.length!=funcsize[funcname]){
                        bug()
                    }
                    var fvals = funcval[funcname]
                    var k1 = fvals[parseInt(param.join(''),2)]
                    stack.push(k1)
                    continue
                }
            }
        }
    }

    function run(){
        for(var i=0;i<Math.pow(2,elelist.length);i++){
            var s = i.toString(2)
            while(s.length<elelist.length){
                s = '0'+s
            }
            var table = new Array()
            for(var j=0;j<elelist.length;j++){
                table[elelist[j]] = parseInt(s[j])
            }
            for(var j=0;j<res.length;j++){
                var len = stack.length
                if(issec(res[j])){
                    if(j==0 || stack[len-1]=='¬' || issec(stack[len-1]) || stack[len-1]=='(' || stack[len-1] in funcsize || stack[len-1]==','){
                        bug()
                    }
                    stack.push(res[j])
                }else if(res[j]=='¬'){
                    if(j>0 && (stack[len-1]==')' || isele(stack[len-1]) || stack[len-1] in funcsize)){
                        bug()
                    }
                    stack.push(res[j])
                }else if(res[j]=='('){
                    if(j>0 && (stack[len-1]==')' || isele(stack[len-1]) || stack[len-1]==',')){
                        bug()
                    }
                    stack.push(res[j])
                }else if(res[j] in funcsize){
                    if(j>0 && stack[len-1]==')'){
                        bug()
                    }
                    stack.push(res[j])
                }else if(isele(res[j])){
                    if(j>0 && stack[len-1]==')'){
                        bug()
                    }
                    if(res[j]=='0'){
                        stack.push(0)
                    }else if(res[j]=='1'){
                        stack.push(1)
                    }else{
                        stack.push(table[res[j]])
                    }
                    evaluate()
                }else{
                    if(j==0 || stack[len-1]=='¬' || issec(stack[len-1]) || stack[len-1]=='(' || stack[len-1] in funcsize || stack[len-1]==','){
                        bug()
                    }
                    stack.push(res[j])
                    evaluate()
                }
            }
            if(stack.length!=1){
                bug()
            }
            if(stack[0]==1){
                sat.push(s)
            }
            stack = []
        }
    }

    function gentable(){
        content = "<h4 align='center'>真值表</h4><table><thead><tr><th>#</th>"
        for(var i=0;i<elelist.length;i++){
            content+="<th>"+elelist[i]+"</th>"
        }
        content+="</tr></thead><tbody>"
        for(var i=0;i<sat.length;i++){
            content+="<tr><td>"+(i+1).toString()+"</td>"
            for(var j=0;j<sat[i].length;j++){
                content+="<td>"+sat[i][j].toString()+"</td>"
            }
            content+="</tr>"
        }
        content+="</tbody></table>"
        document.getElementById("output").innerHTML = content
    }

    function summary(){
        var content = ""
        if(sat.length==0){
            document.getElementById('output').innerHTML = "<p align='center'>永假</p>"
        }else if(sat.length==Math.pow(2,elelist.length)){
            document.getElementById('output').innerHTML = "<p align='center'>永真</p>"
        }else{
            gentable()
        }
    }

    read()
    run()
    summary()
}