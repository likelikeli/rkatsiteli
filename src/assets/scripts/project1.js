
let _Recent

$(function () {
    let urls = window.location.search.substring(1)
    let vars = urls.split("&");
    let arrobject1={}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrobject1[pair[0]]=decodeURI(pair[1])
    }
    if(arrobject1.type=='excel'){
        $('.excelChoose').css('color','#3977fb')
    }else if(arrobject1.type=='csv'){
        $('.csvChoose').css('color','#f00')
    }else if(arrobject1.type=='txt'){
        $('.txtChoose').css('color','#ff0')
    }else if(arrobject1.type=='api'){
        $('.apiChoose').css('color','#11fd68')
    }else{
        $('.excelChoose').css('color','#3977fb')
    }
    $(".chooseD").on('click',function (){
        let type=$(this).attr("data-type")
        window.location.href = 'project1.html?type='+type
    })

    $(document).on('click',".tr-click",function (e) {
        let p = $(this)
        const projPath = p.attr('proj-path')
        const projName = p.attr('proj-name')
        openProj(projName, projPath)
    })
    let typeData=[]
    updateData()
    function updateData(){
        $('#trBox').html('')
        typeData = []
        if(arrobject1.type=='excel'){
            _Recent.history&&_Recent.history[0]&&_Recent.history.filter(item=>{
                if(item.type){
                    if(item.type=='excel'){
                        typeData.push(item)
                    }
                }else{
                    item.type='excel'
                    typeData.push(item)
                }
            })
        }else if(arrobject1.type=='csv'){
            _Recent.history&&_Recent.history[0]&&_Recent.history.filter(item=>{
                if(item.type){
                    if(item.type=='csv'){
                        typeData.push(item)
                    }
                }else{
                    item.type='excel'
                }
            })
        }else if(arrobject1.type=='txt'){
            _Recent.history&&_Recent.history[0]&&_Recent.history.filter(item=>{
                if(item.type){
                    if(item.type=='txt'){
                        typeData.push(item)
                    }
                }else{
                    item.type='excel'
                }
            })
        }else if(arrobject1.type=='api'){
            _Recent.history&&_Recent.history[0]&&_Recent.history.filter(item=>{
                if(item.type){
                    if(item.type=='api'){
                        typeData.push(item)
                    }
                }else{
                    item.type='excel'
                }
            })
        }
        if(typeData&&typeData[0]){
            $(".nullData").css('display','none')
        }else{
            $(".nullData").css('display','block')
        }
        typeData.filter(item=>{
            let date = new Date(item.time)
            let newDate = date.getFullYear()+'年'+(date.getMonth()+1)+'月'+date.getDate()+'日'
            let html = '<tr class="tr-click" style="width:100%;display: table;" proj-path="'+item.path+'" proj-name="'+item.name+'">' +
                '           <td style="width:200px">' +
                '               <div class="td-name" >' +
                '                   <span>'+item.name+'</span>' +
                '                   <span class="td-name-tip">'+item.type+'</span>' +
                '               </div>' +
                '           </td>' +
                '           <td style="width:200px">'+newDate+'</td>' +
                '           <td>'+item.path+'</td>' +
                '           <td class="deleteLi1" style="width:60px" data-date="'+item.time+'">删除</td>' +
                '       </tr>'
            $('#trBox').append(html)
        })
    }

    /**
     * 删除该条记录
     */
    $(document).on('click','.deleteLi1',function (e){
        e.preventDefault()
        e.stopPropagation()
        let time = $(this).attr('data-date')
        let projJsonData = _Recent
        projJsonData.lastupdate = new Date().getTime()
        for (var i = 0; i < projJsonData.history.length; i++) {
            if (projJsonData.history[i]['time'] == time) {
                projJsonData.history.splice(i, 1)
                break
            }
        }
        _Recent = projJsonData
        updateData()
        saveRecents()

    })
    /**
     * 返回首页
     */
    $(".goBack").on('click',function (){
        window.location.href = 'index.html'
    })
    /**
     * 新增项目显示
     */
    $(".addObBtn").on('click',function (){
       $("#modalShow").modal('show')
    })
    /**
     * 确定名称
     */
    $(document).on('click',"#addObject",function (){
        var name = $('#projectName').val()
        name = name.trim()
        if (name == '' || name == ' ') {
            notice('失败', '提取模板名必须填写', 'error')
            return
        } else if (!isFilenameValid(name)) {
            notice('失败', '提取模板名不可以包含特殊字符', 'error')
            return
        } else {
            $("#modalShow").modal('hide')
            $('#projectName').val('')
            _remote.dialog.showOpenDialog({
                title: '提取模板',
                properties: ['openDirectory', 'createDirectory', 'promptToCreate'],
                message: '选择提取模板目录' //macOS -显示在输入框上方的消息
            }).then(result => {
                if (!result.canceled) {
                    const path = result.filePaths
                    createNewProj(name, path[0])
                }
            }).catch((err) => {
                throw err
            })
        }
    })

    /**
     * 新增项目保存
     * @param name
     * @param path
     */
    function createNewProj(name, path) {
        const projDoc = _path.join(path, name)
        _fse.ensureDirSync(projDoc, err => {
        })

        const modelsDoc = _path.join(projDoc, 'models')
        _fse.ensureDirSync(modelsDoc, err => {
        })

        const projFile = _path.join(projDoc, 'project.json')
        _fse.ensureFileSync(projFile)
        const projJsonData = {
            'name': name,
            'type':arrobject1.type,
            'models': {
                'extractorModel': 'extractor_model.json',
                'metadataModel': 'metadata_model.json'
            }
        }
        _fse.writeJsonSync(projFile, projJsonData)
        saveRecents(function () {
            openProj(name, projDoc)
        })

    }
    function openProj(name, path) {
        recordRecentOpen(name, path)
        openProjOnWorkbench(path)
    }
    function recordRecentOpen(name, path) {
        let projJsonData = _Recent
        projJsonData.lastupdate = new Date().getTime()
        //去重
        for (var i = 0; i < projJsonData.history.length; i++) {
            if (projJsonData.history[i]['path'] == path) {
                projJsonData.history.splice(i, 1)
                break
            }
        }
        //新增
        let llls = {
            'name': name,
            'path': path,
            type:arrobject1.type,
            'time': new Date().getTime()
        }
        projJsonData.history.unshift(llls)
        _Recent = projJsonData
        updateData()
        saveRecents()
    }
    function openProjOnWorkbench(path) {
        const CurrentProj = {
            'projPath': path,
            'type':arrobject1.type,
            'currentFileID': null
        }
        window.LS.set('CurrentProj', JSON.stringify(CurrentProj))
        if(arrobject1.type=='excel'){
            window.location.href = 'upload.html?type=excel'
        }else  if(arrobject1.type=='txt'){
            window.location.href = 'parseTxt.html?type=txt'
        }else  if(arrobject1.type=='api'){
            window.location.href = 'parseApi.html?type=api'
        }else  if(arrobject1.type=='csv'){
            window.location.href = 'upload.html?type=csv'
        }else{
            window.location.href = 'upload.html?type=excel'
        }
    }
})
