function complete(){
    var res = new Array()
    var funcname = new Array()
    var funcval = new Array()
    var funcsize = new Array()
    var maxDim = 0
    var iscomplete = 0
    var overed = new Array()
    var letters = ['a','b','c','d','e','f','g','h','i','j']
    var match = new Array()

    function functag(name,arr){
        this.name = name
        this.params = new Array()
        if(arr.length==0){
            for(var i=0;i<maxDim;i++){
                this.params.push(letters[i])
            }
        }else{
            for(var i=0;i<maxDim;i++){
                this.params.push(arr[i])
            }
        }

        this.getname = function() {
            return this.name
        };

        this.getparams = function() {
            return this.params
        };

        this.tostr = function() {
            var s = this.name
            s+='('
            s+=this.params.join(',')
            s+=')'
            return s
        };

        this.update = function(s,index) {
            this.params[index] = s
        };
    } 

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

    function read(){
        var ori = document.getElementById('input').value
        if(ori.length==0){
            bug('输入框为空')
        }
        var s = ori.split('\n')
        for(var i=0;i<s.length;i++){
            var m = s[i].split(' ')
            if(m.length!=4){
                bug("逻辑联结词定义格式错误")
            }
            if(m[0]!="#"){
                bug("逻辑联结词定义行首必须为#")
            }
            check(m[1],1)
            funcname.push(m[1])
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
            if(letters.indexOf(m[1])!=-1){
                bug("a~j是表示变元的保留字,不可用作联结词名")
            }
            var tmpsize = parseInt(m[2])
            maxDim = Math.max(maxDim,tmpsize)
            funcsize[m[1]] = tmpsize
            funcval[m[1]] = k
        }
        if(funcsize.length>10){
            bug("新定义联结词的个数不得超出10")
        }
        for(var i=0;i<funcname.length;i++){
            var name = funcname[i]
            var size = funcsize[name]
            if(size<maxDim){
                var tmp = funcval[name]
                var scaled = new Array()
                for(var j=0;j<tmp.length;j++){
                    for(var k=0;k<(maxDim-size)*2;k++){
                        scaled.push(tmp[j])
                    }
                }
                funcval[name] = scaled
            }
        }
    }

    function scaledim(s){
        var r=""
        for(var i=0;i<s.length;i++){
            for(var j=0;j<Math.max((maxDim-2)*2,1);j++){
                r+=s[i]
            }
        }
        return r
    }

    function repeat(){
        for(var i=0;i<maxDim;i++){
            var k = ''
            for(var j=0;j<Math.max(1,i*2);j++){
                k+='0'
            }
            for(var j=0;j<Math.max(1,i*2);j++){
                k+='1'
            }
            while(k.length<Math.pow(2,maxDim)){
                k+=k
            }
            res.push(k)
            match[k] = letters[maxDim-i-1]
        }
    }

    function run(){
        var andtruth = scaledim("0001")
        var ortruth = scaledim("0111")
        var notruth = scaledim("1100")
        var all0 = scaledim("0000")
        var all1 = scaledim("1111")
        res.push(all0)
        res.push(all1)
        match[all0] = '0'
        match[all1] = '1'
        repeat()
        for(var i=0;i<funcname.length;i++){
            var k = funcval[funcname[i]].join('')
            if(res.indexOf(k)==-1){
                res.push(k)
            }
            match[k] = new functag(funcname[i],[])
        }
        while(true){
            var startlen = res.length
            for(var k=0;k<maxDim;k++){
                var len = res.length
                for(var p=0;p<len;p++){
                    if(typeof(match[res[p]])=='string'){
                        continue
                    }
                    for(var j=0;j<len;j++){
                        var tmp = new functag(match[res[p]].getname(),match[res[p]].getparams())
                        var myhash = j.toString()+'-'+p.toString()+'-'+k.toString()
                        if(overed.indexOf(myhash)==-1){
                            overed.push(myhash)
                        }else{
                            continue
                        }
                        var r = new Array()
                        for(var i=0;i<Math.pow(2,maxDim);i++){
                            var s = i.toString(2)
                            while(s.length<maxDim){
                                s = '0'+s
                            }
                            s = s.split('')
                            s[k] = res[j][i]
                            s = s.join('')
                            s = parseInt(s,2)
                            r.push(res[p][s])
                            
                        }
                        r = r.join('')
                        var r1 = tmp.tostr()
                        if(r in match){
                            if(typeof(match[r])=='string'){
                                if(typeof(match[res[j]])=='string'){
                                    tmp.update(match[res[j]],k)
                                }else{
                                    tmp.update(match[res[j]].tostr(),k)
                                }
                                match[r] = tmp
                            }
                        }else{
                            if(typeof(match[res[j]])=='string'){
                                tmp.update(match[res[j]],k)
                            }else{
                                tmp.update(match[res[j]].tostr(),k)
                            }
                            match[r] = tmp
                        }
                        if(res.indexOf(r)==-1){
                            res.push(r)
                        }
                    }
                }
            }
            if((res.indexOf(notruth)!=-1)&&(res.indexOf(andtruth)!=-1 || res.indexOf(ortruth)!=-1)){
                iscomplete = 1
                break
            }
            var endlen = res.length
            if(startlen==endlen){
                break
            }
        }

    } 

    function summary(){
        var a = Math.pow(2,Math.pow(2,maxDim))
        if(iscomplete==1){
            document.getElementById('output').innerHTML = "<p align='center'>完全集,"+a.toString()+"/"+a.toString()+"</p>"
        }else{
            var content = ""
            var fnum = 0
            for(var key in match){
                if(typeof(match[key])!='string'){
                    fnum+=1
                    content = content+"<p align='center'>"+key+" → "+match[key].tostr()+'</p>'
                }
            }
            document.getElementById('output').innerHTML = "<p align='center'>非完全集,"+fnum.toString()+"/"+a.toString()+content+"</p>"
        }
    }

    read()
    if(maxDim>1){
        run()
    }
    summary()
}