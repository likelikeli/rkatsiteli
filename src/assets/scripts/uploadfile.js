
if(_remote){
    const _remote = require('electron').remote;
}
let  _fs = require('fs')
const iconv = require('iconv-lite');

const _jschardet = require("jschardet")

const EXTENSIONS = "xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html|docx".split("|");

let _currentProj = {};
let _currentProjFilePath;
let _currentProjFileData = {};

$(function(){
    //***********************项目初始化
    _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    _currentProjFile = _path.join(_currentProj["projPath"], "project.json");
    _currentProjFileData = _fse.readJsonSync(_currentProjFile);
    if(_currentProjFileData.hasOwnProperty("original_file") && _currentProjFileData.hasOwnProperty("table_file") &&
        _currentProjFileData["original_file"].length>1 && _currentProjFileData["table_file"].length>1){
        if(_currentProjFileData.table_file=='tablefile.json'){
            getToNextPg1()
        }else{
            getToNextPg()
        }
    }else{
        $("#tipCheck").hide();
        $("#tipUpload").show();
    }

    function getToNextPg(){
        window.location.href = "extractor.html"
    }
    function getToNextPg1(){
        window.location.href = "jsonExtractor.html"
    }
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

        $("#tipUpload").hide();
        $("#tipProcess").show();
        file.extname =  _path.extname(file.name);
        // 处理原始文件
        const originalFile = _path.join(_currentProj["projPath"], "original"+file.extname);
        _fse.copySync(file.path, originalFile);
        _currentProjFileData.original_file = "original"+file.extname;

        if(file.extname == ".docx"){
            const bufferContent = _fs.readFileSync(file.path, null).buffer;
            mammoth.convertToHtml({ arrayBuffer: bufferContent })
                .then(function(result){
                    document.getElementById("htmlout").innerHTML = result.value;
                    outputTbl(result.value);
                })
                .done();
        }else if(file.extname != ".json"){
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
                    const tblHtml = $("#htmlout");
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
                    $("#htmlout").html(decodedText);
                    outputTbl(decodedText);
                })
            }else{
                wb = XLSX.readFileSync(file.path);
                const tblHtml = $("#htmlout");
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
                $("#htmlout").html(decodedText);
                outputTbl(decodedText);
            }
        }else{
            const wb = _fs.readFileSync(file.path,'utf-8')
            const tableFile = _path.join(_currentProj["projPath"], "tablefile.json");
            _fse.writeFileSync(tableFile, wb);
            _currentProjFileData.table_file = "tablefile.json";
            saveDataProj();
            getToNextPg1()
        }

        function outputTbl(tblHtml){
            // 处理数据表文件
            const tableFile = _path.join(_currentProj["projPath"], "tablefile.html");
            _fse.writeFileSync(tableFile, tblHtml);
            _currentProjFileData.table_file = "tablefile.html";
            saveDataProj();
            getToNextPg();
        }
    }

    function saveDataProj(){
        _fse.writeJsonSync(_currentProjFile, _currentProjFileData);
    }
})

function toArrayBuffer(buf) {
	var ab = new ArrayBuffer(buf.length);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
		view[i] = buf[i];
	}
	return ab;
}

function toBuffer(ab) {
	var buf = new Buffer(ab.byteLength);
	var view = new Uint8Array(ab);
	for (var i = 0; i < buf.length; ++i) {
		buf[i] = view[i];
	}
	return buf;
}
