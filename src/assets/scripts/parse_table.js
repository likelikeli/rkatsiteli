const parseModel = window.LS.get('parseModel')
const currentProj = window.LS.get('CurrentProj')
const _ = require('lodash')
const EXTENSIONS = 'xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html|docx'.split('|')
const fromAuto = window.LS.get('fromAuto')
const original_file = window.LS.get('original_file')
const div = document.querySelector('.card-body')
const axios = require('axios');
const xlsx = require('xlsx')
const qs = require('qs');
let _fs=require("fs")
const cheerio = require('cheerio')
let uuid = require('uuid-random')
const mammoth = require('mammoth')
let _currentModel = {}, data = [], sp = {}
var rowStyle = function (row, index) {
    var classes = ['success1', 'info1'];
    if (index % 2 === 0) {
        return { classes: classes[0]};
    } else {
        return {classes: classes[1]};
    }
}
let dataSou
$(function () {
    dataSou={
        nodes:[],
        links:[]
    }
    const filePath = JSON.parse(currentProj)['projPath'] + '/' + original_file
    if (fromAuto === '0') {
        $('.card-body').show()
        if (typeof parseModel === 'undefined') {
            $('#tipProcess').show()
            $('#tipUpload').hide()
        } else {
            _currentModel = JSON.parse(parseModel)
            processFile({path: filePath, name: _path.basename(filePath)})
        }

        const handleReadBtn = async function () {
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
        }

        div.addEventListener('click', handleReadBtn, false)
    } else {
        $('.card-body').hide()
        $('#selectModel').show()
        const modelPath = window.LS.get('autoModelPath')
        const filePath = window.LS.get('autoFilePath')
        const modelObj = _fse.readJSONSync(modelPath)
        //渲染模型选择
        const models = _.get(modelObj, 'models', [])
        let html = ''
        models.forEach(model => {
            html += `<option value="${model.modelID}">${model.modelName}</option>`
        })
        $('#modelSelect').append(html)

        const wb = XLSX.readFile(filePath)
        const tblHtml = $('#htmlout')

        let htmlStr = ''
        wb.SheetNames.forEach(function (sheetName) {
            try {
                if(wb.Sheets[sheetName]['!ref']){
                    let refss = wb.Sheets[sheetName]['!ref'].split(':')
                    let startNum = parseInt(dislodgeLetter(refss[0]))
                    let endNum = parseInt(dislodgeLetter(refss[1]))
                    let startLetter = dislodgeNum(refss[0])
                    let endLetter = dislodgeNum(refss[1])
                    let jo = 0
                    let keys = []
                    for(let k =0;k<az.length;k++){
                        if(az[k]==startLetter){
                            jo++
                        }
                        if(az[k]==endLetter){
                            jo++
                        }
                        if(jo==1){
                            keys.push(az[k])
                        }
                        if(jo==2){
                            keys.push(az[k])
                            break
                        }
                    }
                    for(let j=startNum;j<=endNum;j++){
                        for(let n=0;n<keys.length;n++){
                            let nn = keys[n]+j
                            if(wb.Sheets[sheetName][nn]){

                            }else{
                                wb.Sheets[sheetName][nn] = {
                                    v:'',
                                    w:'',
                                    t:'n'
                                }
                            }
                        }
                    }
                }
                htmlStr += '<div class="sheetName">' + sheetName + '</div>'
                htmlStr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {editable: false})
            } catch (e) {
            }
        })

        const decodedText = iconv.encode(htmlStr, 'utf-8').toString()
        tblHtml.html(decodedText)
    }
})
function createCoordinate(container){

    container.find("table").each(function(i){

        var tbl = $(this);
        tbl.attr("tableIndex",(i+1))
        let lee = 0
        tbl.find("tr").each(function () {
            let lengths = $(this).find("td").length
            $(this).find("td[colspan]").each(function (e) {
                lengths += parseInt($(this).attr('colspan')) - 1
            })
            if(lengths>lee){
                lee = lengths
            }
        });
        let headline = '<tr>';
        for (let i = 0; i < lee; i++) {
            headline += '<td class="headline headlineX">' + az[i] + '</td>';
        }
        headline+='</tr>';
        tbl.prepend(headline);
        tbl.find("tr").each(function (e){
            $(this).prepend('<td class="headline headlineY">'+e+'</td>');
        });

        for(var y=0; y<tbl.find("tr").length; y++){

            var tr= tbl.find("tr").eq(y);

            var _x = 0;
            for(var x=0; x< tr.find("td").length; x++){
                var td= tr.find("td").eq(x);

                td.attr('tableIndex',tbl.attr("tableIndex"))
                if(td[0].id){
                    td[0].innerHTML=td[0].innerHTML+"<div id='"+td[0].id+"test"+tbl.attr("tableIndex")+"' class='leaders'></div>"
                }
                td.attr("Y", td.cellPos().Y)
                td.attr("X", td.cellPos().X)

            }
        }
    })

}
//解析上传文件
async function processFile(file) {
    if(file.name == 'original.docx') {
        const res = await mammoth.convertToHtml({path: file.path})
        let data = {}, root
        const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
        try {
            root = cheerio.load(res.value)
        } catch (e) {
        }
        const tableHtml = root('table').eq(tableIndex - 1).html()

        $("#htmlDoc").html(`<table>${tableHtml}</table>`)

        createCoordinate($("#htmlDoc"));
        let $1 = cheerio.load(`<table>${tableHtml}</table>`)
        try {
            switch (_currentModel.modelType) {
                case 'freelink':
                    break
                case 'simplefreelink':
                    break
                case 'table':
                    data = extractTable(_currentModel, $1)
                    break
            }
            $('#htmlout').show()
        } catch (e) {
        }
    }else {
        $('#tipUpload .mb-1').text('已上传文件：' + file.name)

        file.extname = _path.extname(file.name)
        const workbook = XLSX.readFile(file.path)
        const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
        if (tableIndex < 1) return
        const sheetName = workbook.SheetNames[tableIndex - 1]
        const ws = workbook.Sheets[sheetName]

        if (!('!ref' in ws)) return
        switch (_currentModel.modelType) {
            case 'freelink':
                break
            case 'simplefreelink':
                break
            case 'table':
                data = extractTable(_currentModel, ws)
        }
        const html = convertJsonToTable(data)
        $('#htmlout').show()
    }
}

