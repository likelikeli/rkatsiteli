const iconv = require('iconv-lite')
const _ = require('lodash')
const cytoscape = require('cytoscape')
const d3Force = require('cytoscape-d3-force')
const currentProj = window.LS.get('CurrentProj')
const original_file = window.LS.get('original_file')
if (_remote) {
    const _remote = require('electron').remote
}
const shaObj = new jsSHA("KMAC128", "TEXT", {
    customization: { value: "My Tagged Application", format: "TEXT" },
    kmacKey: { value: "abc", format: "TEXT" },
});

const xlsx = require('xlsx')
const parseModel = window.LS.get('parseModel')
const parseModelAll= window.LS.get('parseModelAll')
const div = document.querySelector('.card-body')
const EXTENSIONS = 'xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html|docx'.split('|')

const _modalSelect = new bootstrap.Modal(document.getElementById('modalSelect'), {keyboard: false})
let  paths = [], sp = {},_parseModelAll=[]
let dataAll=[]
const fromAuto = window.LS.get('fromAuto')

$('#selectKeys').on('click', function () {
    _modalSelect.show()
})

$('#btnSelect').on('click', function () {
    _modalSelect.hide()
    let pathsClone = _.clone(paths), arr = []

    $('input[name="keys"]:checked').each(function (i) {
        arr.push($(this).val())
    })
    renderTreePath(pathsClone, arr)
})

