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
    customization: {
        value: "My Tagged Application",
        format: "TEXT"
    },
    kmacKey: {
        value: "abc",
        format: "TEXT"
    },
});

const xlsx = require('xlsx')
let dataSourceNow = []
let dataSourceNowEn = []
const parseModel = window.LS.get('parseModel')
const div = document.querySelector('.card-body')
const EXTENSIONS = 'xls|xlsx|xlsm|xlsb|xml|csv|txt|dif|sylk|slk|prn|ods|fods|htm|html|docx'.split('|')

const _modalSelect = new bootstrap.Modal(document.getElementById('modalSelect'), {
    keyboard: false
})
let _currentModel = {},
    paths = [],
    sp = {}

const fromAuto = window.LS.get('fromAuto')

$('#selectKeys').on('click', function () {
    _modalSelect.show()
})

$('#btnSelect').on('click', function () {
    _modalSelect.hide()
    let pathsClone = _.clone(paths),
        arr = []

    $('input[name="keys"]:checked').each(function (i) {
        arr.push($(this).val())
    })
    renderTreePath(pathsClone, arr)
})

$(function () {
    const filePath = JSON.parse(currentProj)['projPath'] + '/' + original_file
    if (fromAuto === '0') {
        $('.card-body').show()
        if (typeof parseModel === 'undefined') {
            $('#tipProcess').show()
            $('#tipUpload').hide()
        } else {
            _currentModel = JSON.parse(parseModel)
            processFile({
                path: filePath,
                name: _path.basename(filePath)
            })
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
                htmlStr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
                    editable: false
                })
            } catch (e) {}
        })

        const decodedText = iconv.encode(htmlStr, 'utf-8').toString()
        tblHtml.html(decodedText)
        extractFreeLink(_currentModel, wb.Sheets[sheetName])
        $('#modelSelect').change(function () {
            const id = $(this).val()
            if (id === '') return
            _currentModel = _.find(models, {
                modelID: id
            })
            switch (_currentModel['modelType']) {
                case 'table':
                    renderTable()
                    break
                case '3dtable':
                    parse3DTable()
                    render3DTable()
                    renderGraph()
                    $('#renderTable').hide()
                    $('#renderFreeLink').hide()
                    break
                case 'simplefreelink':
                    extractFreeLink(_currentModel, wb.Sheets[sheetName])
                    break
                case 'freelink':
                    extractFreeLink(_currentModel, wb.Sheets[sheetName])
                    break
            }
        })
    }
})



function extractFreeLink(model, ws) {
    const x = _.get(model, 'startCell.0', 0)
    const y = _.get(model, 'startCell.1', 0)
    const values = _.get(model, 'values', [])
    const {
        modelID = '', modelName = '', modelType = '', keys = []
    } = model

    let data = []

    keys.forEach(key => {
        let obj = {}
        const target = _.find(values, {
            '_id': key.targetId
        })
        if (typeof target === undefined) {
            return
        }
        const keyPositionX = _.get(key, 'position.0')
        const keyPositionY = _.get(key, 'position.1')
        const targetPositionX = _.get(target, 'position.0')
        const targetPositionY = _.get(target, 'position.1')
        const key_value = getCellValue(keyPositionX + x - 1, keyPositionY + y - 1, ws)
        const target_value = getCellValue(x + targetPositionX - 1, y + targetPositionY - 1, ws)
        _.set(obj, key_value, parseValue(target_value, _.get(key, 'type')))
        data.push(obj)
    })
    const name = $('tr').eq(y - 1).find('td').eq(x - 1).text()
    let htmlStr = '<ul>'
    data.forEach(item => {
        htmlStr += '<li>'
        htmlStr += `<div>${_.findKey(item)}</div>`
        htmlStr += `<div>${_.find(item)}</div>`
        htmlStr += '</li>'
    })
    htmlStr += '</ul>'
    $('#renderFreeLink').empty().append(htmlStr)
    $('#renderFreeLink').show()
    //隐藏其他
    $('#renderTable').hide()
    $('#renderGraph').hide()
    $('#renderOrigin').hide()
    $('#renderData').hide()
}


