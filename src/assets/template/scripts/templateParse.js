const xlsx = require("xlsx");
const _ = require("lodash");
const _paths = require("path");
const {
    remote: _remotes
} = require("electron");

$(function () {
    const _remotes = require('electron').remote
    const m = _remotes.Menu.getApplicationMenu();
    const dx = (_remotes.process.platform === 'darwin') ? 1 : 0;
    m.items[dx].submenu.items[0].enabled = false
    m.items[dx].submenu.items[1].enabled = false
    m.items[dx].submenu.items[2].enabled = false
    let resetDataTable = []
    const iconv = require('iconv-lite')
    const _ = require('lodash')
    const cytoscape = require('cytoscape')
    const d3Force = require('cytoscape-d3-force')
    let _currentModel = {},
        paths = [],
        sp = {}
    let dataSourceNow, dataSourceNowEn
    let query = window.location.search.substring(1)
    let vars = query.split("&");
    let arrobject = {}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrobject[pair[0]] = decodeURI(pair[1])
    }
    let _currentModelModelId = arrobject._currentModelModelId
    let url = arrobject.url
    const _paths = require('path')
    let AppDataFoldersRoot = 'nowPage_baiyu'
    let _AppDataPathRoot = _paths.join(_remotes.app.getPath("appData"), AppDataFoldersRoot);
    $('#btn_return').on('click', function () {
        let urls = 'templatePage.html?urlLocal=' + url + '&fileName=' + arrobject.fileName
        if (arrobject.technicsNumber) {
            urls += '&technicsNumber=' + arrobject.technicsNumber
        }
        if (arrobject.stepNum) {
            urls += '&stepNum=' + arrobject.stepNum
        }
        if (arrobject.paceNum) {
            urls += '&paceNum=' + arrobject.paceNum
        }
        if (arrobject.type) {
            urls += '&type=' + arrobject.type
        }
        if (arrobject.templateOid) {
            urls += '&templateOid=' + arrobject.templateOid
        }
        window.location.href = urls
    })
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
    const modelObj = _fse.readJsonSync(_paths.join(_AppDataPathRoot, url, 'models', 'extractor_model.json'), {
        throws: false
    });
    if (modelObj.resetDataTable && modelObj.resetDataTable[0]) {
        resetDataTable = modelObj.resetDataTable
    }
    //渲染模型选择
    $.each(modelObj.models, function (index, item) {
        if (item.modelID == _currentModelModelId) {
            _currentModel = item
            processFile(_paths.join(_AppDataPathRoot, url, arrobject.fileName))
        }
    })
    //解析上传文件
    function processFile(file) {
        const wb = XLSX.readFile(file)
        const tblHtml = $('#htmlout')
        let htmlStr = ''
        wb.SheetNames.forEach(function (sheetName) {
            try {
                if (wb.Sheets[sheetName]['!ref']) {
                    let refss = wb.Sheets[sheetName]['!ref'].split(':')
                    let startNum = parseInt(dislodgeLetter(refss[0]))
                    let endNum = parseInt(dislodgeLetter(refss[1]))
                    let startLetter = dislodgeNum(refss[0])
                    let endLetter = dislodgeNum(refss[1])
                    let jo = 0
                    let keys = []
                    for (let k = 0; k < az.length; k++) {
                        if (az[k] == startLetter) {
                            jo++
                        }
                        if (az[k] == endLetter) {
                            jo++
                        }
                        if (jo == 1) {
                            keys.push(az[k])
                        }
                        if (jo == 2) {
                            keys.push(az[k])
                            break
                        }
                    }
                    for (let j = startNum; j <= endNum; j++) {
                        for (let n = 0; n < keys.length; n++) {
                            let nn = keys[n] + j
                            if (wb.Sheets[sheetName][nn]) {

                            } else {
                                wb.Sheets[sheetName][nn] = {
                                    v: '',
                                    w: '',
                                    t: 'n'
                                }
                            }
                        }
                    }
                }
                if (resetDataTable && resetDataTable[0]) {
                    resetDataTable.filter(item => {
                        let ids = item.id.split('-')[1]
                        if (wb.SheetNames[item.tableindex - 1]) {
                            if (wb.Sheets[wb.SheetNames[item.tableindex - 1]]) {
                                if (wb.Sheets[wb.SheetNames[item.tableindex - 1]][ids]) {
                                    let wbLi = wb.Sheets[wb.SheetNames[item.tableindex - 1]][ids]
                                    let keys = Object.keys(wbLi)
                                    if (keys.includes('v')) {
                                        wbLi.v = item.value
                                    }
                                    if (keys.includes('w')) {
                                        wbLi.w = item.value
                                    }
                                    if (wbLi.r) {
                                        let rs = wbLi.r.toString()
                                        if (rs.indexOf('</t>') != -1) {
                                            let nowT = rs.split('</t>')[1]
                                            if (nowT) {
                                                wbLi.r = '<t>' + item.value + '</t>' + nowT
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    })

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

    function renderTablePre() {
        const y = _.get(_currentModel, 'startCell.1', 0)
        const startY = _.get(_currentModel, 'valuesStartCell.1', 0) + y
        const endY = _.get(_currentModel, 'valuesEndCell.1', 0) + y
        const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
        //预处理一次html,分散数据
        $(`#htmloutPre table:eq(${tableIndex-1}) tr`).slice(startY - 1, endY).each(function (i, ele) {
            $(this).children('td').each(function (k) {
                const rowspan = ($(this).attr('rowspan') || 1) - 1,
                    _this = $(this),
                    colspan = ($(this).attr('colspan') || 1) - 1
                if (rowspan > 0) {
                    $(`#htmloutPre table:eq(${tableIndex-1}) tr`).slice(startY + i, startY + i + rowspan).each(function () {
                        $(this).children('td').eq(k).before(`<td colspan="${colspan+1}">${ _this.text() }</td>`)
                    })
                }
            })
        })
    }
    //渲染解析前的三维表
    function render3DTable() {
        const div = $('#renderOrigin')
        const tableIndex = _.get(_currentModel, 'tableIndex', 1)
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
    //渲染图
    function renderGraph() {
        $('#renderGraph').show()
        let data = []
        const keys = _.cloneDeep(_.get(_currentModel, 'keys', [])),
            values = _.cloneDeep(_.get(_currentModel, 'values', [])),
            keysRelation = _.cloneDeep(_.get(_currentModel, 'keysRelation', []))
        if (resetDataTable && resetDataTable[0]) {
            resetDataTable.filter(val => {
                //
                if (val._val_uid) {
                    if (keys && keys[0]) {
                        keys.filter(val1 => {
                            if (val1._id == val._val_uid) {
                                val1.name = val.value
                            }
                        })
                    }
                    if (values && values[0]) {
                        values.filter(val1 => {
                            if (val1._id == val._val_uid) {
                                val1.name = val.value
                            }
                        })
                    }
                    if (keysRelation && keysRelation[0]) {
                        keysRelation.filter(item => {
                            if (item.children && item.children[0]) {
                                item.children.filter(item1 => {
                                    if (item1._id == val._val_uid) {
                                        item1.name = val.value
                                    }
                                })
                            }
                            if (item._id == val._val_uid) {
                                item.name = val.value
                            }
                        })
                    }
                }
            })
        }
        const nodes = _.concat(keys, _.get(_currentModel, 'middleKeys', []), values)
        nodes.forEach(node => {
            data.push({
                group: 'nodes',
                data: {
                    ...node,
                    id: node._id
                }
            })
        })
        if (keysRelation) {
            keysRelation.forEach(relation => {
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
        }
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
        const cy = cytoscape({
            container: document.getElementById('renderGraph'),
            elements: data,
            style: [{
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
                avoidOverlap: true,
                linkDistance: 100,
                manyBodyStrength: -200,
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

    function binaryTreePaths(root) {
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

    //获取树的所有叶子节点路径
    function parseMdTable() {
        renderTreePath()
    }
    //渲染三维表结构化数据
    function renderTreePath(paths, arr = []) {
        let keyAll = [{
                field: '唯一编码',
                title: '唯一编码',
                width: 480,
                visible: true,
                sortable: false,
                align: 'center'
            },
            {
                field: '字段',
                title: '字段',
                width: 480,
                visible: true,
                sortable: false,
                align: 'center'
            },
            {
                field: '值',
                title: '值',
                width: 480,
                visible: true,
                sortable: false,
                align: 'center'
            },
        ]
        let newUR = url.split('original')[0]
        let xlsxPath = _paths.join(_AppDataPathRoot, newUR, 'tableData.json')
        let xlsxPathG = _paths.join(_AppDataPathRoot, newUR, 'GraphData.json')
        let _extModelsData1N = _fse.readJsonSync(xlsxPath, {
            throws: false
        });
        const _extModelsData1 = _extModelsData1N.data2
        const _extModelsDataG = _fse.readJsonSync(xlsxPathG, {
            throws: false
        });
        let keyAllls = getObjectKeys(_extModelsData1)
        keyAllls = [...new Set(keyAllls)]
        keyAllls.filter(item => {
            if (item != '唯一编码' && item != '字段' && item != '值') {
                let li = {
                    field: item,
                    title: item,
                    width: 480,
                    visible: true,
                    sortable: false,
                    align: 'center'
                }
                keyAll.push(li)
            }

        })
        dataSourceNow = _extModelsData1
        dataSourceNowEn = _extModelsDataG.graphData
        $('#tableDataParse1').bootstrapTable('destroy').bootstrapTable({
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
            rowStyle: rowStyle,
            cache: false,
            columns: keyAll,
            data: _extModelsData1,
        });
        $(".pagination-detail").css('display', 'none')
        $(".no-records-found td").html('没有数据请您重新筛选')
        $('#renderData').show()
    }

    function getObjectKeys(object) {
        var keys = [];
        for (var property in object) {
            for (let key in object[property]) {
                keys.push(key);
            }
        }
        return keys;
    }

    $('#exportExcel2').on('click', function () {
        saveJSON(dataSourceNowEn, '自由连接型数据文件.json')

    })
    $('#exportExcel3').on('click', function () {
        saveJSON(dataSourceNow, 'json数据文件.json')

    })
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
    let downloadXlsxFile1 = (dataSources) => {
        let sheet2 = xlsx.utils.json_to_sheet(dataSources);
        let wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, sheet2, "sheet1");
        let workbookBlob = workbook2blob1(wb);
        openDownloadDialog1(workbookBlob, 'excel数据文件.xlsx')
    }
    let openDownloadDialog1 = (blob, fileName) => {
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
            event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
    }
})