$(function () {
    const filePath = JSON.parse(currentProj)['projPath'] + '/' + original_file
    if(fromAuto === '0') {
        $('.card-body').show()
        if (typeof parseModel === 'undefined') {
            $('#tipUpload').hide()
        } else {
            _parseModelAll = JSON.parse(parseModelAll)
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
        const filePath = window.LS.get('autoFilePath')
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
//渲染普通表
function renderTable(model,index,ws) {
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
    const tableIndex = parseInt(_.get(model, 'tableIndex', 0))
    const curKeys = _.cloneDeep(model['keys'])
    const {modelID = '', modelName = '', modelType = '', keys = []} = model
    const loopEnd = _.get(model, 'loopEnd', [])
    //判断如果是单行的表头就不合并列
    const shouldMergeColspan = Object.keys(keys).length !== 1
    let newKeys = curKeys
    const range = XLSX.utils.decode_range(ws['!ref'])
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
    let dataAllLi={
        modelName:model.modelName,
        modelType:model.modelType,
        sheetName:model.tableIndexName,
        keys:model.keys,
        modelID:model.modelID,
        data:data
    }
    dataAll.push(dataAllLi)
    let columns = []
    if(data.length > 0) {
        const k = Object.keys(data[0])
        k.forEach(item => {
            columns.push({field: item, title: item, align: 'center'})
        })
    }
    $('#renderTable'+index+' table').bootstrapTable('destroy').bootstrapTable({data, columns})
    $('#renderTable'+index).show()

}
function getCellValue(x, y, ws) {
    const cell_address = {c: x, r: y}
    const cell_ref = XLSX.utils.encode_cell(cell_address)
    return _.get(ws, `${cell_ref}.w`, '')
}

function formatStr(str) {
    str = str.replace('\r', '')
    str = str.replace('\n', '')
    str = str.replace('|n', '')
    return str
}
//解析上传文件
function processFile(file) {
    $("#modelAllBox").html("")
    $('#tipUpload .mb-1').text('已上传文件：' + file.name)
    file.extname = _path.extname(file.name)
    const wb = XLSX.readFile(file.path)
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
    $('#htmloutPre').html(decodedText)
    _parseModelAll.filter((model,index)=>{
        if(model.modelType=='freelink'||model.modelType=='simplefreelink'){
            let newhtmls='  <div class="tableIndexNameS">'+model.tableIndexName+'</div><div id="renderGraph'+index+'" class="renderGraph">' +
                '            <div id="attr'+index+'" class="fy-hide attr"></div>' +
                '        </div>' +
                ' <div style="margin-top:8px;">' +
                '            <button class="btn btn-sm btn-primary exportExcel" data-modelID="'+model.modelID+'">导出表格</button>' +
                '            <button class="btn btn-sm btn-primary exportJson" data-modelID="'+model.modelID+'">导出json文件</button>' +
                '            <button class="btn btn-sm btn-primary exportJson1" data-modelID="'+model.modelID+'">导出graphJson文件</button>' +
                '        </div>' +
                ' <div id="renderData'+index+'" class="fy-hide renderData" style="display: none">' +
                '            <table></table>' +
                '        </div>' +
                '<div id="renderOrigin'+index+'" class="fy-hide renderOrigin" style="display: none"></div>'

            $("#modelAllBox").append(newhtmls)
            parseMdTable(model,index)
            render3DTable(model,index)
            renderGraph(model,index)
        }else{
            let htmltable='<div class="tableIndexNameS">'+model.tableIndexName+'</div><div id="renderTable'+index+'" class="fy-hide renderTable">' +
                '            <div style="margin-bottom:10px;"><button class="btn btn-sm btn-primary exportExcel" data-modelID="'+model.modelID+'">导出表格</button>' +
                '            <button class="btn btn-sm btn-primary exportJson" data-modelID="'+model.modelID+'">导出json文件</button></div>' +
                '            <table></table>' +
                '        </div>'
            $("#modelAllBox").append(htmltable)
            const ws = wb.Sheets[model.tableIndexName]
            renderTable(model,index,ws)
        }

    })
    $(document).on('click','.exportJson1',function () {
        dataGraph.filter(item=>{
            if(item.modelID==$(this).attr('data-modelID')){
                saveJSON(item.data,'graph数据文件.json')
            }
        })
    })
    $(document).on('click','.exportJson',function () {
        dataAll.filter(item=>{
            if(item.modelID==$(this).attr('data-modelID')){
                let newD={sheetName:item.sheetName,data:[]}
                if(item.datasEn){
                    item.datasEn.filter(items=>{
                        delete items.唯一ID
                        delete items.路径
                        delete items.columnId
                        delete items.columnPath
                    })
                    newD.data=item.datasEn
                }else{
                    newD.data=item.data
                }
                saveJSON(newD,'data.json')
            }
        })
    })
    $(document).on('click','.exportExcel',function () {
        dataAll.filter(item=>{
            if(item.modelID==$(this).attr('data-modelID')){
                item.data.filter(items=>{
                    delete items.唯一ID
                    delete items.路径
                    delete items.columnId
                    delete items.columnPath
                })
                downloadXlsxFile1(item.data,item.sheetName)
            }
        })
    })
}
$(document).on('click','#addDataExport',function(){
    let liData=[]
    dataAll.filter(item=>{
        let newD={sheetName:item.sheetName,data:[]}
        if(item.datasEn){
            item.datasEn.filter(items=>{
                delete items.唯一ID
                delete items.路径
                delete items.columnId
                delete items.columnPath
            })
            newD.data=item.datasEn
        }else{
            newD.data=item.data
        }
        liData.push(newD)
    })
    saveJSON(liData,'dataAll.json')
})

//渲染解析前的三维表
function render3DTable(model,index) {
}

//渲染解析后的三维表
function parseMdTable(model,index) {
    const keys = _.cloneDeep(_.get(model, 'keys', [])),
        values = _.cloneDeep(_.get(model, 'values', [])),
        keysRelation = _.cloneDeep(_.get(model, 'keysRelation', []))
    buildTreeE(keysRelation)
    let selectHtml = ''
    paths=[]
    if(keysRelation){
        keysRelation.filter((item)=>{
            let pathss= binaryTreePaths(item)
            pathss.filter(item1=>{
                paths.push(item1)
            })
        })
    }
    paths = binaryTreePaths(keysRelation[0])
    renderTreePath(model,index,_.uniq(paths))
    _.uniqBy(_.concat(model['keys'], _.get(model, 'values', [])), '_id').forEach(key => {
        selectHtml += `<div class="mb-3"><input class="form-check-input" name="keys" type="checkbox" value="${ key['_id'] }" id="${ key['_id'] }">
                    <label class="form-check-label" for="${ key['_id'] }">${ key['name'] }</label></div>`
    })
    $('#modalSelect .modal-body').empty().append(selectHtml)
    $('#renderData'+index+' .title').show()
    $('#renderData'+index).show()
}

function buildTreeE(list) {
    let map = {}, node, tree = [], i
    for (i = 0; i < list.length; i++) {
        if (!map.hasOwnProperty(list[i]._id)) {
            map[list[i]._id] = []
        }
        map[list[i]._id].push(list[i])
        list[i].children = []
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i]
        if (map[node.pid]) {
            if (!map[node.pid].hasOwnProperty('children')) {
                _.set(map[node.pid], 'children', [])
            }
            map[node.pid].forEach(item => {
                item.children.push(node)
            })
        } else {
            tree.push(node)
        }
    }
    return tree
}

//渲染三维表结构化数据
function renderTreePath(model,index,paths, arr = []) {
    let dataNode = []
    let dataEdge=[]
    const nodes = _.concat(model['keys'], _.get(model, 'middleKeys', []), _.get(model, 'values', []))
    nodes.forEach(node => {
        dataNode.push({...node, id: node._id})
    })
    let lid=model['keys']
    dataNode.forEach((item)=>{
        lid.forEach(item1=>{
            if(item.id==item1._id){
                item.position=item1.position
            }
        })
    })
    model['keysRelation'].forEach(relation => {
        if (relation.pid !== '-1') {
            dataEdge.push({
                pid_Id: `${ relation.pid }to${ relation._id }`, pid: relation.pid, id: relation._id}
            )
        }
    })
    let datasJSON=dataHave(dataNode,dataEdge)
    let datas=[]
    let datasEn=[]
    for(let m in datasJSON){
        let lis={字段:'',值:'','唯一ID':''}
        let lisEn={columnName:'',columnValue:'',columnId:'',columnPath:''}
        let jOSNArr=datasJSON[m].name.split("_")
        lis.值=jOSNArr[jOSNArr.length-1]
        lis.字段=datasJSON[m].name.split("_"+lis.值)[0]
        const kmac = shaObj.getHash("HEX", { outputLen: 64 });
        lis['唯一ID']=kmac
        lis['路径']=datasJSON[m].position
        lisEn.columnPath=datasJSON[m].position
        lisEn.columnName=datasJSON[m].name.split("_"+lis.值)[0]
        lisEn.columnValue=jOSNArr[jOSNArr.length-1]
        lisEn['columnId']=kmac
        if(datasJSON[m].nameS){
            lis['值_standard']=jOSNArr[jOSNArr.length-1]
            lis['值']=''
            lisEn['columnValue_standard']=jOSNArr[jOSNArr.length-1]
            lisEn['columnValue']=''
        }
        datas.push(lis)
        datasEn.push(lisEn)
    }
    let dataAllLi={
        modelName:model.modelName,
        modelType:model.modelType,
        sheetName:model.tableIndexName,
        keys:model.keys,
        keysRelation:model.keysRelation,
        modelID:model.modelID,
        data:datas,
        datasEn:datasEn
    }
    dataAll.push(dataAllLi)
    let html=''
    datas.forEach(item => {
        html += `<tr class="mb-3"><td style="width:200px;color:white">${item['字段']}</td><td style="width:200px;"><input data-keyId="${item['字段']}" data-path="${item['路径']}" disabled placeholder="${item['值_standard']?item['值_standard']:'请填写内容'}" class="inputValue" style="width:100%;height:100%" type="text" value=${item['值']}></td></tr>`
    })
    $('#renderData'+index+' table').empty().append(html)
}

//数组转为树
function buildTree(list) {
    let map = {}, node, tree = [], i
    for (i = 0; i < list.length; i++) {
        if (!map.hasOwnProperty(list[i]._id)) {
            map[list[i]._id] = []
        }
        map[list[i]._id].push(list[i])
        list[i].children = []
    }
    for (i = 0; i < list.length; i += 1) {
        node = list[i]
        if (node.pid !== '-1') {
            if(!map[node.pid]) {
                sp = {pid: '-1', _id: node.pid, children: []}
                map[node.pid] = [sp]
            }
            if (!map[node.pid].hasOwnProperty('children')) {
                _.set(map[node.pid], 'children', [])
            }
            map[node.pid].forEach(item => {
                item.children.push(node)
            })
        } else {
            tree.push(node)
        }
    }
    return tree
}

//获取树的所有叶子节点路径
const binaryTreePaths = function (root) {
    const paths = []
    const construct_paths = (root, path) => {
        if (root) {
            path += root._id
            if (_.get(root, 'x', null) !== null) {
                path += `->{x:${ _.get(root, 'x') }}`
            }
            if (_.get(root, 'y', null) !== null) {
                path += `->{y:${ _.get(root, 'y') }}`
            }
            if (root.children.length === 0) { // 当前节点是叶子节点
                paths.push(path) // 把路径加入到答案中
            } else {
                path += '->' // 当前节点不是叶子节点，继续递归遍历
                root.children.forEach(child => {
                    construct_paths(child, path)
                })
            }
        }
    }
    construct_paths(root, '')
    return paths
}
//渲染图
let dataGraph=[]
function renderGraph(model,index) {
    $('#renderGraph'+index).show()
    let data = []
    const nodes = _.concat(model['keys'], _.get(model, 'middleKeys', []), _.get(model, 'values', []))
    nodes.forEach(node => {
        data.push({group: 'nodes', data: {...node, id: node._id}})
    })
    model['keysRelation'].forEach(relation => {
        if (relation.pid !== '-1') {
            data.push({
                group: 'edges',
                data: {id: `${ relation.pid }to${ relation._id }`, source: relation.pid, target: relation._id}
            })
        }
    })
    data.filter((item,index)=>{
        if(item.group=='nodes'){
            let yy=0
            let yy1=0
            data.filter(val=>{
                if(val.group=='edges'){
                    if(val.data.source==item.data.id||val.data.target==item.data.id){
                        yy++
                    }
                }if(val.group=='nodes'){
                    if(val.data.id==item.data.id) {
                        yy1++
                    }
                }
            })
            if(yy<=0){
                data.splice(index,1)
            }
            if(yy1>1){
                data.splice(index,1)
            }
        }
    })
    dataGraph.push({modelID:model.modelID,data:data})
    cytoscape.use(d3Force)
    const cy = cytoscape({
        container: document.getElementById('renderGraph'+index),
        elements: data,
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': function (ele) {
                        return ele.data('type') === 'Int' ? '#47C0EE' : (ele.data('type') === 'Float' ? '#F6C4E1' : '#F0B98D')
                    },
                    'width': '15px',
                    'height': '15px',
                    'label': 'data(name)',
                    'color': function (ele) {
                        return ele.data('type') === 'Int' ? '#47C0EE' : (ele.data('type') === 'Float' ? '#F6C4E1' : '#F0B98D')
                    },
                    'font-size': '14px'
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': '1px',
                    'line-color': '#F0B98D',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'target-arrow-color': '#F0B98D'
                }
            }
        ],
        minZoom:0.6,
        layout: {
            name: 'd3-force',
            animate: true,
            linkId: function id(d) {
                return d._id
            },
            linkDistance: 100,
            manyBodyStrength: -200,
            avoidOverlap: true,
            manyBodyDistanceMin: 10,
            fixedAfterDragging: true,
            infinite: true,
        }

    })
    cy.on('tap', 'node', function (node) {
            let n = node.target, data = n.data()
            let html = '<ul>'
            html += `<li>ID: ${ data['_id'] }</li>`
            html += `<li>Name: ${ data['name'] }</li>`
            html += `<li>类型: ${ getTypeStr(data['type']) }</li>`
            html += '</ul>'
            $('#attr'+index).html(html)
            $('#attr'+index).show()
        })
}