//渲染自由连接
function renderFreeLink() {
    const x = _.get(_currentModel, 'startCell.0', 0)
    const y = _.get(_currentModel, 'startCell.1', 0)
    const values = _.get(_currentModel, 'values', [])
    const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))

    let data = []

    _currentModel.keys.forEach(key => {
        let obj = {}
        const target = _.find(values, {
            '_id': key.targetId
        })
        if (typeof target === undefined) {
            return
        }
        const targetPositionX = _.get(target, 'position.0')
        const targetPositionY = _.get(target, 'position.1')
        let colspan = 0
        $(`#htmlout table:eq(${tableIndex-1}) tr`).eq(y + targetPositionY - 1).find('td').slice(0, x + targetPositionX - 1 - 1).each(function (i, ele) {
            const cols = $(this).attr('colspan')
            const diff = parseInt(typeof cols === 'undefined' ? 1 : cols) - 1
            colspan += diff
        })
        const text = $(`#htmlout table:eq(${tableIndex-1}) tr`).eq(y + targetPositionY - 1).find('td').eq(x + targetPositionX - 1 - colspan).text()
        _.set(obj, key.name, text)
        data.push(obj)
    })

    const name = $('tr').eq(y - 1).find('td').eq(x - 1).text()
    let htmlStr = '<ul>'
    data.forEach(item => {
        htmlStr += '<li>'
        htmlStr += `<div>${_.findKey(item)}</div>`
        htmlStr += `<div>${_.find(item)}</div>`
        htmlStr += '</li>'
    })
    htmlStr += '</ul>'
    $('#renderFreeLink').empty().append(htmlStr)
    $('#renderFreeLink').show()
    //隐藏其他
    $('#renderTable').hide()
    $('#renderGraph').hide()
    $('#renderOrigin').hide()
    $('#renderData').hide()

}

function renderTablePre() {
    const x = _.get(_currentModel, 'startCell.0', 0)
    const y = _.get(_currentModel, 'startCell.1', 0)
    const startX = _.get(_currentModel, 'valuesStartCell.0', 0)
    const startY = _.get(_currentModel, 'valuesStartCell.1', 0) + y
    const endX = _.get(_currentModel, 'valuesEndCell.0', 0)
    const endY = _.get(_currentModel, 'valuesEndCell.1', 0) + y
    const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
    //预处理一次html,分散数据
    $(`#htmloutPre table:eq(${tableIndex-1}) tr`).slice(startY - 1, endY).each(function (i, ele) {

        $(this).children('td').each(function (k) {
            const rowspan = ($(this).attr('rowspan') || 1) - 1,
                _this = $(this),
                colspan = ($(this).attr('colspan') || 1) - 1
            //合并行
            if (rowspan > 0) {
                $(`#htmloutPre table:eq(${tableIndex-1}) tr`).slice(startY + i, startY + i + rowspan).each(function () {
                    $(this).children('td').eq(k).before(`<td colspan="${colspan+1}">${ _this.text() }</td>`)
                })
            }
        })
    })
}