function extractTable(model, ws) {
    let rowJia = 0
    let cowJia = 0
    if(_.get(model, 'valuesColSpan', 0)){
        cowJia = _.get(model, 'valuesColSpan', 0) - 1
    }
    if(_.get(model, 'valuesRowSpan', 0)){
        rowJia = _.get(model, 'valuesRowSpan', 0) - 1
    }
    const x = _.get(model, 'startCell.0', 0)
    const y = _.get(model, 'startCell.1', 0)
    const startX = _.get(model, 'valuesStartCell.0', 0) + x
    const startY = _.get(model, 'valuesStartCell.1', 0) + y - 1
    const endX = _.get(model, 'valuesEndCell.0', 0) + x + cowJia
    const endY = _.get(model, 'valuesEndCell.1', 0) + y + rowJia
    const loopEnd = _.get(model, 'loopEnd', [])
    const {modelID = '', modelName = '', modelType = '', keys = []} = model
    if (!ws.hasOwnProperty('!ref')) {
        return false
    }
    const range = XLSX.utils.decode_range(ws['!ref'])
    //判断如果是单行的表头就不合并列
    const shouldMergeColspan = Object.keys(keys).length !== 1
    let newKeys = _.cloneDeep(keys)

    let data = []
    if (shouldMergeColspan) {
        //如果有合并列的表头，添加
        keys.forEach(key => {
            const colspan = parseInt(_.get(key, 'colspan', 1)),
                rowspan = parseInt(_.get(key, 'rowspan', 1))
            if (colspan * rowspan > 1) {
                for (let i = 0; i < colspan; i++) {
                    for (let j = 0; j < rowspan; j++) {
                        if (i===0 && j ===0) {
                            //do noting
                        } else {
                            keys.push({...key, position: [i + key.position[0], j + key.position[1]]})
                        }
                    }
                }
            }
        })
        const groupKeys = _.groupBy(keys, 'position.0')
        let a = []
        _.forEach(groupKeys, groupKey => {
            const ret = _.orderBy(groupKey, 'position.1')
            let name = []
            ret.forEach(item => {
                name.push(item.name)
            })
            let ls={}
            groupKey.filter((item,index)=>{
                if(!item.colspan){
                    ls=item
                }
            })
            if(Object.keys(ls).length<1){
                ls=groupKey[groupKey.length-1]
                ls.position=[groupKey[0].position[0],groupKey[groupKey.length-1].position[1]]
            }
            a.push({...ls, name: _.uniq(name).join('|')})
        })
        newKeys = a
    }
    for(let k=0;k< newKeys.length;k++){
        for(let m=k+1;m<newKeys.length;m++){
            if(newKeys[k]._id==newKeys[m]._id){
                newKeys.splice(m,1)
                k--
            }
        }
    }
    if (loopEnd.length === 0) {
        // 范围开始到范围结束流程
        data = parseRange(newKeys, [x, y], [startX, startY], [endX, endY], ws)
    }
    if (loopEnd.length) {
        const loopEndType = _.get(model, 'loopEndType', 'emptyRow')
        switch (loopEndType) {
            case 'emptyRow':
                const row = getEmptyRow(range, startY, ws)
                data = parseRange(newKeys, [x, y], [startX, startY], [0, row], ws)
                break
            case 'lastLine':
                const endLine = _.get(range, 'e.r', 0) + 1
                data = parseRange(newKeys, [x, y], [startX, startY], [0, endLine], ws)
                break
            case 'equalString':
                const loopEndString = _.get(model, 'loopEndString', '')
                const col = _.get(loopEnd, '0', 0) + startX - 1
                const endLineE = getStringRow(range, startY, loopEndString, ws, col) + 1
                data = parseRange(newKeys, [x, y], [startX, startY], [0, endLineE], ws)
                break
            case 'containString':
                const loopEndStringC = _.get(model, 'loopEndString', '')
                const colC = _.get(loopEnd, '0', 0) + startX - 1
                const endLineC = getStringRow(range, startY, loopEndStringC, ws, colC, 'contain') + 1
                data = parseRange(newKeys, [x, y], [startX, startY], [0, endLineC], ws)
                break
        }
    }

    const startCellName = getCellValue(x - 1, y - 1, ws)
    return data
}

