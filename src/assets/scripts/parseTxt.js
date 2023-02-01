$(function (){
    if (!_remote) {
        const _remote = require('electron').remote
    }
    const _shell = require('electron').shell
    let _uuid = require('uuid-random')
    const AdmZipD = require("adm-zip");
    let headerArr = []
    const EXTENSIONS = ['txt']
    const _path = require("path");
    let  _fs = require('fs')
    const iconv = require('iconv-lite');
    let modelID = _uuid()
    let inputHeads=[]
    const _jschardet = require("jschardet")
    let original_file =''
    /**
     * table样式
     * @param row
     * @param index
     * @returns {{classes: string}}
     */
    let _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    let _extractorModelFile = _path.join(_path.join(_currentProj["projPath"],"models"),"extractor_model.json");
    _fse.ensureFileSync(_extractorModelFile);
    let _extModelsData = _fse.readJsonSync(_extractorModelFile, {throws: false});
    if (_extModelsData == null) {
        _extModelsData = {
            "varsion" : "1.0",
            "templeteID": _uuid(),
            "templeteFileType":"TXT",
            "templeteFileSuffix":'.txt',
            "chatset":"UTF-8",
            "models":[]
        };
        saveExtModelsData();
    }else{
        if(_extModelsData.models&&_extModelsData.models[0]){
            $("#split").val(_extModelsData.models[0].split1)
            $("#compressNumber").val(_extModelsData.models[0].compressNumber)
            $("#isHeaderHave").val(_extModelsData.models[0].isHeaderHave)
            if(_extModelsData.models[0].original_file){
                let file={path:_path.join(_currentProj.projPath,_extModelsData.models[0].original_file)}
                original_file = _extModelsData.models[0].original_file
                dataShow(file)
            }
            if(_extModelsData.models[0].isHeaderHave&&_extModelsData.models[0].isHeaderHave=='是'){
                $('#fieldArrBox').css('display','flex')
                $('#newFieldBox').css('display','flex')
                $("#fieldArrBox").html('')
                modelID = _extModelsData.models[0].modelID
                headerArr = _extModelsData.models[0].headerArr
                inputHeads = _extModelsData.models[0].inputHeads
                let htmls=''
                headerArr.filter(item=>{
                    htmls+='<div class="fieldStyle">' + item  +
                        '<span data-name="'+item+'" class="spanStyle">&times;</span></div>'
                })
                $("#fieldArrBox").html(htmls)
            }
        }
    }
    let rowStyle = function (row, index) {
        let classes = ['success1', 'info1'];
        if (index % 2 === 0) {
            return { classes: classes[0]};
        } else {
            return {classes: classes[1]};
        }
    }
    /**
     * 返回列表页
     */
    $(document).on('click', '.goBack', async function () {
        window.location.href = 'project1.html?type=txt'
    })
    /**
     * 上传文件
     */
    $("#btnUpload").on('click', async function (){
        if($("#split").val()){
            const files = await _remote.dialog.showOpenDialog({
                title: '选择一个文件',
                filters: [{
                    name: 'Spreadsheets',
                    extensions: EXTENSIONS
                }],
                properties: ['openFile', 'treatPackageAsDirectory']
            })
            if (files.filePaths.length > 0) {
                processFile({
                    path: files.filePaths[0],
                    name: _path.basename(files.filePaths[0])
                })
            }
        }else{
            alert('请您先选择字段截取方式')
        }
    })
    /**
     * 改变文本字段截取方式保存到文件
     */
    $("#split").on('change',function (){
        saveExtModelsData()
    })
    /**
     * 改变多少条取一条数据保存到文件
     */
    $("#compressNumber").on('change',function (){
        saveExtModelsData()
    })
    /**
     * 选择是否需要添加表头
     */
    $("#isHeaderHave").on('change',function (){
        if($(this).val()=='是'){
            $('#fieldArrBox').css('display','flex')
            $('#newFieldBox').css('display','flex')
        }else{
            $('#fieldArrBox').css('display','none')
            $('#newFieldBox').css('display','none')
        }
        saveExtModelsData()
    })
    /**
     * 删除字段
     */
    $(document).on('click',".spanStyle",function (){
        headerArr = headerArr.filter(item=>item!=$(this).attr('data-name'))
        $("#fieldArrBox").html('')
        let htmls=''
        headerArr.filter(item=>{
            htmls+='<div class="fieldStyle">' + item  +
                '<span data-name="'+item+'" class="spanStyle">&times;</span></div>'
        })
        $("#fieldArrBox").html(htmls)
        saveExtModelsData()
    })
    /**
     * 新增字段
     */
    $("#buttonAdd").on('click',function (){
        if($('#fieldValue').val()){
            let fieldValue  = $('#fieldValue').val().replace(/\s/g,"");
            if(fieldValue){
                if(headerArr.includes(fieldValue)){
                    alert('请您不要输入重复字段')
                }else{
                    headerArr.push(fieldValue)
                    let htmls=''
                    $('#fieldValue').val('')
                    $("#fieldArrBox").html('')
                    headerArr.filter(item=>{
                        htmls+='<div class="fieldStyle">' + item  +
                            '<span data-name="'+item+'" class="spanStyle">&times;</span></div>'
                    })
                    $("#fieldArrBox").html(htmls)
                }
                saveExtModelsData()
            }else{
                alert('请您输入字段名称')
            }
        }else{
            alert('请您输入字段名称')
        }
    })
    /**
     * 对上传的文件操作以及解析
     * @param file
     */
    let processFile=(file)=>{
        file.extname =  _path.extname(file.name);
        const originalFile = _path.join(_currentProj["projPath"], "original"+file.extname);
        _fse.copySync(file.path, originalFile);
        original_file =  "original"+file.extname;
        dataShow(file)
    }
    function dataShow(file){
        let res=_fs.createReadStream(file.path,{encoding:"binary"});
        let chunks='';
        res.on('data',(chunk)=>{
            chunks+=chunk
        });
        res.on('end',()=> {
            let encoding = _jschardet.detect(chunks).encoding
            let str
            if (encoding == "UTF-8" || encoding == "utf-8") {
                str = _fs.readFileSync(file.path, 'utf8');
            } else {
                const buf = Buffer.from(chunks, 'binary')
                str = iconv.decode(buf, "GBK")
            }
            let newData =  str.split('\n')
            let data=[]
            let keysArr=[]
            let compressNumber = 1
            if($("#compressNumber").val()){
                compressNumber = $("#compressNumber").val()
            }
            if($("#isHeaderHave").val()=='是'){
                keysArr=[...headerArr]
                if($("#split").val()=='逗号'){
                    newData.filter((item,index)=>{
                        if(index==0||(index+1)%compressNumber==0){
                            let itemArr = item.split('，').join(',').split(',')
                            let lis = {}
                            for(let k=0;k<headerArr.length;k++){
                                lis[headerArr[k]] = itemArr[k]
                            }
                            data.push(lis)
                        }
                    })
                }else if($("#split").val()=='空格'){
                    newData.filter((item,index)=>{
                        if((index+1)%compressNumber==0){
                            newData[index] = newData[index].replace(new RegExp('             ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('            ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('           ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('          ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('         ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('        ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('       ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('      ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('     ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('    ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('   ','g'),' ')
                            newData[index] = newData[index].replace(new RegExp('  ','g'),' ')
                        }
                    })
                    newData.filter((item,index)=>{
                        if(index==0||(index+1)%compressNumber==0){
                            let itemArr = item.split(' ')
                            let lis = {}
                            for(let k=0;k<headerArr.length;k++){
                                lis[headerArr[k]] = itemArr[k]
                            }
                            data.push(lis)
                        }
                    })
                }
            }else{
                if($("#split").val()=='逗号'){
                    let headerFieldArr = newData[0].split('，').join(',').split(',')
                    keysArr=[...headerFieldArr]
                    inputHeads = keysArr
                    newData.filter((item,index)=>{
                        if(index!=0&&index%compressNumber==0){
                            let itemArr = item.split('，').join(',').split(',')
                            let lis = {}
                            for(let k=0;k<headerFieldArr.length;k++){
                                lis[headerFieldArr[k]] = itemArr[k]
                            }
                            data.push(lis)
                        }
                    })
                }else if($("#split").val()=='空格'){
                    newData.filter((item,index)=>{
                        if(index!=0&&index%compressNumber==0) {
                            newData[index] = newData[index].replace(new RegExp('             ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('            ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('           ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('          ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('         ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('        ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('       ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('      ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('     ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('    ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('   ', 'g'), ' ')
                            newData[index] = newData[index].replace(new RegExp('  ', 'g'), ' ')
                        }
                    })
                    let headerFieldArr = newData[0].split(' ')
                    keysArr=[...headerFieldArr]
                    inputHeads = keysArr
                    newData.filter((item,index)=>{
                        if(index!=0&&index%compressNumber==0){
                            let itemArr = item.split(' ')
                            let lis = {}
                            for(let k=0;k<headerFieldArr.length;k++){
                                lis[headerFieldArr[k]] = itemArr[k]
                            }
                            data.push(lis)
                        }
                    })
                }
            }
            let keyAll = []
            keysArr.filter(item=>{
                keyAll.push({
                    field: item,
                    title: item,
                    width: 480,
                    visible: true,
                    sortable: false,
                    align: 'center',
                })
            })
            $('#fileListBox').bootstrapTable('destroy').bootstrapTable({
                sortable: true,
                sortOrder: "asc",
                striped: true,
                clickToSelect: true,
                pagination: true,
                pageNumber: 1,
                pageSize: 20,
                pageList: [10, 25, 50, 100],
                paginationPreText: "上一页",
                paginationNextText: "下一页",
                paginationFirstText: "首页",
                paginationLastText: "最后一页",
                rowStyle:rowStyle,
                cache: false,
                columns: keyAll,
                data: data,
            });
            $(".pagination-detail").css('display','none')
            $(".no-records-found td").html('没有数据请您重新筛选')
            saveExtModelsData()
        })
    }
    /**
     * 共享生成qby文件
     */
    $("#btnArchive").on('click',function (){
        zipqbyFunc(_path.join(_currentProj["projPath"],'txtModal'), function (path){
            alert("生成可共享模型文件成功！");
            _shell.showItemInFolder(_path.join(_currentProj["projPath"],'models','extractor_model.json'));
        });
    })
    function zipqbyFunc(name, callback) {
        let zip = new AdmZipD();
        zip.addLocalFolder(_path.join(_currentProj["projPath"],"models"))
        zip.toBuffer();
        let archivePath = _path.join(name+".qby");
        zip.writeZip(archivePath);
        if(typeof callback === "function"){
            callback(archivePath);
        }
    }
    function saveExtModelsData(){
        let lis={
            modelID:modelID,
            modelName:'txt解析',
            modelType:'table',
            split:$("#split").val(),
            split1:$("#split").val(),
            compressNumber:$("#compressNumber").val(),
            isHeaderHave:$("#isHeaderHave").val(),
            headerArr:headerArr,
            original_file: original_file
        }
        if($("#split").val()=='空格'){
            lis.split = ' '
        }
        if($("#isHeaderHave").val()=='是'){
            lis.startCell=[1,1]
            lis.inputHeads=headerArr
        }else{
            lis.startCell=[2,1]
            lis.inputHeads=inputHeads
        }
        _extModelsData.models=[]
        _extModelsData.models.push(lis)
        _fse.writeJsonSync(_extractorModelFile, _extModelsData);
    }
})