//渲染普通表
function renderTable() {
    const x = _.get(_currentModel, 'startCell.0', 0)
    const y = _.get(_currentModel, 'startCell.1', 0)
    const startX = _.get(_currentModel, 'valuesStartCell.0', 0)
    const startY = _.get(_currentModel, 'valuesStartCell.1', 0) + y
    const endX = _.get(_currentModel, 'valuesEndCell.0', 0)
    const endY = _.get(_currentModel, 'valuesEndCell.1', 0) + y
    const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
    const curKeys = _.cloneDeep(_currentModel['keys'])

    const keys = _.groupBy(curKeys, 'position.1')
    //判断如果是单行的表头就不合并列
    const shouldMergeColspan = Object.keys(keys).length !== 1

    let newKeys = curKeys

    if (shouldMergeColspan) {
        //如果有合并列的表头，添加
        newKeys.forEach(key => {
            if (typeof key.colspan !== 'undefined') {
                _.times(parseInt(key.colspan) - key.position[0], function (n) {
                    newKeys.push({
                        ...key,
                        position: [n + 1 + key.position[0], key.position[1]]
                    })
                })
            }
        })

        const groupKeys = keys

        let a = []
        _.forEach(groupKeys, (value, key) => {
            if (a.length === 0) {
                a = value
                return
            }
            a = a.map((item, index) => {
                return {
                    ...item,
                    ...value[index],
                    name: `${ item.name }|${ value[index].name }`
                }
            })
        })
        newKeys = a
    }

    //预处理一次html,分散数据
    $(`#htmlout table:eq(${tableIndex-1}) tr`).slice(startY - 1, endY).each(function (i, ele) {

        $(this).children('td').each(function (k) {
            const rowspan = ($(this).attr('rowspan') || 1) - 1,
                _this = $(this),
                colspan = ($(this).attr('colspan') || 1) - 1
            //合并行
            if (rowspan > 0) {
                $(`#htmlout table:eq(${tableIndex-1}) tr`).slice(startY + i, startY + i + rowspan).each(function () {
                    $(this).children('td').eq(k).before(`<td colspan="${colspan+1}">${ _this.text() }</td>`)
                })
            }
            if (colspan > 0 && shouldMergeColspan) {
                //合并列（暂不处理）
            }
        })
    })

    let data = []

    $(`#htmlout table:eq(${tableIndex-1}) tr`).slice(startY - 1, endY).each(function (i, ele) {
        let _this = $(this),
            obj = {},
            colspan = 0

        newKeys.forEach(key => {
            const k = _.get(key, 'position.0', 0),
                cols = _.get(key, 'colspan', 0)
            let value
            if (cols > 0 && !shouldMergeColspan) {
                let r = [],
                    total = 0
                _this.children('td').slice(k, k + cols - 1).each(function (i, e) {
                    const c = $(this).attr('colspan') || 1
                    if (total < cols) {
                        r.push($(this).text())
                    }
                    total += c
                })
                value = r.join('|')
            } else {
                let total = 0
                _this.children('td').slice(0, k + x - 1).each(function () {
                    const c = ($(this).attr('colspan') || 1) - 1
                    total += c
                })
                value = _this.children('td').eq(k + x - total - 1).text()
            }
            let keyName = key.name.replace('.', 'dottod')
            keyName = keyName.replace(/\r/gi, '_')
            obj[keyName] = value
        })
        data.push(obj)
    })
    let columns = []
    if (data.length > 0) {
        const k = Object.keys(data[0])
        k.forEach(item => {
            columns.push({
                field: item,
                title: item,
                align: 'center'
            })
        })
    }
    $('#renderTable table').bootstrapTable('destroy').bootstrapTable({
        data,
        columns
    })
    $('#renderTable').show()
    //隐藏其他
    $('#renderFreeLink').hide()
    $('#renderGraph').hide()
    $('#renderOrigin').hide()
    $('#renderData').hide()

    //表格导出数据
    $('#exportExcel').on('click', function () {
        const modelName = _.get(_currentModel, 'modelName', '数据')
        const sheet = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, modelName)
        const workbookBlob = workbook2blob(wb)
        openDownloadDialog(workbookBlob, `${modelName}.xlsx`)
    })
}

//解析上传文件
function processFile(file) {
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
            htmlStr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
                editable: false
            })
        } catch (e) {}
    })

    const decodedText = iconv.encode(htmlStr, 'utf-8').toString()
    tblHtml.html(decodedText)
    $('#htmloutPre').html(decodedText)
    renderTablePre()
    parseMdTable()
    render3DTable()
    renderGraph()

}

//渲染解析前的三维表
function render3DTable() {
    const div = $('#renderOrigin')
    const tableIndex = _.get(_currentModel, 'tableIndex', 1)
    const html = $(`#htmlout table:eq(${ tableIndex - 1 })`)
    const startX = _.get(_currentModel, 'startCell.0', 1) - 1
    const startY = _.get(_currentModel, 'startCell.1', 1) - 1

    const keysYMin = _.minBy(_currentModel['keys'], 'position.1')
    const middleYMax = _.maxBy(_currentModel['middleKeys'] ? _currentModel['middleKeys'] : _currentModel['values'], 'position.1')
    const yMin = keysYMin < 0 ? startY + _.get(keysYMin, 'position.1', 0) : startY
    let htmlStr = '<div class="title">原数据表:</div><table>'
    _.range(yMin, _.get(middleYMax, 'position.1', 0) + startY + 1).forEach(k => {
        htmlStr += $(`#htmlout table:eq(${ tableIndex - 1 })`).find(`tr:eq(${ k })`).prop('outerHTML')
    })
    htmlStr += '</table>'

    div.html(htmlStr)
    div.show()
}

//渲染解析后的三维表
function parse3DTable() {
    const keysRelation = _.get(_currentModel, 'keysRelation', [])
    const keys = _.cloneDeep(keysRelation)
    const treeData = buildTree(keys)
    let selectHtml = ''
    paths = binaryTreePaths(treeData[0])
    renderTreePath(paths)
    _.uniqBy(_.concat(_currentModel['keys'], _.get(_currentModel, 'middleKeys', []), _.get(_currentModel, 'values', [])), '_id').forEach(key => {
        selectHtml += `<div class="mb-3"><input class="form-check-input" name="keys" type="checkbox" value="${ key['_id'] }" id="${ key['_id'] }">
                        <label class="form-check-label" for="${ key['_id'] }">${ key['name'] }</label></div>`
    })
    $('#modalSelect .modal-body').empty().append(selectHtml)
    $('#renderData .title').show()
    $('#renderData').show()
}