function parseRange(keys, startCell, valuesStart, valuesEnd, ws) {
    const [x, y] = startCell
    const [colStart, rowStart] = valuesStart
    const [colEnd, rowEnd] = valuesEnd
    const sheetMerges = _.get(ws, '!merges', [])
    const data = []
    for (let r = rowStart; r < rowEnd; r++) {
        let obj = {}
        keys.forEach(key => {
            const c = _.get(key, 'position.0', 0) + x - 1
            const colspan = _.get(key, 'colspan', 1)
            let merge = {}, v = ''

            if (colspan > 1) {
                let k = []
                for (let j = c; j <= c + colspan - 1; j++) {
                    if (sheetMerges.length > 0) {
                        merge = _.find(sheetMerges, o => {
                            return o.s.c <= j && o.e.c >= j && o.s.r <= r && o.e.r >= r
                        })
                    }
                    const tempV = merge ? getCellValue(_.get(merge, 's.c', ''), _.get(merge, 's.r', ''), ws) : getCellValue(j, r, ws)
                    k.push(tempV)
                }
                v = _.join(_.uniq(_.compact(k)), '|')
            } else {
                if (sheetMerges.length > 0) {
                    merge = _.find(sheetMerges, o => {
                        return o.s.c <= c && o.e.c >= c && o.s.r <= r && o.e.r >= r
                    })
                }
                let mergeKey
                if(merge){
                    mergeKey=Object.keys(merge)
                }
                v = mergeKey&&mergeKey[0] ? getCellValue(_.get(merge, 's.c', ''), _.get(merge, 's.r', ''), ws) : getCellValue(c, r, ws)
            }
            _.set(obj, formatStr(key.name.replace('.', 'dottod')), formatStr(v))
        })
        data.push(obj)
    }
    return data
}