function getTypeStr(type) {
    switch (type) {
        case 'Float':
            return '数字'
        case 'Vchar':
            return '任意字符'
        case 'Int':
            return '整数'
        default:
            return '任意字符'
    }
}

//返回按钮
$('#btn_return').on('click', function () {
    window.location.href = 'extractor.html'
})

function workbook2blob(workbook) {
    const wopts = {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    };
    const wbout = XLSX.write(workbook, wopts);
    function s2ab(s) {
        const buf = new ArrayBuffer(s.length)
        const view = new Uint8Array(buf)
        for (let i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
    return new Blob([s2ab(wbout)], {
        type: 'application/octet-stream'
    });
}

function openDownloadDialog(blob, fileName) {
    if (typeof blob == "object" && blob instanceof Blob) {
        blob = URL.createObjectURL(blob);
    }
    const aLink = document.createElement('a')
    aLink.href = blob;
    aLink.download = fileName || "";
    let event
    if (window.MouseEvent) event = new MouseEvent("click");
    else {
        event = document.createEvent("MouseEvents");
        event.initMouseEvent( "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
    }
    aLink.dispatchEvent(event);
}
let workbook2blob1=(workbook)=> {
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
let openDownloadDialog1=(blob, fileName)=> {
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
let downloadXlsxFile1=(dataSources,sheetName)=>{
    let sheet2 = xlsx.utils.json_to_sheet(dataSources);
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet2, sheetName);
    let workbookBlob = workbook2blob1(wb);
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
    openDownloadDialog1(workbookBlob, '数据文件_'+getFullYear+getMonth+getDate+getHours+getMinutes+getSeconds+'.xlsx')
}

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