function parseMdTable() {

    const keys = _.cloneDeep(_.get(_currentModel, 'keys', [])),
        values = _.cloneDeep(_.get(_currentModel, 'values', [])),
        keysRelation = _.cloneDeep(_.get(_currentModel, 'keysRelation', []))
    buildTreeE(keysRelation)
    let selectHtml = ''

    paths = []
    if (keysRelation) {
        keysRelation.filter((item) => {
            let pathss = binaryTreePaths(item)
            pathss.filter(item1 => {
                paths.push(item1)
            })
        })
    }

    paths = binaryTreePaths(keysRelation[0])
    renderTreePath(_.uniq(paths))

    _.uniqBy(_.concat(_currentModel['keys'], _.get(_currentModel, 'values', [])), '_id').forEach(key => {
        selectHtml += `<div class="mb-3"><input class="form-check-input" name="keys" type="checkbox" value="${ key['_id'] }" id="${ key['_id'] }">
                        <label class="form-check-label" for="${ key['_id'] }">${ key['name'] }</label></div>`
    })

    $('#modalSelect .modal-body').empty().append(selectHtml)
    $('#renderData .title').show()
    $('#renderData').show()
}

function buildTreeE(list) {
    let map = {},
        node, tree = [],
        i

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
function renderTreePath(paths, arr = []) {
    let dataNode = []
    let dataEdge = []
    const nodes = _.concat(_currentModel['keys'], _.get(_currentModel, 'middleKeys', []), _.get(_currentModel, 'values', []))
    nodes.forEach(node => {
        dataNode.push({
            ...node,
            id: node._id
        })
    })
    let lid = _currentModel['keys']
    dataNode.forEach((item) => {
        lid.forEach(item1 => {
            if (item.id == item1._id) {
                item.position = item1.position
            }
        })
    })
    _currentModel['keysRelation'].forEach(relation => {
        if (relation.pid !== '-1') {
            dataEdge.push({
                pid_Id: `${ relation.pid }to${ relation._id }`,
                pid: relation.pid,
                id: relation._id
            })
        }
    })
    let datasJSON = dataHave(dataNode, dataEdge)
    let datas = []
    let datasEn = []
    for (let m in datasJSON) {
        let lis = {
            字段: '',
            值: '',
            '唯一ID': ''
        }
        let lisEn = {
            columnName: '',
            columnValue: '',
            columnId: '',
            columnPath: ''
        }
        let jOSNArr = datasJSON[m].name.split("_")
        lis.值 = jOSNArr[jOSNArr.length - 1]
        lis.字段 = datasJSON[m].name.split("_" + lis.值)[0]
        const kmac = shaObj.getHash("HEX", {
            outputLen: 64
        });
        lis['唯一ID'] = kmac
        lis['路径'] = datasJSON[m].position
        lisEn.columnPath = datasJSON[m].position
        lisEn.columnName = datasJSON[m].name.split("_" + lis.值)[0]
        lisEn.columnValue = jOSNArr[jOSNArr.length - 1]
        lisEn['columnId'] = kmac
        if (datasJSON[m].nameS) {
            lis['值_standard'] = jOSNArr[jOSNArr.length - 1]
            lis['值'] = ''
            lisEn['columnValue_standard'] = jOSNArr[jOSNArr.length - 1]
            lisEn['columnValue'] = ''

        }
        datas.push(lis)
        datasEn.push(lisEn)
    }
    dataSourceNow = datas
    dataSourceNowEn = datasEn
    let html = ''
    datas.forEach(item => {
        html += `<tr class="mb-3"><td style="width:200px;color:white">${item['字段']}</td><td style="width:200px;"><input data-keyId="${item['字段']}" data-path="${item['路径']}" disabled placeholder="${item['值_standard']?item['值_standard']:'请填写内容'}" class="inputValue" style="width:100%;height:100%" type="text" value=${item['值']}></td></tr>`
    })
    $('#renderData table').empty().append(html)
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
            if (!map[node.pid]) {
                sp = {
                    pid: '-1',
                    _id: node.pid,
                    children: []
                }
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

//根据ID获取key
function getById(id) {
    const keysIn = _.find(_currentModel['keys'], {
        _id: id
    })
    const middleIn = _.find(_currentModel['middleKeys'], {
        _id: id
    })
    const valueIn = _.find(_currentModel['values'], {
        _id: id
    })
    return keysIn === undefined ? (middleIn === undefined ? valueIn : middleIn) : keysIn
}

//渲染图
let dataGraph = []

function renderGraph() {
    $('#renderGraph').show()
    let data = []
    const nodes = _.concat(_currentModel['keys'], _.get(_currentModel, 'middleKeys', []), _.get(_currentModel, 'values', []))
    nodes.forEach(node => {
        data.push({
            group: 'nodes',
            data: {
                ...node,
                id: node._id
            }
        })
    })
    _currentModel['keysRelation'].forEach(relation => {
        if (relation.pid !== '-1') {
            data.push({
                group: 'edges',
                data: {
                    id: `${ relation.pid }to${ relation._id }`,
                    source: relation.pid,
                    target: relation._id
                }
            })
        }
    })
    data.filter((item, index) => {
        if (item.group == 'nodes') {
            let yy = 0
            let yy1 = 0
            data.filter(val => {
                if (val.group == 'edges') {
                    if (val.data.source == item.data.id || val.data.target == item.data.id) {
                        yy++
                    }
                }
                if (val.group == 'nodes') {
                    if (val.data.id == item.data.id) {
                        yy1++
                    }
                }
            })
            if (yy <= 0) {
                data.splice(index, 1)
            }
            if (yy1 > 1) {
                data.splice(index, 1)
            }
        }

    })
    cytoscape.use(d3Force)
    dataGraph = data
    const cy = cytoscape({
        container: document.getElementById('renderGraph'),
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
        minZoom: 0.5,
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
        let n = node.target,
            data = n.data()
        let html = '<ul>'
        html += `<li>ID: ${ data['_id'] }</li>`
        html += `<li>Name: ${ data['name'] }</li>`
        html += `<li>类型: ${ getTypeStr(data['type']) }</li>`
        html += '</ul>'
        $('#attr').html(html)
        $('#attr').show()
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
        event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

//表格导出数据
$('#exportExcel1').on('click', function () {
    downloadXlsxFile1(dataSourceNow)
})

let workbook2blob1 = (workbook) => {
    let wopts = {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    };
    var wbout = xlsx.write(workbook, wopts);
    let s2ab = (s) => {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
    let blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    });
    return blob;
}

let openDownloadDialog1 = (blob, fileName) => {
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
        event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}

let downloadXlsxFile1 = (dataSources) => {
    let sheet2 = xlsx.utils.json_to_sheet(dataSources);
    let wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, sheet2, "sheet1");
    let workbookBlob = workbook2blob1(wb);
    let dasts = new Date()
    let getFullYear = dasts.getFullYear()
    let getMonth = dasts.getMonth()
    if (getMonth < 10) {
        getMonth = '0' + (getMonth + 1)
    }
    let getDate = dasts.getDate()
    if (getDate < 10) {
        getDate = '0' + getDate
    }
    let getHours = dasts.getHours()
    if (getHours < 10) {
        getHours = '0' + getHours
    }
    let getMinutes = dasts.getMinutes()
    if (getMinutes < 10) {
        getMinutes = '0' + getMinutes
    }
    let getSeconds = dasts.getSeconds()
    if (getSeconds < 10) {
        getSeconds = '0' + getSeconds
    }
    openDownloadDialog1(workbookBlob, '数据文件_' + getFullYear + getMonth + getDate + getHours + getMinutes + getSeconds + '.xlsx')
}


$('#exportExcel2').on('click', function () {
    saveJSON(dataSourceNowEn, '自由连接型数据文件.json')

})
$('#exportExcel3').on('click', function () {
    saveJSON(dataGraph, 'graph数据文件.json')
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
    var blob = new Blob([data], {
            type: "text/json"
        }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
        "click",
        true, // 是否可以冒泡
        false, // 是否可以阻止事件默认行为
        window, // 指向window对象
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
$(document).on('input', '.inputValue', function () {
    dataSourceNow.filter((item) => {
        if (item['字段'] == $(this).attr('data-keyId')) {
            item['值'] = $(this).val()
        }
    })
    dataSourceNowEn.filter((item) => {
        if (item['columnName'] == $(this).attr('data-keyId')) {
            item['columnValue'] = $(this).val()
        }
    })
})