function getStringRow(range, valueStartY, str, ws, col, type = 'equal') {
    const nRow = _.get(range, 'e.r', 0)
    let n = 0
    for (let i = valueStartY; i <= nRow; i++) {
        if (type === 'equal' ? getCellValue(col, i, ws) === str : getCellValue(col, i, ws).indexOf(str) > -1) {
            n = i
            break
        }
    }
    return n
}

function getEmptyRow(range, valueStartY, ws) {
    const nRow = _.get(range, 'e.r', 0)
    const nCol = _.get(range, 'e.c', 0)
    let n = nRow
    for (let i = valueStartY; i <= nRow; i++) {
        if (allCellEmpty(ws, i, nCol)) {
            n = i
            break
        }
    }
    return n
}

function allCellEmpty(ws, row, cols) {
    let empty = true;

    [...Array(cols).keys()].forEach(col => {
        if (getCellValue(col, row, ws)) {
            empty = false
            return false
        }
    })
    return empty
}

function getCellValue(x, y, ws) {
    const cell_address = {c: x, r: y}
    const cell_ref = XLSX.utils.encode_cell(cell_address)
    if(_.get(ws, `${cell_ref}.w`, '')){
        return _.get(ws, `${cell_ref}.w`, '')
    }else{
        return _.get(ws, `${cell_ref}.v`, '')
    }
}

function formatStr(str) {
    str = str.replace('\r', '')
    str = str.replace('\n', '')
    str = str.replace('|n', '')
    return str
}

