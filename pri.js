function satisfy(){
    var res = new Array()
    var elelist = new Array()
    var funcval = new Array()
    var funcsize = new Array()
    var SStack = new Array()
    var DStack = new Array()
    var sat = new Array()
    var c0 = new Array('¬','∧','∨','→','⊕','↔','(',')',',')
    var c1 = new Array('¬','∧','∨','→','⊕','↔','(',')',',','0','1')
    var prior = new Array()
    prior['('] = -2
    prior['$'] = -1
    prior['↔'] = 0
    prior['→'] = 1
    prior['∨'] = 2
    prior['⊕'] = 3
    prior['∧'] = 4
    prior['¬'] = 5
    prior[')'] = 6

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

    function evalOneStep(){
        var k = SStack.pop()
        if(k=='¬'){
            if(DStack.length==0){
                bug()
            }
            var k1 = DStack.pop()
            if(k1==0){
                DStack.push(1)
            }else{
                DStack.push(0)
            }
        }else if(issec(k)){
            if(DStack.length<2){
                bug()
            }
            var k1 = DStack.pop()
            var k2 = DStack.pop()
            DStack.push(seceval(k2,k,k1))
        }else if(k==')'){
            var len = SStack.length
            var i = len-1
            while(SStack[i]!='('){
                i--
                if(i<0){
                    bug()
                }
            }
            if(i==len-1){
                if(i==0 || !(SStack[i-1] in funcsize)){
                    SStack.pop()
                }else{
                    var fvals = funcval[SStack[i-1]]
                    var k1 = DStack.pop()
                    isbinary(k1)
                    SStack.pop()
                    SStack.pop()
                    DStack.push(fvals[k1])
                }
            }else{
                var k1 = SStack.pop()
                while(k1=='(' || k1==','){
                    k1 = SStack.pop()
                }
                var paramsize = funcsize[k1]
                var param = new Array()
                for(j=0;j<paramsize;j++){
                    param.push(DStack.pop())
                }
                var fvals = funcval[k1]
                param.reverse()
                DStack.push(fvals[parseInt(param.join(''),2)])
            }
        }
    }

    function evaluate(){
        while(true){
            if(SStack.length<2 && SStack[0]!='$'){
                break
            }
            var out = SStack.pop()
            var slen = SStack.length
            if(out=='$'){
                if(slen==0){
                    break
                }
                evalOneStep()
                if(SStack.length>0){
                    SStack.push(out)
                }
                continue
            }else if(out=='¬' || issec(out)){
                if(slen>0 && !(prior[out]>prior[SStack[slen-1]])){
                    evalOneStep()
                    SStack.push(out)
                    continue
                }else{
                    SStack.push(out)
                    break
                }
            }else if(out==')'){
                if(SStack[slen-1]!='(' && SStack[slen-1]!=','){
                    evalOneStep()
                    SStack.push(out)
                    continue
                }else{
                    SStack.push(out)
                    evalOneStep()
                    break
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
            var last = '$'
            for(var j=0;j<res.length;j++){
                if(isele(res[j])){
                    if(last==')'){
                        bug()
                    }
                    if(res[j]=='0'){
                        DStack.push(0)
                    }else if(res[j]=='1'){
                        DStack.push(1)
                    }else{
                        DStack.push(table[res[j]])
                    }
                    last = res[j]
                }else{
                    if(res[j]==')'){
                        if(last=='$' || last=='¬' || issec(last) || last=='(' || last in funcsize || last==','){
                            bug()
                        }
                    }else if(res[j]=='('){
                        if(last==')' || isele(last) || last==','){
                            bug()
                        }
                    }else if(res[j] in funcsize){
                        if(last==')'){
                            bug()
                        }
                    }else if(res[j]==','){
                        if(!isele(last) && last!=')'){
                            bug()
                        }
                    }else if(res[j]=='¬'){
                        if(last==')' || isele(last) || last in funcsize){
                            bug()
                        }
                    }else if(issec(res[j])){
                        if(last=='$' || last=='¬' || issec(last) || last=='(' || last in funcsize || last==','){
                            bug()
                        }
                    }else{
                        bug()
                    }
                    SStack.push(res[j])
                    last = res[j]
                    if(last=='¬' || issec(last) || last==')'){
                        evaluate()
                    }
                }    
            }
            SStack.push('$')
            evaluate()
            if(DStack.length!=1 || SStack.length!=0){
                bug(DStack.length)
            }
            if(DStack[0]==1){
                sat.push(s)
            }
            DStack = []
            SStack = []
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