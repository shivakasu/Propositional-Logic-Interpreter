function complete(){
    var res = new Array()
    var funcname = new Array()
    var funcval = new Array()
    var funcsize = new Array()
    var maxDim = 0
    var iscomplete = 0
    var overed = new Array()
    var fnum = 0
    var origin = new Array()

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
        var origin = document.getElementById('input').value
        if(origin.length==0){
            bug('输入框为空')
        }
        var s = origin.split('\n')
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
            origin.push(k)
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
        origin.push(all0)
        origin.push(all1)
        repeat()
        for(var i=0;i<funcname.length;i++){
            res.push(funcval[funcname[i]].join(''))
        }
        while(true){
            var startlen = res.length
            for(var k=0;k<maxDim;k++){
                var len = res.length
                for(var p=0;p<len;p++){
                    if(origin.indexOf(res[p])!=-1){
                        continue
                    }
                    for(var j=0;j<len;j++){
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
                        if(origin.indexOf(r)!=-1){
                            origin.splice(origin.indexOf(r),1)
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
            fnum = endlen
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
            document.getElementById('output').innerHTML = "<p align='center'>非完全集,"+(fnum-origin.length).toString()+"/"+a.toString()+"</p>"
        }
    }

    read()
    if(maxDim>1){
        run()
    }
    summary()
}