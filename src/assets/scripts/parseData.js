/**
 * 查看解析数据
 */
let dataSourceNowEn = []
let dataSourceGraph = []
let dataSourceNow = []
let dataSou
let tableD=[]
const xlsx = require('xlsx')
const path = require('path')
let rowStyle = function (row, index) {
    var classes = ['success1', 'info1'];
    if (index % 2 === 0) {
        return { classes: classes[0]};
    } else {
        return {classes: classes[1]};
    }
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
async function returnParseTableData(_currentModel,_currentProj,_currentProjFileData){
    const filePath = path.join(_currentProj.projPath,_currentProjFileData.original_file)
    let dataTable = await processFile({path: filePath, name: path.basename(filePath)},_currentModel)
    return dataTable
}
//解析上传文件
async function processFile(file,_currentModel) {
        file.extname = path.extname(file.name)
        const workbook = XLSX.readFile(file.path)
        const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
        if (tableIndex < 1) return
        const sheetName = workbook.SheetNames[tableIndex - 1]
        const ws = workbook.Sheets[sheetName]
        if (!('!ref' in ws)) return
        switch (_currentModel.modelType) {
            case 'freelink':
                extractFreeLink(_currentModel, ws)
                break
            case 'simplefreelink':
                extractFreeLink(_currentModel, ws)
                break
            case 'table':
                return extractTable(_currentModel, ws)
        }
}

function extractFreeLink(_currentModel, ws) {
    $('#modalDataGraphShow').modal('show')
    renderTreePath(_currentModel)
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
    dataSourceGraph = data
    cytoscape.use(d3Force)
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
            fit: true,
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
//渲染三维表结构化数据
function renderTreePath(_currentModel) {
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
    $('#graphDataTable').bootstrapTable('destroy').bootstrapTable({
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
        columns: [
            {
                field: '字段',
                title: '字段',
                width: 480,
                visible: true,
                sortable: false,
                align: 'center',
            },
            {
                field: '值',
                title: '值',
                width: 480,
                visible: true,
                sortable: false,
                align: 'center',
            },
        ],
        data: dataSourceNow,
    });
    $(".pagination-detail").css('display','none')
    $(".no-records-found td").html('没有数据请您重新筛选')
}
/**
 * 自由连接型导出excel
 */
$('#exportExcel_').on('click', function () {
    downloadXlsxFile(dataSourceNow)

})
/**
 * 自由连接型导出json
 */
$('#exportExcel2_').on('click', function () {
    saveJSON(dataSourceNowEn, '自由连接型数据文件.json')

})
/**
 *自由连接型导出graphjson
 */
$('#exportExcel3_').on('click', function () {
    saveJSON(dataSourceGraph, 'graph数据文件.json')

})
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
    // const keysRange = _.groupBy(keys, 'position.1')
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
        if(newKeys[k+1]){
            for(let m=k+1;m<newKeys.length;m++){
                if(newKeys[k]._id==newKeys[m]._id){
                    newKeys.splice(m,1)
                    k--
                    break
                }
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
function convertJsonToTable(_currentModel,data) {
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
    let nodes1=[]
    let datasourced={nodes:[],links:[]}
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
//表格导出数据
$('#exportExcel').on('click', function () {
    downloadXlsxFile(tableD)
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
        blob = URL.createObjectURL(blob); // 创建blob地址
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
/**
 *导出JSON文件
 */
$('#exportExcel2').on('click', function () {
    saveJSON(tableD,'表格型文件.json')
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

/**
 * 导出GraphJson
 * @param data
 * @param filename
 */
$('#exportExcel3').on('click', function () {
    saveJSON(dataSou,'graphJson.json')
})
