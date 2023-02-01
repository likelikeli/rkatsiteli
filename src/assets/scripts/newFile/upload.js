let _uuid = require('uuid-random')
const _shell = require('electron').shell
let _fs = require('fs')
let _ = require('lodash')
const _jschardet = require("jschardet");
const iconv = require("iconv-lite");
let _currentProj = {};
let _currentProjFileData = {};
let EXTENSIONS = []
$(function () {
    let urls = window.location.search.substring(1)
    let vars = urls.split("&");
    let arrobject1={}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrobject1[pair[0]]=decodeURI(pair[1])
    }
    if(arrobject1.type=='excel'){
        EXTENSIONS = 'xls|xlsx'.split("|");
    }else if(arrobject1.type=='csv'){
        EXTENSIONS= 'csv'.split("|");
    }else if(arrobject1.type=='txt'){
        EXTENSIONS= 'txt'.split("|");
    }
    $(document).on('click', '.goBack', async function() {
        window.location.href = 'project1.html?type='+arrobject1.type
    })
    _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    _currentProjFile = _path.join(_currentProj["projPath"], "project.json");
    _fs.access(_currentProj["projPath"], _fs.constants.F_OK,function (res) {
        if (res) {
        }else{
            _fs.access(_currentProjFile, _fs.constants.F_OK,function (res) {
                if (res) {
                }else{
                    _currentProjFileData = _fse.readJsonSync(_currentProjFile);
                    if(_currentProjFileData.hasOwnProperty("original_file") && _currentProjFileData.hasOwnProperty("table_file") &&
                        _currentProjFileData["original_file"].length>1 && _currentProjFileData["table_file"].length>1){
                        window.location.href = 'parseDetail.html?type='+arrobject1.type
                    }
                }
            })
        }
    })
    var div=document.querySelector('.card-body');
    //绑定拖拽事件
    div.addEventListener('drop', function(e){
        //必须要阻止拖拽的默认事件
        e.preventDefault();
        e.stopPropagation();
        //获得拖拽的文件集合
        var files=e.dataTransfer.files;
        if(files.length>0){
            processFile (files[0])
        }
    });
    const handleReadBtn = async function() {
        const files = await _remote.dialog.showOpenDialog({
            title: '选择一个文件',
            filters: [{
                name: "Spreadsheets",
                extensions: EXTENSIONS
            }],
            properties: ['openFile','treatPackageAsDirectory']
        });
        if(files.filePaths.length > 0) {
            processFile ({
                path : files.filePaths[0],
                name : _path.basename(files.filePaths[0])
            })
        }
    };
    // 绑定点击事件
    div.addEventListener('click', handleReadBtn, false);
    //绑定拖拽结束事件
    div.addEventListener('dragover',(e)=>{
        //必须要阻止拖拽的默认事件
        e.preventDefault();
        e.stopPropagation();
    });
    function processFile (file){
        file.extname =  _path.extname(file.name);
        // 处理原始文件
        const originalFile = _path.join(_currentProj["projPath"], "original"+file.extname);
        _fse.copySync(file.path, originalFile);
        _currentProjFileData.original_file = "original"+file.extname;
        let  wb
       if(file.extname == ".csv"||file.extname == ".CSV"){
            let res=_fs.createReadStream(file.path,{encoding:"binary"});
            let chunks='';
            res.on('data',(chunk)=>{
                chunks+=chunk
            });
            res.on('end',()=> {
                let encoding = _jschardet.detect(chunks).encoding
                let str
                if(encoding=="UTF-8"||encoding=="utf-8"){
                    str = _fs.readFileSync(file.path, 'utf8');
                }else{
                    const buf = Buffer.from(chunks, 'binary')
                    str = iconv.decode(buf, "GBK")
                }
                wb = XLSX.read(str, {
                    type: 'binary',
                    raw:true,
                });
                let htmlstr = '';
                wb.SheetNames.forEach(function(sheetName) {
                    try{
                        let ref = wb.Sheets[sheetName]['!ref']
                        let ref_array = ref.split(':')
                        if(ref_array.length > 1) {
                            wb.Sheets[sheetName]['!ref'] = `A1:${ref_array[1]}`
                        }
                        htmlstr += '<div class="sheetName">'+sheetName+'</div>';
                        htmlstr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName],{editable:false});
                    }catch(e){}
                });
                const enc_det = _jschardet.detect(htmlstr.substring(0,200));
                _currentProjFileData.original_encode = enc_det.encoding;
                var decodedText = iconv.encode(htmlstr, "utf-8").toString();
                outputTbl(decodedText);
            })
        }else{
            wb = XLSX.readFileSync(file.path);
            let htmlstr = '';
            wb.SheetNames.forEach(function(sheetName) {
                try{
                    let ref = wb.Sheets[sheetName]['!ref']
                    let ref_array = ref.split(':')
                    if(ref_array.length > 1) {
                        wb.Sheets[sheetName]['!ref'] = `A1:${ref_array[1]}`
                    }
                    htmlstr += '<div class="sheetName">'+sheetName+'</div>';
                    htmlstr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName],{editable:false});
                }catch(e){}
            });
            const enc_det = _jschardet.detect(htmlstr.substring(0,200));
            _currentProjFileData.original_encode = enc_det.encoding;
            var decodedText = iconv.encode(htmlstr, "utf-8").toString();
            outputTbl(decodedText);
       }
        function outputTbl(tblHtml){
            // 处理数据表文件
            const tableFile = _path.join(_currentProj["projPath"], "tablefile.html");
            _fse.writeFileSync(tableFile, tblHtml);
            _currentProjFileData.table_file = "tablefile.html";
            saveDataProj();
            setTimeout(()=>{
                if(arrobject1.type=='excel'){
                    window.location.href = 'upload.html?type=excel'
                }else  if(arrobject1.type=='csv'){
                    window.location.href = 'upload.html?type=csv'
                }else{
                    window.location.href = 'upload.html?type=excel'
                }
            },100)
        }
        function saveDataProj(){
            _fse.writeJsonSync(_currentProjFile, _currentProjFileData);
        }
    }
})