function convertJsonToTable(data) {
    let keyAll=[]
    let headerKey = Object.keys(data[0])
    $.each(_currentModel.keys,(index1,item1)=> {
        if (item1.name && (item1.name.indexOf('↵')||item1.name.indexOf('' +
            '')||item1.name.indexOf('\n'))) {
            if(item1.name.indexOf('' +
                '')){
                item1.name = item1.name.split('' +
                    '').join('')
            }else{
                if(item1.name.indexOf('\n')){
                    item1.name = item1.name.split('' +
                        '\n').join('')
                }else{
                    item1.name = item1.name.split('↵').join('')
                }

            }

        }
    })
    let nodes1=[],nodes2=[],nodes3=[]
    let datasourced={nodes:[],links:[]}
    let rootTu=uuid()
    let rootCp=uuid()
    let rootBl=uuid()
    let rootArr = []
    for(let k  in data[0]){
        let uuids = uuid()
        rootArr.push({id:uuids,name:k})
        datasourced.nodes.push({
            id:uuids,
            "label": k,
        })
    }
    let datas=JSON.parse(JSON.stringify(data))
    datas.filter(item=>{
        for(let m in item){
           let m1=m.replace(/\s+/g,"")
            let k1=item[m]
            delete item[m]
            item[m1]=k1
        }
    })
    datas.filter(item=>{
        rootArr.filter(kVal=>{
            if(item[kVal.name]){
                let uuilds=uuid()
                if(nodes1.indexOf(item[kVal.name])!=-1){
                    item[kVal.name]=item[kVal.name]
                }
                nodes1.push(item[kVal.name])
                let lis={
                    id:uuilds,
                    "label":item[kVal.name],
                    ...item
                }
                datasourced.nodes.push(lis)
                datasourced.links.push({
                    id:uuid(),
                    source:kVal.id,
                    target:uuilds
                })
            }
        })
    })
    dataSou=datasourced
    headerKey.filter((item,index3)=>{
        keyAll.push({
            field: item,
            title: item,
            width: 480,
            visible: true,
            sortable: false,
            align: 'center',
            formatter: function (value, row, index) {
                let fff=false
                $.each(_currentModel.keys,(index1,item1)=>{
                    if(item1.name==item){
                        if(item1.nameS){
                            fff=true
                        }
                    }
                })
                if(fff){
                    $("#tableData thead tr th:nth-of-type("+(index3+1)+")").addClass('backgroundFFB9')
                    return "<div class='btnStandard'>"+ value+"</div> "
                }else{
                    return"<div class='btnDefault'>"+  value+"</div> "
                }
            }
        })
    })
    $('#htmlout table').bootstrapTable('destroy').bootstrapTable({
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
}

//返回按钮
$('#btn_return').on('click', function () {
    window.location.href = 'extractor.html'
})

//表格导出数据
$('#exportExcel').on('click', function () {
    downloadXlsxFile(data)
})
let workbook2blob=(workbook)=> {
    let wopts = {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    };
    var wbout = xlsx.write(workbook, wopts);
    let s2ab=(s)=> {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
    let blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
    return blob;
}
let openDownloadDialog=(blob, fileName)=> {
    if (typeof blob == "object" && blob instanceof Blob) {
        blob = URL.createObjectURL(blob);
    }
    let aLink = document.createElement("a");
    aLink.href = blob;
    aLink.download = fileName || "";
    let event;
    if (window.MouseEvent) event = new MouseEvent("click");
    else {
        event = document.createEvent("MouseEvents");
        event.initMouseEvent( "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
    }
    aLink.dispatchEvent(event);
}
let downloadXlsxFile=(dataSources)=>{
    let sheet2 = xlsx.utils.json_to_sheet(dataSources);
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet2, "sheet1");
    let workbookBlob = workbook2blob(wb);
    let dasts=new Date()
    let getFullYear=dasts.getFullYear()
    let getMonth=dasts.getMonth()
    if(getMonth<10){
        getMonth='0'+(getMonth+1)
    }
    let getDate=dasts.getDate()
    if(getDate<10){
        getDate='0'+getDate
    }
    let getHours=dasts.getHours()
    if(getHours<10){
        getHours='0'+getHours
    }
    let getMinutes=dasts.getMinutes()
    if(getMinutes<10){
        getMinutes='0'+getMinutes
    }
    let getSeconds=dasts.getSeconds()
    if(getSeconds<10){
        getSeconds='0'+getSeconds
    }
    openDownloadDialog(workbookBlob, '数据文件_'+getFullYear+getMonth+getDate+getHours+getMinutes+getSeconds+'.xlsx')
}

function handleFile() {
    let formData = new FormData(),
    fs = $("#file")[0].files;
    let max_size = 1024 * 1024 * 100

    for (let i = 0; i < fs.length; i++) {
        let d = fs[0]
        if(d.size <= max_size){
            formData.append("files", fs[i]);
        }else{
            alert('上传文件过大！')
            return false
        }
    }
    localStorage.setItem("formData",formData)
}

$('#exportExcel2').on('click', function () {
    saveJSON(data,'表格型文件.json')
})

$('#exportExcel3').on('click', function () {
    saveJSON(dataSou,'graphJson.json')
})
$("#exportExcel4").on('click', function () {
    $('#addMultidimensional').modal({backdrop: 'static'})
})

$("#mergeData").on('click', function () {
    $('#addMultidimensional').modal('hide')
    mixDataMerge()
})

// 文件上传
let filesnameArr=[]
let filesDataArr=[]
$("#uploadFileBtn").on('click', async function () {
    $("#mergeData").removeAttr("disabled")
    const files = await _remote.dialog.showOpenDialog({
        title: '选择一个文件',
        filters: [{
            name: "Spreadsheets",
        }],
        properties: ['openFile','treatPackageAsDirectory']
    });
    if(files.filePaths.length > 0) {
        filesnameArr.push(_path.basename(files.filePaths[0]))
        var executablePath = _fse.readJSONSync(files.filePaths[0])
        filesDataArr.push(executablePath)
        $("#fileListBox").html("")
        let htmls=''
        $.each(filesnameArr,(index,item)=>{
            htmls+="<div class='fileListBoxLi'>"+item+"</div>"
        })
        $("#fileListBox").html(htmls)
    }
})
function saveJSON(data, filename) {
    if (!data) {
        alert("保存的数据为空");
        return;
    }
    if (!filename) filename = "json.json";
    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
    }
    var blob = new Blob([data], { type: "text/json" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
        "click",
        true, // 是否可以冒泡
        false,// 是否可以阻止事件默认行为
        window,// 指向window对象
        0, // 事件的鼠标点击数量
        0, // 事件的屏幕的x坐标
        0,
        0, // 事件的客户端x坐标
        0,
        false, // 事件发生时 control 键是否被按下
        false, // 事件发生时 alt 键是否被按下
        false, // 事件发生时 shift 键是否被按下
        false, // 事件发生时 meta 键是否被按下
        0, // 鼠标按键值
        null
    );
    a.dispatchEvent(e);
}
function mixDataMerge() {
    let datas=filesDataArr[0]
    let rootData=[]
    $.each(datas.nodes,(index,item)=>{
        if(!item.key){
            rootData.push(item)
        }
    })
    for(let m1 =1;m1<filesDataArr.length;m1++){
        $.each(filesDataArr[m1].nodes,(index,item)=>{
            if(!item.key){
                let isTrue=false
                rootData.filter((item1)=>{
                    if(item1.label==item.label){
                        isTrue=true
                        $.each(filesDataArr[m1].links,(key,val)=>{
                            if(val.source==item.id){
                                val.source = item1.id
                            }
                            if(val.target==item.id){
                                val.target=item1.id
                            }
                        })
                    }
                })
                if(!isTrue){
                    datas.nodes.push(item)
                }
            }
            else{
                let isTrue=false
                datas.nodes.filter((item2)=>{
                    if(item.label==item2.label){
                        isTrue=true
                        $.each(filesDataArr[m1].links,(key,val)=>{
                            if(val.source==item.id){
                                val.source = item2.id
                            }
                            if(val.target==item.id){
                                val.target=item2.id
                            }
                        })
                    }
                })
                if(!isTrue){
                    datas.nodes.push(item)
                }
            }
        })
    }
    for(let m1 =1;m1<filesDataArr.length;m1++){
        filesDataArr[m1].links.filter((item)=>{
            datas.links.push(item)
        })
    }
    for(let m=0;m<datas.links.length;m++){
        let cc=0
        for(let m1=0;m1<datas.links.length;m1++){
            if(datas.links[m].target==datas.links[m1].target&&datas.links[m].source==datas.links[m1].source){
                cc++
            }
        }
        if(cc>1){
            datas.links.splice(m,1)
            m--
        }
    }
    $.each(datas.nodes,(index,item)=>{
        delete item.key
    })
    $.each(datas.links,(index,item)=>{
        delete item.label
    })

    saveJSON(datas,'multidimensionalMix.json')
    $("#fileListBox").html("")
    filesDataArr=[]
}
(function ($) {
    /* { left: x-coord, top: y-coord } */
    function scanTable( $table ) {
        var m = [];
        $table.children( "tr" ).each( function( y, row ) {
            $( row ).children( "td, th" ).each( function( x, cell ) {
                var $cell = $( cell ),
                    cspan = $cell.attr( "colspan" ) | 0,
                    rspan = $cell.attr( "rowspan" ) | 0,
                    tx, ty;
                cspan = cspan ? cspan : 1;
                rspan = rspan ? rspan : 1;
                for( ; m[y] && m[y][x]; ++x );  //跳过被占的TD在当前行中
                for( tx = x; tx < x + cspan; ++tx ) {
                    for( ty = y; ty < y + rspan; ++ty ) {
                        if( !m[ty] ) {
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }
                var pos = { Y: y, X: x };
                $cell.data( "cellPos", pos );
            } );
        } );
    };

    /* 输出plugin */
    $.fn.cellPos = function( rescan ) {
        var $cell = this.first(),
            pos = $cell.data( "cellPos" );
        if( !pos || rescan ) {
            var $table = $cell.closest( "table, thead, tbody, tfoot" );
            scanTable( $table );
        }
        pos = $cell.data( "cellPos" );
        return pos;
    }
})(jQuery);
