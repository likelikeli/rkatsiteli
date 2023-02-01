let resetDataTable = [];
let _fs = require('fs');
let _ = require('lodash');
let compressing = require('compressing');
let _extModelsData, _extractorModelFile;
let _currentModel = {};
let chooseStandard = false;
let _LINES = [];
let startX = 0,
    startY = 0;
let wbData;
let dataTable;
let AdmZipD = require('adm-zip');
const _uuid = require("uuid-random");
let _paths = require("path");
const {
    remote: _remotes
} = require("electron");
const _shell = require('electron').shell;
let tttt = {};
let _currentModelNNN = {};
let newKeys;

let dataFileListShow = [];
let qbyObjectPath = '';
let arrobject = {};
let AppDataFolders = '';
let dimensionalData = [];
let dimensionalDataGraph = [];
let data3Now = []
let graphKeyData = []
let urls = window.location.search.substring(1);
let vars = urls.split("&");
let arrobject1 = {};
for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    arrobject1[pair[0]] = decodeURI(pair[1]);
}
let pathRoot = arrobject1.pathRoot;
let customizedValue = arrobject1.customizedValue;
let fileListString;
if (window.LS.get('fileList')) {
    fileListString = window.LS.get('fileList');
}
let fileList = JSON.parse(fileListString);
$(function () {
    _AppDataPath = '';
    let _remotes = require('electron').remote;
    const m = _remotes.Menu.getApplicationMenu();
    const dx = (_remotes.process.platform === 'darwin') ? 1 : 0;
    m.items[dx].submenu.items[0].enabled = false;
    m.items[dx].submenu.items[1].enabled = false;
    m.items[dx].submenu.items[2].enabled = false;
    fileList.filter((item, index) => {
        item.uuid = _uuid();
        let classs = 'btn btn-secondary chooseItemFile mr-3';
        if (index == 0) {
            classs = 'btn btn-secondary active chooseItemFile mr-3';
        }
        $("#fileListBox").append(`
         <button data-uuid="${item.uuid}" style="min-width:100px;" class="${classs}">${item.name}</button>
        `);
    })
    dataTable = [];
    fileList.filter(item => {
        item.qbyFileChoose = item.qbyFile;
        item.graphFileChoose = item.graphFile;
        item.tableFileChoose = item.tableFile;
        item.customizedValue = customizedValue;
    })
    arrobject = fileList[0];
    dataFileListShow.push(arrobject);
    let AppDataFoldersRoot = 'nowPage_baiyu';
    let _AppDataPathRoot = _paths.join(_remotes.app.getPath("appData"), AppDataFoldersRoot);

    function resetPage() {
        AppDataFolders = pathRoot;
        if (arrobject.qbyFile) {
            AppDataFolders = _paths.dirname(arrobject.graphFile);
            _AppDataPath = AppDataFolders;
            let urlqbyArr = _paths.basename(arrobject.qbyFile);
            let urlqbys = urlqbyArr;
            let urlqbys_p = urlqbys.split('.')[0];
            let _AppDataPath_urlqbys_p = _paths.join(_AppDataPath, urlqbys_p);
            let ishh = true;
            qbyObjectPath = _AppDataPath_urlqbys_p;
            dataFileListShow.filter(ky => {
                if (ky.uuid == arrobject.uuid) {
                    if (ky.qbyFileChoose) {
                        ishh = false;
                    }
                }
            })
            if (ishh) {
                _fs.access(_AppDataPathRoot, _fs.constants.F_OK, function (res) {
                    if (res) {
                        _fs.mkdir(_AppDataPathRoot, 511, function (err) {
                            if (err) {} else {
                                createFile();
                            }
                        })
                    } else {
                        createFile();
                    }
                })
            } else {
                createFile();
            }

            function createFile() {
                graphKeyData = []
                data3Now = []
                dataFileListShow.filter(ky => {
                    if (ky.uuid == arrobject.uuid) {
                        if (ky.qbyFileChoose) {
                            qbyObjectPath = ky.qbyFileChoose;
                            _fs.readFile(ky.tableFileChoose, 'utf-8', function (code, data) {
                                let nowDDs = JSON.parse(data);
                                data3Now = nowDDs.data3
                            })
                            _fs.readFile(ky.graphFileChoose, 'utf-8', function (code, data) {
                                let nowDDs = JSON.parse(data);
                                dimensionalDataGraph = nowDDs.graphData;
                                dimensionalData = nowDDs.tableData;
                                graphKeyData = nowDDs.keyIds
                            })
                            _fs.access(_AppDataPath_urlqbys_p + '.zip', err => {
                                if (!err) {
                                    _fs.rename(_AppDataPath_urlqbys_p + '.zip', _AppDataPath_urlqbys_p + '.zip', (err) => {
                                        if (err) throw err;
                                        compressing.zip.uncompress(_AppDataPath_urlqbys_p + '.zip', _AppDataPath_urlqbys_p, function (res) {});
                                        _extractorModelFile = _paths.join(_AppDataPath_urlqbys_p, 'models', 'extractor_model.json');
                                        setTimeout(() => {
                                            openFileShow(_paths.join(_AppDataPath_urlqbys_p, 'original.xlsx'), _paths.join(_AppDataPath_urlqbys_p, _paths.join('models', 'extractor_model.json')));
                                        }, 300)
                                    })
                                } else {
                                    _fs.access(_AppDataPath_urlqbys_p + '.qby', err => {
                                        if (!err) {
                                            _fs.rename(_AppDataPath_urlqbys_p + '.qby', _AppDataPath_urlqbys_p + '.zip', (err) => {
                                                if (err) throw err;
                                                compressing.zip.uncompress(_AppDataPath_urlqbys_p + '.zip', _AppDataPath_urlqbys_p, function (res) {})
                                                _extractorModelFile = _paths.join(_AppDataPath_urlqbys_p, 'models', 'extractor_model.json')
                                                setTimeout(() => {
                                                    openFileShow(_paths.join(_AppDataPath_urlqbys_p, 'original.xlsx'), _paths.join(_AppDataPath_urlqbys_p, _paths.join('models', 'extractor_model.json')))
                                                }, 300)
                                            })
                                        } else {
                                            _fs.access(_AppDataPath_urlqbys_p, err => {
                                                if (err) {
                                                    compressing.zip.uncompress(_AppDataPath_urlqbys_p + '.zip', _AppDataPath_urlqbys_p, function (res) {})
                                                }
                                                _extractorModelFile = _paths.join(_AppDataPath_urlqbys_p, 'models', 'extractor_model.json')
                                                setTimeout(() => {
                                                    openFileShow(_paths.join(_AppDataPath_urlqbys_p, 'original.xlsx'), _paths.join(_AppDataPath_urlqbys_p, _paths.join('models', 'extractor_model.json')))
                                                }, 300)
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
            }
        }
    }
    resetPage()
    $(document).on('click', '.chooseItemFile', function () {
        $('.chooseItemFile').removeClass('active')
        $(this).addClass('active')
        $(this).attr('data-uuid')
        let kk = 0
        fileList.filter((items) => {
            if (items.uuid == $(this).attr('data-uuid')) {
                dataFileListShow.filter(ky => {
                    if (ky.uuid == $(this).attr('data-uuid')) {
                        kk++
                    }
                })
                if (kk <= 0) {
                    dataFileListShow.push(items)
                }
                arrobject = items
                $(".f-model-list").html('')
                $("#extractor_table").html('')
                resetPage()
            }
        })
    })

    function openFileShow(xlsxPath, jsonPath) {
        const wb = XLSX.readFile(xlsxPath, {
            type: 'binary'
        })
        _extModelsData = _fse.readJsonSync(jsonPath, {
            throws: false
        });
        let resetTableNew = []
        if(data3Now&&data3Now[0]){
            if(graphKeyData&&graphKeyData[0]){
                graphKeyData.filter(item1=>{
                    data3Now.filter(item2=>{
                        if(item1.唯一编码 === item2.唯一编码){
                            let lisd = {
                                id:item1.id,
                                tableindex:item1.tableIndex,
                                x:item1.position[0]+'',
                                y:item1.position[1]+'',
                                "data_down": item1.data_down+'',
                                "data_up": item1.data_up+'',
                                "deviationUpper":  item1.deviationUpper+'',
                                "deviationLower":  item1.deviationLower+'',
                                "nominalValue":  item1.nominalValue+'',
                                value:item2.value
                            }
                            if(!lisd.value){
                                lisd.value = item2.值
                            }
                            resetTableNew.push(lisd)
                        }
                    })
                })
            }
        }
        if(resetTableNew&&resetTableNew[0]){
            if(_extModelsData.dataChange && _extModelsData.dataChange[0]){
                _extModelsData.dataChange = [..._extModelsData.dataChange,...resetTableNew]
            }else{
                _extModelsData.dataChange = resetTableNew
            }
        }
        resetDataTable = []
        let resetDataTable1 = []
        if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
            resetDataTable = [..._.cloneDeep(_extModelsData.dataChange)]
            if (_extModelsData.resetDataTable && _extModelsData.resetDataTable[0]) {
                resetDataTable1 = [ ..._.cloneDeep(_extModelsData.resetDataTable)]
                // resetDataTable1 = [..._.cloneDeep(_extModelsData.dataChange), ..._.cloneDeep(_extModelsData.resetDataTable)]
            } else {
                // resetDataTable1 = [..._.cloneDeep(_extModelsData.dataChange)]
            }
        } else {
            if (_extModelsData.resetDataTable && _extModelsData.resetDataTable[0]) {
                resetDataTable1 = [..._.cloneDeep(_extModelsData.resetDataTable)]
            }
        }

        wbData = wb
        let htmlStr = ''
        wb.SheetNames.forEach(function (sheetName) {
            try {
                if (wb.Sheets[sheetName]['!ref']) {
                    if (wb.Sheets[sheetName]['A1']) {} else {
                        let resfR = wb.Sheets[sheetName]['!ref'].split(':')[1]
                        wb.Sheets[sheetName]['!ref'] = "A1:" + resfR
                        wb.Sheets[sheetName]['A1'] = {
                            v: '',
                            w: '',
                            t: 'n'
                        }
                    }
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
                            if (wb.Sheets[sheetName][nn]) {} else {
                                wb.Sheets[sheetName][nn] = {
                                    v: '',
                                    w: '',
                                    t: 'n'
                                }
                            }
                        }
                    }
                }
                if (resetDataTable1 && resetDataTable1[0]) {
                    for (let j = 0; j < resetDataTable1.length; j++) {
                        let item = resetDataTable1[j]
                        if (item && item.id) {
                            let ids = item.id.split('-')[1]
                            if (wb.SheetNames[item.tableindex - 1] &&
                                wb.SheetNames[item.tableindex - 1] == sheetName &&
                                wb.Sheets[wb.SheetNames[item.tableindex - 1]] &&
                                wb.Sheets[wb.SheetNames[item.tableindex - 1]][ids]) {
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
                }
                htmlStr += '<div class="sheetName">' + sheetName + '</div>'
                htmlStr += XLSX.utils.sheet_to_html(wb.Sheets[sheetName], {
                    editable: false
                })
            } catch (e) {}
        })
        $("#extractor_table").html(htmlStr)
        createCoordinate($("#extractor_table"));
        chooseStandard = false
        renderExtractorEffect(_extModelsData.chooseModel);
        setTimeout(() => {
            for (let k = 0; k < $(".list-group-item").length; k++) {
                if ($(".list-group-item")[k].getAttribute('modelid') == _extModelsData.chooseModel) {
                    $(".list-group-item")[k].setAttribute('class', 'list-group-item list-group-item-dark fy-flex fy-between fy-middle active')
                }
            }
        }, 1000)
        loadExtractor();
    }
    $("#btnArchive").on('click', async function () {
        if (_currentModel && _currentModel.modelType) {
            if (_currentModel.modelType == 'table') {
                dataTable = parseData()
                let newKeyNoSI = []
                let newKeySI = []
                let tbl = getCurrentModelTable();

                newKeyNoSI = newKeys.filter(item => !item.nameSD && !item.nameS)
                newKeySI = newKeys.filter(item => item.nameSD || item.nameS)
                let newDataddd = []
                let newDataTable = _.cloneDeep(dataTable)
                let keyIds = []
                dataTable.filter((item, index) => {
                    let iKey = ''
                    newKeyNoSI.filter(key => {
                        if (iKey) {
                            iKey += "_" + formatStr(key.name) + "_" + item[formatStr(key.name)]
                        } else {
                            iKey += formatStr(key.name) + "_" + item[formatStr(key.name)]
                        }
                    })
                    newKeySI.filter((key, keyIndex) => {
                        let keyPosition0 = key.position[0]+_currentModel.startCell[0]
                        let keyPosition1 = index +  parseInt(_currentModel.valuesStartCell[1]) + parseInt(_currentModel.startCell[1])
                        if (iKey) {
                            iKey += "_" + formatStr(key.name)
                        } else {
                            iKey = formatStr(key.name)
                        }
                        let update_test = formatStr(iKey)
                        let shaObj = new jsSHA("KMAC128", "TEXT", {
                            customization: {
                                value: "My Tagged Application",
                                format: "TEXT"
                            },
                            kmacKey: {
                                value: "abc",
                                format: "TEXT"
                            },
                        });
                        shaObj.update(update_test)
                        let keyCode = shaObj.getHash("HEX", {
                            outputLen: 64
                        });
                        let lis = {
                            '字段': iKey,
                            "唯一编码": keyCode
                        }
                        const cellB = tbl.find("td[X='" + (keyPosition0) + "'][Y='" + (keyPosition1) + "']");
                        let keyLis = {}
                        if(cellB&&cellB[0]){
                            keyLis = {
                                id:cellB[0].id,
                                "唯一编码": keyCode,
                                tableIndex:_currentModel.tableIndex,
                                "position":[keyPosition0,keyPosition1]
                            }
                        }

                        newDataTable[index][formatStr(key.name) + '_唯一编码'] = keyCode
                        if (key.nameS) {
                            if (item[formatStr(key.name) + '_值']) {
                                lis['值'] = item[formatStr(key.name) + '_值']
                            } else {
                                lis['值'] = ''
                            }
                            if(item[formatStr(key.name) + '_指标类型']){
                                lis[formatStr(key.name) + '_指标类型'] = item[formatStr(key.name) + '_指标类型']
                            }
                            if(item[formatStr(key.name) + '_试验类型']){
                                lis[formatStr(key.name) + '_试验类型'] = item[formatStr(key.name) + '_试验类型']
                            }
                            let dataBound = returnBoundFunc(item[formatStr(key.name)])
                            lis[formatStr(key.name) + '_上限'] = dataBound.dataUp
                            lis[formatStr(key.name) + '_下限'] = dataBound.dataDown
                            lis[formatStr(key.name) + '_上偏差'] = dataBound.deviationUpper
                            lis[formatStr(key.name) + '_下偏差'] = dataBound.deviationLower
                            lis[formatStr(key.name) + '_公称值'] = dataBound.nominalValue
                            lis[formatStr(key.name)] = item[formatStr(key.name)]
                            lis[formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                            keyLis['data_up'] = dataBound.dataUp
                            keyLis['data_down'] = dataBound.dataDown
                            keyLis['deviationUpper'] = dataBound.deviationUpper
                            keyLis['deviationLower'] = dataBound.deviationLower
                            keyLis['nominalValue'] = dataBound.nominalValue
                            newDataTable[index][formatStr(key.name) + '_上限'] = dataBound.dataUp
                            newDataTable[index][formatStr(key.name) + '_下限'] = dataBound.dataDown
                            newDataTable[index][formatStr(key.name) + '_上偏差'] = dataBound.deviationUpper
                            newDataTable[index][formatStr(key.name) + '_下偏差'] = dataBound.deviationLower
                            newDataTable[index][formatStr(key.name) + '_公称值'] = dataBound.nominalValue
                            newDataTable[index][formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                        } else {
                            if (item[formatStr(key.name)]) {
                                lis['值'] = item[formatStr(key.name)]
                            } else {
                                lis['值'] = ''
                            }
                        }
                        if(keyLis.id){
                            keyIds.push(keyLis)
                        }

                        newDataddd.push(lis)
                    })
                })
                let GraphData = {
                    graphData: {
                        nodes: [],
                        links: []
                    },
                    keyIds: keyIds,
                    tableData: newDataTable
                }
                let ttData = {
                    data1: newDataTable,
                    data2: newDataddd
                }
                setTimeout(() => {
                    _fs.writeFileSync(_paths.join(_AppDataPath, 'tableData.json'), JSON.stringify(ttData))
                    _fs.accessSync(_paths.join(_AppDataPath, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                    _fs.writeFileSync(_paths.join(_AppDataPath, 'GraphData.json'), JSON.stringify(GraphData))
                    _fs.accessSync(_paths.join(_AppDataPath, 'GraphData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                    zipqbyFunc(qbyObjectPath, function (path) {
                        if (window.LS.get('webservicePathContent')) {
                            sendAjaxWSContent(_AppDataPath, qbyObjectPath, arrobject, _currentModel)
                        } else {
                            alert('请先设置webservice服务地址')
                        }
                    });
                }, 300)
            } else if (_currentModel.modelType == 'freelink' || _currentModel.modelType == 'simplefreelink') {
                let dataNode = []
                let dataEdge = []
                let keys = _currentModel['keys']
                let values = _.get(_currentModel, 'values', [])
                let keysRelation = _.get(_currentModel, 'keysRelation', [])
                if (resetDataTable && resetDataTable[0]) {
                    resetDataTable.filter(val => {
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
                if (keysRelation) {
                    keysRelation.forEach(relation => {
                        if (relation.pid !== '-1') {
                            dataEdge.push({
                                pid_Id: `${ relation.pid }to${ relation._id }`,
                                pid: relation.pid,
                                id: relation._id
                            })
                        }
                    })
                }
                let datasJSON = dataHave(dataNode, dataEdge)
                let newDataddd = []
                for (let m in datasJSON) {
                    let jSONArr = datasJSON[m].name.split("_")
                    let newJSONArr = _.cloneDeep(jSONArr)
                    newJSONArr.splice(newJSONArr.length - 1, 1)
                    let jSONLast = jSONArr[jSONArr.length - 1]
                    let lis = {
                        字段: newJSONArr.join("_"),
                        值: '',
                        唯一编码: ''
                    }

                    let update_test = lis.字段
                    let shaObj = new jsSHA("KMAC128", "TEXT", {
                        customization: {
                            value: "My Tagged Application",
                            format: "TEXT"
                        },
                        kmacKey: {
                            value: "abc",
                            format: "TEXT"
                        },
                    });
                    shaObj.update(update_test)
                    let keyCode = shaObj.getHash("HEX", {
                        outputLen: 64
                    });
                    lis.唯一编码 = keyCode

                    if (datasJSON[m].nameS) {
                        let dimensional = {}
                        dimensionalData.filter(item => {
                            let kt = item.字段
                            if (kt == newJSONArr.join("_")) {
                                dimensional = item
                            }
                        })
                        lis['值'] = jSONLast
                        if (dimensional['规定值']) {
                            lis['规定值'] = dimensional['规定值']
                        }
                        if (dimensional['规定值_上限']) {
                            lis['规定值_上限'] = dimensional['规定值_上限']
                        }
                        if (dimensional['规定值_下限']) {
                            lis['规定值_下限'] = dimensional['规定值_下限']
                        }
                        if (dimensional['上偏差']) {
                            lis['上偏差'] = dimensional['上偏差']
                        }
                        if (dimensional['下偏差']) {
                            lis['下偏差'] = dimensional['下偏差']
                        }
                        if (dimensional['公称值']) {
                            lis['公称值'] = dimensional['公称值']
                        }
                    } else {
                        lis['值'] = jSONLast
                    }
                    newDataddd.push(lis)
                }
                let GraphData = {
                    graphData: {
                        nodes: dataNode,
                        links: dataEdge
                    },
                    tableData: newDataddd
                }

                let ttData = {
                    data1: newDataddd,
                    data2: newDataddd
                }
                _fs.writeFileSync(_paths.join(_AppDataPath, 'tableData.json'), JSON.stringify(ttData))
                _fs.accessSync(_paths.join(_AppDataPath, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                _fs.writeFileSync(_paths.join(_AppDataPath, 'GraphData.json'), JSON.stringify(GraphData))
                _fs.accessSync(_paths.join(_AppDataPath, 'GraphData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                zipqbyFunc(qbyObjectPath, function (path) {
                    if (window.LS.get('webservicePathContent')) {
                        sendAjaxWSContent(_AppDataPath, qbyObjectPath, arrobject, _currentModel)
                    } else {
                        alert('请先设置webservice服务地址')
                    }
                });
            }
        }
    })

    function zipqbyFunc(name, callback) {
        if (name.indexOf('.zip') != -1) {
            name = name.split('.zip')[0]
        }
        if (name.indexOf('.qby') != -1) {
            name = name.split('.qby')[0]
        }
        let zip = new AdmZipD();
        zip.addLocalFolder(name)
        zip.toBuffer();
        let archivePath = _path.join(name + ".zip");
        zip.writeZip(archivePath);
        if (typeof callback === "function") {
            callback(archivePath);
        }
    }
    $("#btnOpenProjFolder").click(function () {
        _shell.openPath(_AppDataPath);
    })
})

function createCoordinate(container) {
    container.find("table").each(function (i) {
        let tbl = $(this);
        let lee = 0
        tbl.attr("tableIndex", (i + 1))
        tbl.find("tr").each(function () {
            let lengths = $(this).find("td").length
            $(this).find("td[colspan]").each(function (e) {
                lengths += parseInt($(this).attr('colspan')) - 1
            })
            if (lengths > lee) {
                lee = lengths
            }
        });
        let headline = '<tr>';
        for (let i = 0; i < lee; i++) {
            headline += '<td class="headline headlineX">' + az[i] + '</td>';
        }
        headline += '</tr>';
        tbl.prepend(headline);
        tbl.find("tr").each(function (e) {
            $(this).prepend('<td class="headline headlineY">' + e + '</td>');
        });
        for (let y = 0; y < tbl.find("tr").length; y++) {
            let tr = tbl.find("tr").eq(y);
            for (let x = 0; x < tr.find("td").length; x++) {
                let td = tr.find("td").eq(x);
                let innerHtml = ''
                if(td.attr("v")){
                    innerHtml = td.attr("v")
                }
                if (!td.hasClass("headline")) {}
                td.attr("Y", td.cellPos().Y)
                td.attr('tableIndex', tbl.attr("tableIndex"))
                if (td[0].id) {
                    td[0].innerHTML = innerHtml + "<div id='" + td[0].id + "test" + tbl.attr("tableIndex") + "' class='leaders'></div>"
                }
                td.attr("X", td.cellPos().X)
            }
        }
    })
    $(document.body).on("click", ".f-model-list li>.list-group-item-title", function () {
        if ($(this).parent().attr("modelID") !== _currentModel.modelID) {
            $(".f-model-list li.active").removeClass("active");
            chooseStandard = false
            $(this).parent().addClass("active");
            renderExtractorEffect($(this).parent().attr("modelID"));
        }
    });
    //阻止浏览器默认右键点击事件
    $(".extractor_table").bind("contextmenu", function () {
        return false;
    })
    $("#extractor_table")[0].addEventListener('scroll', AnimEvent.add(function () {

        for (let i = 0; i < _LINES.length; i++) {
            _LINES[i].position();
        }
    }), false);
    $(".extractor_table").on("mouseover", "table td:not(.headline)", function () {
        let tbl = $(this).parents("table");
        tbl.find("td.headline-light").removeClass("headline-light");
        tbl.find("td.headline[X='" + $(this).attr("X") + "']").addClass("headline-light");
        tbl.find("td.headline[Y='" + $(this).attr("Y") + "']").addClass("headline-light");
    });
    $(".extractor_table").on("mousedown", "td", function (e) {
        if ($(this).hasClass("headline")) return;
        $(".extractor_table").find("td.active").removeClass("active");
        $(this).addClass("active");
    })
}


function parseData() {
    dataTable = []
    $("#tableShow").css('display', 'none')
    $("#freeLinkShow").css('display', 'none')
    new Promise((resolve, reject) => {
        if (_currentModel.modelType == 'table') {
            $("#tableShow").css('display', 'block')
            const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
            if (tableIndex < 1) return
            const sheetName = wbData.SheetNames[tableIndex - 1]
            const ws = wbData.Sheets[sheetName]
            if (!('!ref' in ws)) return
            if (resetDataTable && resetDataTable[0]) {
                resetDataTable.filter(item => {
                    if (item.id) {
                        if ($('#' + item.id + '[tableindex=' + item.tableindex + ']') && $('#' + item.id + '[tableindex=' + item.tableindex + ']')[0]) {
                            if ($('#' + item.id + '[tableindex=' + item.tableindex + ']').hasClass('_EM_key_standard')) {

                            } else {
                                let idWs = item.id.split('-')[1]
                                if (ws[idWs]) {
                                    ws[idWs].v = item.value
                                    ws[idWs].w = item.value
                                }
                            }
                        }
                    }
                })
            }
            dataTable = extractTable(_currentModel, ws)

            resolve();
        }
    })
    return dataTable
}

function renderExtractorEffect(modelID) {
    _currentModel = getModelData(modelID);
    let modelType = _currentModel["modelType"];
    resetPanel();
    $(".p-clip-" + modelType).show();
    $('td').removeClass('_EM_key_standard')
    $('td').removeClass('_EM_key_standard1')
    clearTableTagMarks();
    let tbl = getCurrentModelTable();
    if (_currentModel.hasOwnProperty("startCell")) { // s:187
        tbl.find("td[X='" + _currentModel["startCell"][0] + "'][Y='" + _currentModel["startCell"][1] + "']").addClass("_EM_start");
        startX = _currentModel["startCell"][0];
        startY = _currentModel["startCell"][1];
    }
    checkStartSettedAndThen();
    if (_extModelsData.resetDataTable && _extModelsData.resetDataTable[0]) {
        _extModelsData.resetDataTable.filter((item) => {
            if(item.dataIndicatorType){
                $("#" + item.id).attr('data-indicatorType', item.dataIndicatorType)
                $("#" + item.id).addClass('dataIndicatorType')
            }
            if(item.dataTestType){
                $("#" + item.id).attr('data-testType', item.dataTestType)
            }
            if (item.data_up || item.data_down) {
                let dataUpDown = returnBoundFunc(item.value)
                $("#" + item.id).attr('data_up', dataUpDown.data_up)
                $("#" + item.id).attr('data_down', dataUpDown.data_down)
            }
        })
    }

    if (_currentModel.hasOwnProperty("values") && _currentModel["values"].length > 0) { //
        for (let i = 0; i < _currentModel["values"].length; i++) {
            const rxy = _currentModel["values"][i]["position"];
            const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
            cell.addClass("_EM_value").attr("_val_uid", _currentModel["values"][i]["_id"]).data("rxy", rxy);
            if (_currentModel["values"][i].nameS) {
                cell.addClass('_EM_key_standard')
            }
            if (_currentModel["values"][i].nameSD) {
                cell.addClass('_EM_key_standard1')
            }
        }
    }
    if (_currentModel.hasOwnProperty("valuesStartCell") && _currentModel["valuesStartCell"].length > 0) {
        const rxy = _currentModel["valuesStartCell"];
        tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']")
            .addClass("_EM_value_start");
    }
    if (_currentModel.hasOwnProperty("valuesEndCell") && _currentModel["valuesEndCell"].length > 0) {
        const rxy = _currentModel["valuesEndCell"];
        tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']")
            .addClass("_EM_value_end");
        renderValuesRange(tbl, _currentModel);
    }
    if (_currentModel.modelType == "freelink" || _currentModel.modelType == "simplefreelink") {
        renderValuesRangeFree(tbl, _currentModel);
    }
    if (_currentModel.modelType == 'table') {
        if (_currentModel.hasOwnProperty("keys") && _currentModel["keys"].length > 0) { //
            for (let i = 0; i < _currentModel["keys"].length; i++) {
                const rxy = _currentModel["keys"][i]["position"];
                const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
                cell.attr("_key_uid", _currentModel["keys"][i]["_id"]).data("rxy", rxy);
                if (_currentModel["keys"][i].hasOwnProperty("virtualKey") && _currentModel["keys"][i]["virtualKey"]) {
                    cell.addClass("_EM_virtual_key")
                } else {
                    if (_currentModel["keys"][i].nameS) {
                        cell.addClass("_EM_key")
                        cell.addClass("_EM_key_standard")
                    } else if (_currentModel["keys"][i].nameSD) {
                        cell.addClass("_EM_key")
                        cell.addClass("_EM_key_standard1")
                    } else {
                        cell.addClass("_EM_key")
                        if (cell.hasClass('_EM_key_standard')) {
                            cell.removeClass('_EM_key_standard')
                        }
                        if (cell.hasClass('_EM_key_standard1')) {
                            cell.removeClass('_EM_key_standard1')
                        }
                    }
                }
                if (_currentModel["keys"][i].type != "Vchar") {
                    cell.addClass("_TYPE_").addClass("_TYPE_" + _currentModel["keys"][i].type);
                }
            }
        }
    }
    if (_currentModel.hasOwnProperty("middleKeys") && _currentModel["middleKeys"].length > 0) { //
        for (let i = 0; i < _currentModel["middleKeys"].length; i++) {
            const rxy = _currentModel["middleKeys"][i]["position"];
            const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
            cell.attr("_key_uid", _currentModel["middleKeys"][i]["_id"]).data("rxy", rxy);
            if (cell.hasClass('_EM_key_standard')) {
                cell.removeClass('_EM_key_standard')
            }
            if (cell.hasClass('_EM_key_standard1')) {
                cell.removeClass('_EM_key_standard1')
            }
            cell.addClass("_EM_mid_key");
        }
    }
}

function getValueIndexFromCurrentModel(uid) {
    if (_currentModel["values"]) {
        for (let i = 0; i < _currentModel["values"].length; i++) {
            if (uid == _currentModel["values"][i]._id) {
                return i
            }
        }
    }
}

function renderValuesRange(tbl, _currentModel) {
    if (_currentModel.valuesEndCell && (_currentModel.valuesEndCell[0] || _currentModel.valuesEndCell[1])) {} else {
        return false
    }
    let haveNameSData = _currentModel.keys.filter(item => item.nameS)
    let haveNameSData1 = _currentModel.keys.filter(item => item.nameSD)
    tbl.find("td._EM_value").removeClass("_EM_value");
    tbl.find("td._EM_key_standard").removeClass("_EM_key_standard");
    tbl.find("td._EM_key_standard1").removeClass("_EM_key_standard1");
    let startCellArr = _currentModel.startCell
    if (tbl.find("td._EM_value_start").length > 0 && tbl.find("td._EM_value_end").length > 0) {
        const sY = parseInt(tbl.find("td._EM_value_start").attr("Y"));
        const eY = parseInt(tbl.find("td._EM_value_end").attr("Y"));
        let startLeft = tbl.find("td._EM_value_start")[0].offsetLeft;
        let startTop = tbl.find("td._EM_value_start")[0].offsetTop;
        let endLeft = tbl.find("td._EM_value_end")[0].offsetLeft + tbl.find("td._EM_value_end")[0].offsetWidth;
        let endTop = tbl.find("td._EM_value_end")[0].offsetTop + tbl.find("td._EM_value_end")[0].offsetHeight;
        tbl.find("td").filter(function () {
            return parseInt($(this)[0].offsetLeft) >= startLeft &&
                parseInt($(this)[0].offsetTop) >= startTop &&
                (parseInt($(this)[0].offsetLeft) + parseInt($(this)[0].offsetWidth)) <= endLeft &&
                (parseInt($(this)[0].offsetTop) + parseInt($(this)[0].offsetHeight)) <= endTop
        }).addClass("_EM_value");
        if (haveNameSData && haveNameSData[0] && haveNameSData[0].position) {
            tbl.find("td").filter(function () {
                haveNameSData.filter(itema => {
                    if (parseInt($(this).attr("X")) == startCellArr[0] + itema.position[0] &&
                        parseInt($(this).attr("Y")) >= sY - 1 &&
                        parseInt($(this).attr("Y")) <= eY && !$(this).hasClass('_EM_key')) {
                        $(this).addClass("_EM_key_standard")
                        let returnBoundD = returnBoundFunc($(this).attr('v'))
                        $(this).attr("data_down", returnBoundD.dataDown)
                        $(this).attr("data_up", returnBoundD.dataUp)
                        $(this).attr("deviationUpper", returnBoundD.deviationUpper)
                        $(this).attr("deviationLower", returnBoundD.deviationLower)
                        $(this).attr("nominalValue", returnBoundD.nominalValue)
                        if ($(this).hasClass('_EM_value')) {
                            let valus = ''
                            if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
                                _extModelsData.dataChange.filter(key => {
                                    if ($(this).attr('tableindex') == key.tableindex) {
                                        if ($(this).attr('id') == key.id) {
                                            valus = key.value
                                        }
                                    }
                                })
                            }


                            $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
                            if ((returnBoundD.dataDown || returnBoundD.dataUp)&&valus) {
                                let ifDown = returnBoundD.dataDown
                                let ifUp =returnBoundD.dataUp
                                if (ifDown || ifUp) {
                                    $(this).css('color', '#fff')
                                    if (ifDown && ifUp) {
                                        if (parseFloat(valus) > parseFloat(ifUp) || parseFloat(valus) < parseFloat(ifDown)) {
                                            $(this).css('background-color', 'red')
                                        } else {
                                            $(this).css('background-color', 'green')
                                        }
                                    } else if (ifDown) {
                                        if (valus < ifDown) {
                                            $(this).css('background-color', 'red')
                                        } else {
                                            $(this).css('background-color', 'green')
                                        }
                                    } else {
                                        if (valus > ifUp) {
                                            $(this).css('background-color', 'red')
                                        } else {
                                            $(this).css('background-color', 'green')
                                        }
                                    }
                                }
                            }
                        }
                    }
                })
            })
        }
        if (haveNameSData1 && haveNameSData1[0] && haveNameSData1[0].position) {
            tbl.find("td").filter(function () {
                haveNameSData1.filter(itema => {
                    if (parseInt($(this).attr("X")) == startCellArr[0] + itema.position[0] &&
                        parseInt($(this).attr("Y")) >= sY - 1 &&
                        parseInt($(this).attr("Y")) <= eY) {
                        $(this).addClass("_EM_key_standard1")
                        let valus = $(this).text()
                        if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
                            _extModelsData.dataChange.filter(key => {
                                if ($(this).attr('tableindex') == key.tableindex) {
                                    if ($(this).attr('id') == key.id) {
                                        valus = key.value
                                    }
                                }
                            })
                        }
                        $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
                    }
                })
            })
        }
    }
}

function renderValuesRangeFree(tbl, _currentModel) {
    let haveNameSData = _currentModel.values.filter(item => item.nameS)
    let haveNameSData1 = _currentModel.values.filter(item => item.nameSD)
    tbl.find("td._EM_value").filter(function () {
        let valus = $(this).text()
        setTimeout(() => {
            if ($(this).hasClass('_EM_key_standard')) {
                valus = ''
                if (_extModelsData.resetDataTable && _extModelsData.resetDataTable[0]) {
                    _extModelsData.resetDataTable.filter((item) => {
                        let dataUpDown = returnBoundFunc(item.value)
                        if (item.data_up || item.data_down) {
                            valus = item.value
                            let ifDown = dataUpDown.data_down
                            let ifUp = dataUpDown.data_up
                            if (ifDown || ifUp) {
                                $(this).css('color', '#fff')
                                if (ifDown && ifUp) {
                                    if (parseFloat(valus) > parseFloat(ifUp) || parseFloat(valus) < parseFloat(ifDown)) {
                                        $(this).css('background-color', 'red')
                                    } else {
                                        $(this).css('background-color', 'green')
                                    }
                                } else if (ifDown) {
                                    if (valus < ifDown) {
                                        $(this).css('background-color', 'red')
                                    } else {
                                        $(this).css('background-color', 'green')
                                    }
                                } else {
                                    if (valus > ifUp) {
                                        $(this).css('background-color', 'red')
                                    } else {
                                        $(this).css('background-color', 'green')
                                    }
                                }
                            }
                        }
                    })
                }
            }
            if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
                _extModelsData.dataChange.filter(key => {
                    if ($(this).attr('tableindex') == key.tableindex) {
                        if ($(this).attr('id') == key.id) {
                            valus = key.value
                        }
                    }
                })
            }
            if ($(this).hasClass('_EM_key_standard')) {
                if (!$(this).attr("data_down")) {
                    $(this).attr("data_down", returnBoundFunc($(this).attr('v')).dataDown)
                }
                if (!$(this).attr("data_up")) {
                    $(this).attr("data_up", returnBoundFunc($(this).attr('v')).dataUp)
                }
                $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
            } else {
                $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
            }
            if (haveNameSData && haveNameSData[0] && haveNameSData[0].position) {
                haveNameSData.filter((val => {
                    if ($(this).attr("X") == val.position[0] + 1 && $(this).attr("Y") == val.position[0] + 1) {
                        $(this).addClass("_EM_key_standard")
                        if (!$(this).attr("data_down")) {
                            $(this).attr("data_down", returnBoundFunc($(this).attr('v')).dataDown)
                        }
                        if (!$(this).attr("data_up")) {
                            $(this).attr("data_up", returnBoundFunc($(this).attr('v')).dataUp)
                        }
                        let valus = ''
                        if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
                            _extModelsData.dataChange.filter(key => {
                                if ($(this).attr('tableindex') == key.tableindex) {
                                    if ($(this).attr('id') == key.id) {
                                        valus = key.value
                                    }
                                }
                            })
                        }
                        $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
                    }
                }))
            }
            if (haveNameSData1 && haveNameSData1[0] && haveNameSData1[0].position) {
                haveNameSData1.filter((val => {
                    if ($(this).attr("X") == val.position[0] + 1 && $(this).attr("Y") == val.position[0] + 1) {
                        $(this).addClass("_EM_key_standard1")
                        if (!$(this).attr("data_down")) {
                            $(this).attr("data_down", returnBoundFunc($(this).attr('v')).dataDown)
                        }
                        if (!$(this).attr("data_up")) {
                            $(this).attr("data_up", returnBoundFunc($(this).attr('v')).dataUp)
                        }
                        let valus = ''
                        if (_extModelsData.dataChange && _extModelsData.dataChange[0]) {
                            _extModelsData.dataChange.filter(key => {
                                if ($(this).attr('tableindex') == key.tableindex) {
                                    if ($(this).attr('id') == key.id) {
                                        valus = key.value
                                    }
                                }
                            })
                        }
                        $(this).html(valus + "<div id='" + $(this).attr('id') + 'test' + $(this).attr('tableindex') + "' class='leaders'></div>")
                    }
                }))
            }
        }, 10)
    })
    tttt = tbl
    _currentModelNNN = _currentModel
    if (_currentModel.hasOwnProperty("keys") && _currentModel["keys"].length > 0) { //
        for (let i = 0; i < _currentModel["keys"].length; i++) {
            const rxy = _currentModel["keys"][i]["position"];
            const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
            cell.attr("_key_uid", _currentModel["keys"][i]["_id"]).data("rxy", rxy);
            if (_currentModel["keys"][i].hasOwnProperty("virtualKey") && _currentModel["keys"][i]["virtualKey"]) {
                cell.addClass("_EM_virtual_key")
            } else {
                if (_currentModel["keys"][i].nameS) {
                    cell.addClass("_EM_key")
                    cell.addClass("_EM_key_standard")
                } else if (_currentModel["keys"][i].nameSD) {
                    cell.addClass("_EM_key")
                    cell.addClass("_EM_key_standard1")
                } else {
                    cell.addClass("_EM_key")
                    if (cell.hasClass('_EM_key_standard')) {
                        cell.removeClass('_EM_key_standard')
                    }
                    if (cell.hasClass('_EM_key_standard1')) {
                        cell.removeClass('_EM_key_standard1')
                    }
                }
            }
            if (_currentModel["keys"][i].type != "Vchar") {
                cell.addClass("_TYPE_").addClass("_TYPE_" + _currentModel["keys"][i].type);
            }
        }
    }
    if (_currentModel.modelType != 'table') {
        changeB(tttt, _currentModelNNN)
    }
}

function resetPanel() {
    $("#selSetKeyType").val("Vchar");
    clearTagSelected();
    $(".p-clip").hide();
}

function clearTableTagMarks() {
    $(".extractor_table td")
        .removeClass("active _TYPE_ _TYPE_Int _TYPE_Float _TYPE_Bool _TYPE_Date _TYPE_DateTime _EM_start _EM_key _EM_mid_key _EM_value _EM_loop_end _EM_value_start _EM_value_end _EM_selected_spical_cell _EM_selected_virtual_key_cell _EM_virtual_key");
    $(".extractor_table td").removeAttr(" _key_uid");
    $(".extractor_table td").removeData("_EM_line").removeData("_EM_line_target").removeData("rxy");
    clearTagSelected();
    for (let i = 0; i < _LINES.length; i++) {
        _LINES[i].remove();
    }
    _LINES = [];
}

function clearTableTagMarks1() {
    for (let i = 0; i < _LINES.length; i++) {
        _LINES[i].remove();
    }
    _LINES = [];
}

function getCurrentModelTable() {
    let tableIndex = 1;
    if (_currentModel.hasOwnProperty("tableIndex")) {
        tableIndex = parseInt(_currentModel["tableIndex"]);
    }
    return $(".extractor_table table").eq(tableIndex - 1);
}

function loadExtractor() {
    for (let i = 0; i < _extModelsData.models.length; i++) {
        insertModal(_extModelsData.models[i]);
    }
    $(".f-model-list").eq(0).trigger("click");
    checkAndRestPanelUI();
    $(".jiexiBtn").css('display', 'block')
}

function insertModal(model) {
    const modalLi = $('<li class="list-group-item list-group-item-dark fy-flex fy-between fy-middle" ' +
        ' modelID="' + model['modelID'] + '" modelType="' + model['modelType'] + '"><span class="list-group-item-title fy-bigger-enabled">' + model['modelName'] + '</span>' +
        '</li>');
    $(".f-model-list").append(modalLi);
}

function checkAndRestPanelUI() {
    if (_extModelsData.models.length > 0) {
        $("#boxNextCreateNewModel").append($("#btnCreateNewModel"));
        $(".l-panel").removeClass("fy-flex")
    } else {
        $("#panelContent .p-clip").hide();
        $("#panelContent").append($("#btnCreateNewModel"));
        $(".l-panel").addClass("fy-flex")
    }
}

function checkStartSettedAndThen() {
    if ($(".extractor_table td._EM_start").length < 1) {
        $("input[name='panelRadio'][type='radio']").not("[value='start']").attr("disabled", "disabled");
    } else {
        $("input[name='panelRadio'][type='radio']").not("[value='start']").removeAttr("disabled");
    }
}
(function ($) {
    /* { left: x-coord, top: y-coord } */
    function scanTable($table) {
        let m = [];
        $table.children("tr").each(function (y, row) {
            $(row).children("td, th").each(function (x, cell) {
                let $cell = $(cell),
                    cspan = $cell.attr("colspan") | 0,
                    rspan = $cell.attr("rowspan") | 0,
                    tx, ty;
                cspan = cspan ? cspan : 1;
                rspan = rspan ? rspan : 1;
                for (; m[y] && m[y][x]; ++x); //跳过被占的TD在当前行中
                for (tx = x; tx < x + cspan; ++tx) {
                    for (ty = y; ty < y + rspan; ++ty) {
                        if (!m[ty]) {
                            m[ty] = [];
                        }
                        m[ty][tx] = true;
                    }
                }
                let pos = {
                    Y: y,
                    X: x
                };
                $cell.data("cellPos", pos);
            });
        });
    };
    /* 输出plugin */
    $.fn.cellPos = function (rescan) {
        let $cell = this.first(),
            pos = $cell.data("cellPos");
        if (!pos || rescan) {
            let $table = $cell.closest("table, thead, tbody, tfoot");
            scanTable($table);
        }
        pos = $cell.data("cellPos");
        return pos;
    }
})(jQuery);

function extractTable(model, ws) {
    const x = _.get(model, 'startCell.0', 0)
    const y = _.get(model, 'startCell.1', 0)
    const startX = _.get(model, 'valuesStartCell.0', 0) + x
    const startY = _.get(model, 'valuesStartCell.1', 0) + y - 1
    const endX = _.get(model, 'valuesEndCell.0', 0) + x
    const endY = _.get(model, 'valuesEndCell.1', 0) + y
    const {
        keys = []
    } = model
    if (!ws.hasOwnProperty('!ref')) {
        return false
    }
    const keysRange = _.groupBy(keys, 'position.1')
    //判断如果是单行的表头就不合并列
    const shouldMergeColspan = Object.keys(keysRange).length !== 1
    newKeys = _.cloneDeep(keys)
    let data = []
    if (shouldMergeColspan) {
        //如果有合并列的表头，添加
        keys.forEach(key => {
            const colspan = parseInt(_.get(key, 'colspan', 1)),
                rowspan = parseInt(_.get(key, 'rowspan', 1))
            if (colspan * rowspan > 1) {
                for (let i = 0; i < colspan; i++) {
                    for (let j = 0; j < rowspan; j++) {
                        if (i === 0 && j === 0) {} else {
                            keys.push({
                                ...key,
                                position: [i + key.position[0], j + key.position[1]]
                            })
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
            let ls = {}
            groupKey.filter((item, index) => {
                if (!item.colspan) {
                    ls = item
                }
            })
            if (Object.keys(ls).length < 1) {
                ls = groupKey[groupKey.length - 1]
                ls.position = [groupKey[0].position[0], groupKey[groupKey.length - 1].position[1]]
            }
            a.push({
                ...ls,
                name: _.uniq(name).join('|')
            })
        })
        newKeys = a
    }
    for (let k = 0; k < newKeys.length; k++) {
        for (let m = k + 1; m < newKeys.length; m++) {
            if (newKeys[k]._id == newKeys[m]._id) {
                newKeys.splice(m, 1)
                k--
            }
        }
    }
    data = parseRange(newKeys, [x, y], [startX, startY], [endX, endY], ws,model)
    return data
}

function parseRange(keys, startCell, valuesStart, valuesEnd, ws,model) {
    const tbs = $('table[tableindex='+model.tableIndex+']')
    const [x, y] = startCell
    const [colStart, rowStart] = valuesStart
    const [colEnd, rowEnd] = valuesEnd
    const sheetMerges = _.get(ws, '!merges', [])
    const data = []
    for (let r = rowStart; r < rowEnd; r++) {
        let obj = {}
        keys.forEach(key => {
            const c = _.get(key, 'position.0', 0) + x - 1
            let dataIndicatorType = ''
            let dataTestType = ''
            const colspan = _.get(key, 'colspan', 1)
            let merge = {},
                v = ''
            if (colspan > 1) {
                let k = []
                for (let j = c; j <= c + colspan - 1; j++) {
                    if (sheetMerges.length > 0) {
                        merge = _.find(sheetMerges, o => {
                            return o.s.c <= j && o.e.c >= j && o.s.r <= r && o.e.r >= r
                        })
                    }
                    let mergeKey
                    if (merge) {
                        mergeKey = Object.keys(merge)
                    }
                    let cell_address = {
                        c: j,
                        r: r
                    }
                    if( mergeKey && mergeKey[0]){
                        cell_address.c = _.get(merge, 's.c', '')
                        cell_address.r = _.get(merge, 's.r', '')
                    }
                    cell_address.c = cell_address.c + 1
                    cell_address.r = cell_address.r + 1
                    const tds = tbs.find('td[x='+cell_address.c+'][y='+cell_address.r+']')
                    if($(tds)&&$(tds)[0]&&$(tds).hasClass('_EM_key_standard')&&$(tds).hasClass('_EM_value')){
                        if($(tds).attr('data-indicatorType')){
                            dataIndicatorType = $(tds).attr('data-indicatorType')
                            dataTestType = $(tds).attr('data-testType')
                        }
                    }
                    const tempV = mergeKey && mergeKey[0] ? getCellValue(_.get(merge, 's.c', ''), _.get(merge, 's.r', ''), ws) : getCellValue(j, r, ws)
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
                if (merge) {
                    mergeKey = Object.keys(merge)
                }
                let cell_address = {
                    c: c,
                    r: r
                }
                if( mergeKey && mergeKey[0]){
                    cell_address.c = _.get(merge, 's.c', '')
                    cell_address.r = _.get(merge, 's.r', '')
                }
                cell_address.c = cell_address.c + 1
                cell_address.r = cell_address.r + 1
                const tds = tbs.find('td[x='+cell_address.c+'][y='+cell_address.r+']')
                if($(tds)&&$(tds)[0]&&$(tds).hasClass('_EM_key_standard')&&$(tds).hasClass('_EM_value')){
                    if($(tds).attr('data-indicatorType')){
                        dataIndicatorType = $(tds).attr('data-indicatorType')
                        dataTestType = $(tds).attr('data-testType')
                    }
                }
                v = mergeKey && mergeKey[0] ? getCellValue(_.get(merge, 's.c', ''), _.get(merge, 's.r', ''), ws) : getCellValue(c, r, ws)
            }
            let newkk = []
            if(resetDataTable&&resetDataTable[0]){
                resetDataTable.filter((item)=>{
                    if(item.id){
                        if(item.x==c+1&&item.y==r+1){
                            if($('#'+item.id+'[tableindex='+item.tableindex+']')&&$('#'+item.id+'[tableindex='+item.tableindex+']')[0]){
                                if($('#'+item.id+'[tableindex='+item.tableindex+']').hasClass('_EM_key_standard')){
                                    newkk.push(item)
                                }
                            }
                        }
                    }
                })
            }
            if (key.name) {
                _.set(obj, formatStr(key.name.replace('.', 'dottod')), formatStr(v))
                if(dataIndicatorType){
                    _.set(obj, formatStr(key.name.replace('.', 'dottod'))+'_指标类型', dataIndicatorType)
                    _.set(obj, formatStr(key.name.replace('.', 'dottod'))+'_试验类型', dataTestType)
                }
                if(newkk&&newkk[0]){
                    _.set(obj, formatStr(key.name.replace('.', 'dottod'))+'_值', newkk[0].value)
                }
            }
        })
        data.push(obj)
    }
    return data
}

function saveCurrentModel() {
    for (let i = 0; i < _extModelsData.models.length; i++) {
        if (_extModelsData.models[i]["modelID"] == _currentModel["modelID"]) {
            _extModelsData.models[i] = _currentModel;
        }
    }
    saveExtModelsData();
}

function saveExtModelsData() {
    _fse.writeJsonSync(_extractorModelFile, _extModelsData);
}
$(document).on('click', 'td', function () {
    if (_currentModel.modelType == 'table') {} else {
        if ($(this).attr('class').indexOf('_EM_value') == -1) {
            $('._EM_value').removeClass('_EM_key_Choose')
        }
    }

})
$(document).on('click', '._EM_value', function () {
    if (_currentModel.modelType == 'table') {
        if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
            let tdf = $('.extractor_table .InputStyle')[0]
            let tds = tdf.parentNode
            if (tdf.value) {
                $(tds).removeClass('_EM_key_standard2')
            } else {
                $(tds).addClass('_EM_key_standard2')
            }
        }

        if ($(this).hasClass('_EM_key_standard1') || $(this).hasClass('_EM_key_standard')) {
            $('._EM_value').removeClass('_EM_key_Choose')
            $(this).removeClass('_EM_key_standard2')
            $(this).addClass('_EM_key_Choose')

            if ($(this).hasClass('_EM_key')) {} else {
                let data_down = parseFloat($(this).attr('data_down'))
                let data_up = parseFloat($(this).attr('data_up'))
                let colorNow = '#fff'
                if (data_down || data_up) {
                    if (data_down && data_up) {
                        if ($(this).text() > data_up || $(this).text() < data_down) {
                            colorNow = '#fff'
                        }
                    } else if (data_down) {
                        if ($(this).text() < data_down) {
                            colorNow = '#fff'
                        }
                    } else {
                        if ($(this).text() > data_up) {
                            colorNow = '#fff'
                        }
                    }
                }
                if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
                    let tdf = $('.extractor_table .InputStyle')[0]
                    let dataId = tdf.getAttribute('data-id')
                    let dataId1 = dataId.split('&&')[0]
                    let dataId2 = dataId.split('&&')[1]
                    let tds = tdf.parentNode
                    if ($(this).attr('id') + '&&' + $(this).attr('tableIndex') == dataId) {} else {
                        let html = tdf.value + "<div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                        $(tds).html(html)
                        let isdd = $(this).attr('id') + '&&' + $(this).attr('tableIndex')
                        $(this).css('padding', '0')
                        $(this).css('position', 'relative')
                        let newhtml = "<input class='InputStyle' placeholder='" + $(this).attr('v') + "' style='height:" + $(this).css('height') + ";user-select:all;z-index: 10000;height:100%;width:100%;top:0;color:" + colorNow + "' data-id=" + isdd + " value='" + $(this).text() + "'/><div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                        $(this).html(newhtml)
                    }
                } else {
                    let isdd = $(this).attr('id') + '&&' + $(this).attr('tableIndex')
                    $(this).css('padding', '0')
                    $(this).css('position', 'relative')
                    let ttt = $(this).html()
                    let ttt1 = ''
                    if (ttt) {
                        let tttArr = ttt.split('<div')
                        if (tttArr[1]) {
                            ttt1 = '<div' + tttArr[1]
                        } else {
                            ttt1 = '<div' + tttArr[0]
                        }
                    }
                    let newhtml = "<input class='InputStyle' placeholder='" + $(this).attr('v') + "' style='height:" + $(this).css('height') + ";user-select:all;z-index: 10000;height:100%;width:100%;top:0;color:" + colorNow + "' data-id=" + isdd + " value='" + $(this).text() + "'/>" + ttt1
                    $(this).html(newhtml)
                }
            }
        } else {
            if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
                let tdf = $('.extractor_table .InputStyle')[0]
                let tds = tdf.parentNode
                $(tds).removeClass('_EM_key_standard2')
            }
        }
    } else {
        setTimeout(() => {
            if ($(this).attr('class').indexOf('_EM_key') != -1 && $(this).attr('class').indexOf('_EM_key_standard') == -1) {} else {
                $(this).addClass('_EM_key_Choose')
                $('._EM_value').removeClass('_EM_key_Choose')
                $(this).addClass('_EM_key_Choose')
                let data_down = parseFloat($(this).attr('data_down'))
                let data_up = parseFloat($(this).attr('data_up'))
                let colorNow = '#fff'
                if (data_down || data_up) {
                    if (data_down && data_up) {
                        if ($(this).text() > data_up || $(this).text() < data_down) {
                            colorNow = '#fff'
                        }
                    } else if (data_down) {
                        if ($(this).text() < data_down) {
                            colorNow = '#fff'
                        }
                    } else {
                        if ($(this).text() > data_up) {
                            colorNow = '#fff'
                        }
                    }
                }
                if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
                    let tdf = $('.extractor_table .InputStyle')[0]
                    let dataId = tdf.getAttribute('data-id')
                    let dataId1 = dataId.split('&&')[0]
                    let dataId2 = dataId.split('&&')[1]
                    let tds = tdf.parentNode
                    if (tdf.value) {} else {
                        tds.addClass('_EM_key_standard2')
                    }
                    if ($(this).attr('id') + '&&' + $(this).attr('tableIndex') == dataId) {} else {
                        let html = tdf.value + "<div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                        $(tds).html(html)
                        let isdd = $(this).attr('id') + '&&' + $(this).attr('tableIndex')
                        $(this).css('padding', '0')
                        $(this).css('position', 'relative')
                        let newhtml = "<input class='InputStyle' placeholder='" + $(this).attr('v') + "' style='height:" + $(this).css('height') + ";user-select:all;z-index: 10000;height:100%;width:100%;top:0;color:" + colorNow + "' data-id=" + isdd + " value='" + $(this).text() + "'/><div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                        $(this).html(newhtml)
                    }
                } else {
                    let isdd = $(this).attr('id') + '&&' + $(this).attr('tableIndex')
                    $(this).css('padding', '0')
                    $(this).css('position', 'relative')
                    let ttt = $(this).html()
                    let ttt1 = ''
                    if (ttt) {
                        let tttArr = ttt.split('<div')
                        if (tttArr[1]) {
                            ttt1 = '<div' + tttArr[1]
                        } else {
                            ttt1 = '<div' + tttArr[0]
                        }
                    }
                    let newhtml = "<input class='InputStyle' placeholder='" + $(this).attr('v') + "' style='height:" + $(this).css('height') + ";user-select:all;z-index: 10000;height:100%;width:100%;top:0;color:" + colorNow + "' data-id=" + isdd + " value='" + $(this).text() + "'/>" + ttt1
                    $(this).html(newhtml)
                }
                clearTableTagMarks1()
                if (_currentModel.modelType != 'table') {
                    changeB(tttt, _currentModelNNN)
                }
            }
        }, 10)

    }

})
//修改文件
function changeB(tbl, _currentModel) {
    setTimeout(() => {
        if (_currentModel.hasOwnProperty("keys") && _currentModel["keys"].length > 0) { //
            for (let i = 0; i < _currentModel["keys"].length; i++) {
                const rxy = _currentModel["keys"][i]["position"];
                const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
                if (_currentModel["keys"][i].hasOwnProperty("targetId")) {
                    let targetInfo = _currentModel["values"][getValueIndexFromCurrentModel(_currentModel["keys"][i]["targetId"])];
                    const cellB = tbl.find("td[X='" + (targetInfo["position"][0] + startX) + "'][Y='" + (targetInfo["position"][1] + startY) + "']");
                    let id1 = cell[0].id + 'test' + cell.attr('tableIndex')
                    let id2 = cellB[0].id + 'test' + cellB.attr('tableIndex')
                    if ($("#" + cell[0].id + 'test' + cell.attr('tableIndex')) &&
                        $("#" + cell[0].id + 'test' + cell.attr('tableIndex'))[0] &&
                        $("#" + cellB[0].id + 'test' + cellB.attr('tableIndex')) &&
                        $("#" + cellB[0].id + 'test' + cellB.attr('tableIndex'))[0]) {
                        let isHaves = false
                        if (_LINES && _LINES[0]) {
                            for (let kn = 0; kn < _LINES.length; kn++) {
                                if (_LINES[kn].start.id == id1 && _LINES[kn].end.id == id2) {
                                    isHaves = true
                                }
                            }
                        }
                        if (!isHaves) {
                            $(cell).css('position', 'relative')
                            $(cellB).css('position', 'relative')
                            let line = new LeaderLine($("#" + cell[0].id + 'test' + cell.attr('tableIndex'))[0], $("#" + cellB[0].id + 'test' + cellB.attr('tableIndex'))[0], {
                                "showEffectName": "draw",
                                endPlug: 'arrow1',
                                path: 'straight',
                                width: 10,
                                height: 10,
                                size: 1.8,
                                startPlugSize: 1,
                                endPlugSize: 1,
                                outlineSize: '3px',
                                startPlugColor: '#ff3792', // 渐变色开始色
                                endPlugColor: '#ff1a26', // 渐变色结束色
                                gradient: true, // 使用渐变色
                            });
                            cell.data("_EM_line", line);
                            cell.data("_EM_line_target", cellB);
                            _LINES.push(line);
                        }
                    }
                }
            }
        }
    }, 10)
}
$(document).on('input', '.InputStyle', function () {
    let tdNow = $(this).parent('td')
    let $this = $(this)
    let isHave = false
    let ifDown = tdNow.attr('data_down')
    let ifUp = tdNow.attr('data_up')
    if (ifDown || ifUp && tdNow.hasClass('_EM_key_standard')) {
        if ($this.val()) {
            tdNow.css('color', '#fff')
            $this.css('color', '#fff')
            if (ifDown && ifUp) {
                if (parseFloat($this.val()) > parseFloat(ifUp) || parseFloat($this.val()) < parseFloat(ifDown)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            } else if (ifDown) {
                if (parseFloat($this.val()) < parseFloat(ifDown)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            } else {
                if (parseFloat($this.val()) > parseFloat(ifUp)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            }
        } else {
            $this.css('color', '#fff')
            tdNow.css('background-color', '#ffc420')
        }

    } else {}
    if (resetDataTable && resetDataTable[0]) {
        resetDataTable.filter(item => {
            if (item.id == tdNow.attr('id') && item.tableindex == tdNow.attr('tableindex')) {
                isHave = true
                item._val_uid = tdNow.attr('_val_uid')
                item.value = $(this).val()
            }
        })
    } else {
        resetDataTable = []
    }
    if (!isHave) {
        let lis = {
            id: tdNow.attr('id'),
            tableindex: tdNow.attr('tableindex'),
            value: $(this).val(),
            _val_uid: tdNow.attr('_val_uid'),
            data_down: tdNow.attr('data_down'),
            data_up: tdNow.attr('data_up'),
            deviationUpper: tdNow.attr('deviationUpper'),
            deviationLower: tdNow.attr('deviationLower'),
            nominalValue: tdNow.attr('nominalValue'),
            x: tdNow.attr('x'),
            y: tdNow.attr('y'),
        }
        resetDataTable.push(lis)
    }
    _extModelsData.dataChange = resetDataTable
    saveCurrentModel();
})
$(document).on('blur', '.InputStyle', function () {
    let tdNow = $(this).parent('td')
    let $this = $(this)
    $(this).parent('td').removeClass('_EM_key_Choose')
    let ifDown = tdNow.attr('data_down')
    let ifUp = tdNow.attr('data_up')
    if (ifDown || ifUp && tdNow.hasClass('_EM_key_standard')) {
        if ($this.val()) {
            tdNow.css('color', '#fff')
            $this.css('color', '#fff')
            if (ifDown && ifUp) {
                if (parseFloat($this.val()) > parseFloat(ifUp) || parseFloat($this.val()) < parseFloat(ifDown)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            } else if (ifDown) {
                if (parseFloat($this.val()) < parseFloat(ifDown)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            } else {
                if (parseFloat($this.val()) > parseFloat(ifUp)) {
                    tdNow.css('background-color', 'red')
                } else {
                    tdNow.css('background-color', 'green')
                }
            }
        } else {
            $this.css('color', '#fff')
            tdNow.css('background-color', '#ffc420')
        }

    } else {}
    if (_extModelsData.models[0] && _extModelsData.models[0].modelType != 'table') {
        clearTableTagMarks1()
        changeB(tttt, _currentModelNNN)
    }

})
/**
 * 查看解析数据
 */
$(document).on('click', '.jiexiBtn', function () {

    let tableDataShow = []
    if (_currentModel && _currentModel.modelType) {
        if (_currentModel.modelType == 'table') {
            dataTable = parseData()
            let newKeyNoSI = []
            let newKeySI = []
            newKeyNoSI = newKeys.filter(item => !item.nameSD && !item.nameS)
            newKeySI = newKeys.filter(item => item.nameSD || item.nameS)

            let newDataddd = []
            let newDataTable = _.cloneDeep(dataTable)
            dataTable.filter((item, index) => {
                let iKey = ''
                newKeyNoSI.filter(key => {
                    if (iKey) {
                        iKey += "_" + formatStr(key.name) + "_" + item[formatStr(key.name)]
                    } else {
                        iKey += formatStr(key.name) + "_" + item[formatStr(key.name)]
                    }
                })
                newKeySI.filter((key, keyIndex) => {
                    if (iKey) {
                        iKey += "_" + formatStr(key.name)
                    } else {
                        iKey = formatStr(key.name)
                    }
                    let update_test = formatStr(iKey)
                    let shaObj = new jsSHA("KMAC128", "TEXT", {
                        customization: {
                            value: "My Tagged Application",
                            format: "TEXT"
                        },
                        kmacKey: {
                            value: "abc",
                            format: "TEXT"
                        },
                    });
                    shaObj.update(update_test)
                    let keyCode = shaObj.getHash("HEX", {
                        outputLen: 64
                    });
                    let lis = {
                        '字段': iKey,
                        "唯一编码": keyCode
                    }
                    newDataTable[index][formatStr(key.name) + '_唯一编码'] = keyCode
                    if (key.nameS) {
                        if (item[formatStr(key.name) + '_值']) {
                            lis['值'] = item[formatStr(key.name) + '_值']
                        } else {
                            lis['值'] = ''
                        }
                        if(item[formatStr(key.name) + '_指标类型']){
                            lis[formatStr(key.name) + '_指标类型'] = item[formatStr(key.name) + '_指标类型']
                        }
                        if(item[formatStr(key.name) + '_试验类型']){
                            lis[formatStr(key.name) + '_试验类型'] = item[formatStr(key.name) + '_试验类型']
                        }
                        let dataBound = returnBoundFunc(item[formatStr(key.name)])
                        lis[formatStr(key.name) + '_上限'] = dataBound.dataUp
                        lis[formatStr(key.name) + '_下限'] = dataBound.dataDown
                        lis[formatStr(key.name) + '_上偏差'] = dataBound.deviationUpper
                        lis[formatStr(key.name) + '_下偏差'] = dataBound.deviationLower
                        lis[formatStr(key.name) + '_公称值'] = dataBound.nominalValue
                        lis[formatStr(key.name)] = item[formatStr(key.name)]
                        lis[formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                        newDataTable[index][formatStr(key.name) + '_上限'] = dataBound.dataUp
                        newDataTable[index][formatStr(key.name) + '_下限'] = dataBound.dataDown
                        newDataTable[index][formatStr(key.name) + '_上偏差'] = dataBound.deviationUpper
                        newDataTable[index][formatStr(key.name) + '_下偏差'] = dataBound.deviationLower
                        newDataTable[index][formatStr(key.name) + '_公称值'] = dataBound.nominalValue
                        newDataTable[index][formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                    } else {
                        if (item[formatStr(key.name)]) {
                            lis['值'] = item[formatStr(key.name)]
                        } else {
                            lis['值'] = ''
                        }

                    }
                    newDataddd.push(lis)
                })
            })
            tableDataShow = newDataddd
        } else if (_currentModel.modelType == 'freelink' || _currentModel.modelType == 'simplefreelink') {
            let dataNode = []
            let dataEdge = []
            let keys = _currentModel['keys']
            let values = _.get(_currentModel, 'values', [])
            let keysRelation = _.get(_currentModel, 'keysRelation', [])
            if (resetDataTable && resetDataTable[0]) {
                resetDataTable.filter(val => {
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
            if (keysRelation) {
                keysRelation.forEach(relation => {
                    if (relation.pid !== '-1') {
                        dataEdge.push({
                            pid_Id: `${ relation.pid }to${ relation._id }`,
                            pid: relation.pid,
                            id: relation._id
                        })
                    }
                })
            }
            let datasJSON = dataHave(dataNode, dataEdge)

            let newDataddd = []
            for (let m in datasJSON) {
                let jSONArr = datasJSON[m].name.split("_")
                let newJSONArr = _.cloneDeep(jSONArr)
                newJSONArr.splice(newJSONArr.length - 1, 1)
                let jSONLast = jSONArr[jSONArr.length - 1]
                let lis = {
                    字段: newJSONArr.join("_"),
                    值: '',
                    唯一编码: ''
                }

                let update_test = lis.字段
                let shaObj = new jsSHA("KMAC128", "TEXT", {
                    customization: {
                        value: "My Tagged Application",
                        format: "TEXT"
                    },
                    kmacKey: {
                        value: "abc",
                        format: "TEXT"
                    },
                });
                shaObj.update(update_test)
                let keyCode = shaObj.getHash("HEX", {
                    outputLen: 64
                });
                lis.唯一编码 = keyCode
                if (datasJSON[m].nameS) {
                    let dimensional = {}
                    dimensionalData.filter(item => {
                        let kt = item.字段
                        if (kt == newJSONArr.join("_")) {
                            dimensional = item
                        }
                    })
                    lis['值'] = jSONLast
                    if (dimensional['规定值']) {
                        lis['规定值'] = dimensional['规定值']
                    }
                    if (dimensional['规定值_上限']) {
                        lis['规定值_上限'] = dimensional['规定值_上限']
                    }
                    if (dimensional['规定值_下限']) {
                        lis['规定值_下限'] = dimensional['规定值_下限']
                    }
                    if (dimensional['上偏差']) {
                        lis['上偏差'] = dimensional['上偏差']
                    }
                    if (dimensional['下偏差']) {
                        lis['下偏差'] = dimensional['下偏差']
                    }
                    if (dimensional['公称值']) {
                        lis['公称值'] = dimensional['公称值']
                    }
                } else {
                    lis['值'] = jSONLast
                }
                newDataddd.push(lis)
            }
            tableDataShow = newDataddd
        }
    }
    if (tableDataShow && tableDataShow[0]) {
        $("#jiexiShow").modal('show')
        let keyAllls = getObjectKeys(tableDataShow)
        keyAllls = [...new Set(keyAllls)]
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
        $('#tableDataParse').bootstrapTable('destroy').bootstrapTable({
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
            data: tableDataShow,
        });
        $(".pagination-detail").css('display', 'none')
        $(".no-records-found td").html('没有数据请您重新筛选')
    } else {
        alert('没有模版')
    }

})

function getObjectKeys(object) {
    var keys = [];
    for (var property in object) {
        for (let key in object[property]) {
            keys.push(key);
        }
    }
    return keys;
}
