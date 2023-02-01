let _uuid = require('uuid-random')
let _fs = require('fs')
let request = require("request");
let _ = require('lodash')
let compressing = require('compressing');
let _extModelsData, _extractorModelFile;
let _currentModel = {};
let chooseStandard = false
let chooseRecord = false
let _LINES = [];
let resetDataTable = []
let AdmZipD = require('adm-zip');
const _paths = require("path");
let _modalCreateNew;
let _freelinkLR = [];
let dataUrlImagePath = ''
let rootURL = ''
let wb
let qbyObjectPath = ''
let qbyObjectName = ''
let filenameNow = ''
let newKeys
let AppDataFolders = ''
let indicatorTypeHtml = ''
let testTypeChooseHtml = ''
indicatorType.filter(item=>{
    indicatorTypeHtml+='<option '+item.value+'>'+item.name+'</option>';
})
testType.filter(item=>{
    testTypeChooseHtml+='<option '+item.value+'>'+item.name+'</option>';
})
$("#indicatorTypeChoose").append(indicatorTypeHtml)
$("#testTypeChoose").append(testTypeChooseHtml)
$("#haveFile").css('display', 'none')
$("#noFile").css('display', 'none')
$(function () {
    let _remotes = require('electron').remote
    const _shell = require('electron').shell
    const m = _remotes.Menu.getApplicationMenu();
    const dx = (_remotes.process.platform === 'darwin') ? 1 : 0;
    m.items[dx].submenu.items[0].enabled = false
    m.items[dx].submenu.items[1].enabled = false
    m.items[dx].submenu.items[2].enabled = false
    _modalCreateNew = new bootstrap.Modal(document.getElementById('modalCreateNew'), {
        keyboard: false
    })
    let urls = window.location.search.substring(1)
    if (urls.indexOf('qbyFileAbsolutePath') === -1) {
        $("#haveFile").css('display', 'none')
        $("#noFile").css('display', 'block')
    } else {
        $("#haveFile").css('display', 'block')
        $("#noFile").css('display', 'none')
    }
    let query = urls
    if (window.location.href.indexOf('urlLocal') !== -1) {
        $("#haveFile").css('display', 'block')
        $("#noFile").css('display', 'none')
        query = window.location.search.substring(1)
    } else {}
    let uCode = query
    let vars = uCode.split("&");
    let arrObject = {}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrObject[pair[0]] = decodeURI(pair[1])
    }
    let AppDataFoldersRoot = 'nowPage_baiyu'
    let _AppDataPathRoot = _paths.join(_remotes.app.getPath("appData"), AppDataFoldersRoot);
    if (window.location.href.indexOf('urlLocal') !== -1) {
        rootURL = arrObject.urlLocal
        dataUrlImagePath = _paths.join(_AppDataPathRoot, rootURL)
        _extractorModelFile = _paths.join(_AppDataPathRoot, rootURL, 'models', 'extractor_model.json')
        qbyObjectPath = _paths.join(_AppDataPathRoot, rootURL)
        qbyObjectName = rootURL.split(_paths.sep)[1]
        AppDataFolders = _paths.join(_AppDataPathRoot, rootURL.split(_paths.sep)[0])
        filenameNow = arrObject.fileName
        openFileShow(_paths.join(_AppDataPathRoot, rootURL, filenameNow), _paths.join(_AppDataPathRoot, rootURL, 'models', 'extractor_model.json'))
    } else {
        if (arrObject.qbyFileAbsolutePath && arrObject.qbyFileAbsolutePath != undefined && arrObject.qbyFileAbsolutePath != 'undefined' && arrObject.qbyFileAbsolutePath != null) {
            let nowFiles = 'nowPage' + (new Date()).getTime()
            AppDataFolders = _paths.join(_AppDataPathRoot, nowFiles)
            let _AppDataPath = AppDataFolders;
            let xlsxFileAbsolutePathArr = _paths.basename(arrObject.xlsxFileAbsolutePath)
            let xlsxFileAbsolutePath = xlsxFileAbsolutePathArr
            let jsonFileAbsolutePathArr = _paths.basename(arrObject.jsonFileAbsolutePath)
            let jsonFileAbsolutePath = jsonFileAbsolutePathArr
            let urlQbyArr = _paths.basename(arrObject.qbyFileAbsolutePath)
            let urlQbyS = urlQbyArr
            let urlQbyS_p = urlQbyS.split('.')[0]
            rootURL = urlQbyS_p
            let _AppDataPath_urlQbyS_p = _paths.join(_AppDataPath, urlQbyS_p)
            qbyObjectPath = _AppDataPath_urlQbyS_p
            dataUrlImagePath = _AppDataPath_urlQbyS_p
            _extractorModelFile = _paths.join(_AppDataPath_urlQbyS_p, _paths.join('models', 'extractor_model.json'))
            filenameNow = 'original.xlsx'
            _fs.access(_AppDataPathRoot, _fs.constants.F_OK, function (res) {
                if (res) {
                    _fs.mkdir(_AppDataPathRoot, 511, function (err) {
                        if (err) {} else {
                            createFile()
                        }
                    })
                } else {
                    createFile()
                }
            })

            function createFile() {
                _fs.mkdir(_AppDataPath, 511, function (err) {
                    if (err) {} else {
                        let xlsxFileAbsolutePathStream = _fs.createWriteStream(_paths.join(_AppDataPath, xlsxFileAbsolutePath))
                        request(encodeURI(arrObject.xlsxFileAbsolutePath)).pipe(xlsxFileAbsolutePathStream).on("close", function (err) {});
                        let jsonFileAbsolutePathStream = _fs.createWriteStream(_paths.join(_AppDataPath, jsonFileAbsolutePath))
                        request(encodeURI(arrObject.jsonFileAbsolutePath)).pipe(jsonFileAbsolutePathStream).on("close", function (err) {});
                        let qbyFileAbsolutePathStream = _fs.createWriteStream(_AppDataPath_urlQbyS_p + '.zip')
                        request(encodeURI(arrObject.qbyFileAbsolutePath)).pipe(qbyFileAbsolutePathStream).on("close", function (err) {
                            if (err) {} else {
                                compressing.zip.uncompress(_AppDataPath_urlQbyS_p + '.zip', _AppDataPath_urlQbyS_p, function (res) {})
                                setTimeout(() => {
                                    rootURL = _paths.join(nowFiles, urlQbyS_p)
                                    openFileShow(_paths.join(_AppDataPath_urlQbyS_p, 'original.xlsx'), _paths.join(_AppDataPath_urlQbyS_p, _paths.join('models', 'extractor_model.json')))
                                }, 300)
                            }
                        })
                    }
                })
            }
        } else {
            $("#haveFile").css('display', 'none')
            $("#noFile").css('display', 'block')
            if (_remote) {
                const _remote = require('electron').remote;
            }
            const EXTENSIONS = "xls|xlsx|csv".split("|");
            const handleReadBtn = async function () {
                const files = await _remote.dialog.showOpenDialog({
                    title: '选择一个文件',
                    filters: [{
                        name: "Spreadsheets",
                        extensions: EXTENSIONS
                    }],
                    properties: ['openFile', 'treatPackageAsDirectory']
                });
                if (files.filePaths.length > 0) {
                    processFile({
                        path: files.filePaths[0],
                        name: _path.basename(files.filePaths[0])
                    })
                }
            };
            let div = document.querySelector('.card-body');
            div.addEventListener('click', handleReadBtn, false);

            function processFile(file) {
                if (file.extname === ".docx") {} else {
                    let nowFiles = 'nowPage' + (new Date()).getTime()
                    AppDataFolders = _paths.join(_AppDataPathRoot, nowFiles)
                    let _AppDataPath = AppDataFolders;
                    let xlsxs = 'original.xlsx'
                    filenameNow = 'original.xlsx'
                    let urlQbyS_p = xlsxs.split('.')[0]
                    let _AppDataPath_urlQbyS_p = _paths.join(_AppDataPath, urlQbyS_p)
                    qbyObjectName = urlQbyS_p
                    qbyObjectPath = _AppDataPath_urlQbyS_p
                    dataUrlImagePath = _AppDataPath_urlQbyS_p
                    let _extractorModelFile1 = _paths.join(_AppDataPath, _paths.join('models', 'extractor_model.json'))
                    _extractorModelFile = _paths.join(_AppDataPath_urlQbyS_p, _paths.join('models', 'extractor_model.json'))
                    _fs.access(_AppDataPathRoot, _fs.constants.F_OK, function (res) {
                        if (res) {
                            _fs.mkdir(_AppDataPathRoot, 511, function (err) {
                                if (err) {} else {
                                    createFile()
                                }
                            })
                        } else {
                            _fs.mkdir(_AppDataPath, 511, function (err) {
                                if (err) {} else {
                                    createFile()
                                }
                            })
                        }
                    })

                    function createFile() {
                        _fs.copyFileSync(file.path, _paths.join(_AppDataPath, xlsxs))
                        _fs.mkdir(_paths.join(_AppDataPath, 'models'), 511, function (err) {
                            if (err) {} else {
                                let data = {
                                    "varsion": "1.0",
                                    "templateID": "3decce61-1a3a-45a6-a3b6-2b677747c782",
                                    "templateFileType": "EXCEL",
                                    "templateFileSuffix": ".xlsx",
                                    "models": []
                                }
                                _fs.writeFileSync(_extractorModelFile1, JSON.stringify(data))
                                _fs.accessSync(_extractorModelFile1, _fs.constants.R_OK | _fs.constants.W_OK)
                                _fs.mkdir(_paths.join(_AppDataPath, urlQbyS_p), 511, function (err) {
                                    if (err) {} else {
                                        _fs.copyFileSync(_paths.join(_AppDataPath, xlsxs), _paths.join(_AppDataPath, urlQbyS_p, xlsxs))
                                        _fs.mkdir(_paths.join(_AppDataPath, urlQbyS_p, 'models'), 511, function (err) {
                                            if (err) {} else {
                                                _fs.copyFileSync(_paths.join(_AppDataPath, 'models', 'extractor_model.json'), _paths.join(_AppDataPath, urlQbyS_p, 'models', 'extractor_model.json'))
                                                rootURL = _paths.join(nowFiles, urlQbyS_p)
                                                setTimeout(() => {
                                                    $("#haveFile").css('display', 'block')
                                                    $("#noFile").css('display', 'none')
                                                    openFileShow(_paths.join(_AppDataPath_urlQbyS_p, xlsxs), _paths.join(_AppDataPath_urlQbyS_p, _paths.join('models', 'extractor_model.json')))
                                                }, 300)
                                            }
                                        })
                                    }
                                })
                            }
                        })
                    }
                }
            }
        }
    }
    $("#btnOpenProjFolder").click(function () {
        _shell.openPath(AppDataFolders);
    })

    function openFileShow(xlsxPath, jsonPath) {
        wb = XLSX.readFile(xlsxPath, {
            type: 'binary',
            codepage: 936
        })
        _extModelsData = _fse.readJsonSync(jsonPath, {
            throws: false
        });
        let htmlStr = ''
        resetDataTable = _extModelsData.resetDataTable
        if (resetDataTable && resetDataTable[0]) {

        } else {
            resetDataTable = []
        }
        wb.SheetNames.forEach((sheetName) => {
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
                    if (resetDataTable && resetDataTable[0]) {
                        for (let j = 0; j < resetDataTable.length; j++) {
                            let item = resetDataTable[j]
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
                                            }else{
                                                wbLi.r = '<t>' + item.value + '</t>'
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
                }
            } catch (e) {
                console.log(e)
            }
        })
        $(".extractor_table").html(htmlStr)
        createCoordinate($(".extractor_table"));

        if (_extModelsData == null) {
            _extModelsData = {
                "varsion": "1.0",
                "templateID": _uuid(),
                "templateFileType": "EXCEL",
                "models": [],
                "chooseModel": ""
            };
        } else {
            loadExtractor();
        }
    }

    $("#btnCreateNewModel").on("click", function () {
        $("#ipt_model_name").val("").focus();
        _modalCreateNew.show();
    })

    $("#btnCreateNew").on("click", function () {
        _currentModels = {
            "modelID": _uuid(),
            "modelName": $("#ipt_model_name").val(),
            "modelType": $("#sel_model_type").val(),
        }
        _extModelsData["models"].push(_currentModels);
        saveExtModelsData();
        insertModal(_currentModels);
        checkAndRestPanelUI();
        $("#btnCreateNewModel").css('display', 'none')

        $(".f-model-list li:last-child>.list-group-item-title").trigger("click");
        _modalCreateNew.hide();
    })

    $(document.body).on("click", ".f-model-list li>.list-group-item-title", function () {
        if (_currentModel.modelID !== $(this).parent().attr("modelID")) {
            $(".f-model-list li.active").removeClass("active");
            chooseStandard = false
            chooseRecord = false
            $(this).parent().addClass("active");
            renderExtractorEffect($(this).parent().attr("modelID"));
            //如果是三维表，显示解析按钮
            if ($(this).parent().attr('modelType') === 'freelink' || $(this).parent().attr('modelType') === 'simplefreelink') {
                $('#parse').show()
            }
        }
    });
    let hhhf
    $(document.body).on("click", ".f-model-list li>.close-btn", function () {
        const modelID = $(this).parent().attr("modelID");
        const modelName = $(this).parent().find("span").text()
        hhhf = $(this)
        confirms('是否确认删除提取模型', modelName, modelID)
    });
    $(document).on('click', '.cancelConfirms', function () {
        $('.markBox').remove()
    })
    /**
     * 导入数据文件
     */
    $(document).on('click', '#btnDataMo', async function () {
        if (_currentModel && _currentModel.valuesEndCell && _currentModel.valuesEndCell[1]) {
            const EXTENSIONS = "xls|xlsx|csv".split("|");
            const files = await _remote.dialog.showOpenDialog({
                title: '选择一个文件',
                filters: [{
                    name: "Spreadsheets",
                    extensions: EXTENSIONS
                }],
                properties: ['openFile', 'treatPackageAsDirectory']
            });
            if (files.filePaths.length > 0) {
                let tbl = getCurrentModelTable();
                let startX = parseInt(_currentModel.startCell[0], 10) + parseInt(_currentModel.valuesStartCell[0], 10)
                let startY = parseInt(_currentModel.startCell[1], 10) + parseInt(_currentModel.valuesStartCell[1], 10)
                let endX = parseInt(_currentModel.startCell[0], 10) + parseInt(_currentModel.valuesEndCell[0], 10)
                let endY = parseInt(_currentModel.startCell[1], 10) + parseInt(_currentModel.valuesEndCell[1], 10)
                let newJ = []
                let startCell = $(tbl).find('td[x=' + startX + '][y=' + startY + ']')
                let endCell = $(tbl).find('td[x=' + endX + '][y=' + endY + ']')
                let ks = '',
                    kn = ''
                if (startCell && startCell[0]) {
                    ks = startCell[0].id.split('sjs-')[1][0]
                }
                if (endCell && endCell[0]) {
                    kn = endCell[0].id.split('sjs-')[1][0]
                }
                let j2 = false
                for (let j = 0; j < az.length; j++) {
                    if (az[j] == ks) {
                        j2 = true
                    }
                    if (j2) {
                        newJ.push(az[j])
                    }
                    if (az[j] == kn) {
                        break;
                    }
                }
                let wbs = XLSX.readFile(files.filePaths[0], {
                    type: 'binary',
                    codepage: 936
                })
                try {
                    if (wbs.Sheets[_currentModel.tableIndexName]['!ref']) {
                        let wbsNow = wbs.Sheets[_currentModel.tableIndexName]
                        // 清空文件内容（除表头外）
                        resetDataTable = []
                        tbl.find('._EM_value').each(function (i) {
                            let lis = {
                                id:  $(this).attr('id'),
                                tableindex:  $(this).attr('tableindex'),
                                value: '',
                                _val_uid:  $(this).attr('_val_uid'),
                                x:  $(this).attr('x'),
                                y:  $(this).attr('y'),
                            }
                            resetDataTable.push(lis)
                            let html = $(this).html()
                            let noHtml = '<div' + html.split('<div')[1]
                            $(this).html(noHtml)
                        })
                        for (let j in wbsNow) {
                            let j0 = j.substring(0, 1)
                            let j1 = j.split(j0)[1]
                            if (j1 && parseInt(j1) >= startY) {
                                if (j0 && newJ.includes(j0)) {
                                    let htt = "<div id='sjs-" + j + 'test' + _currentModel.tableIndex + "' class='leaders'></div>"
                                    $(tbl).find('#sjs-' + j).html(wbsNow[j].v + htt)
                                    let downAndUp = {}
                                    downAndUp = returnBoundFunc(wbsNow[j].v)
                                    let tdNow = $(tbl).find('#sjs-' + j)
                                    let isHave = false
                                    if (resetDataTable && resetDataTable[0]) {
                                        for (let jk = 0; jk < resetDataTable.length; jk++) {
                                            let kItem = resetDataTable[jk]
                                            if (kItem.id == tdNow.attr('id')) {
                                                isHave = true
                                                kItem.value = wbsNow[j].v
                                                if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                                    kItem.data_down = downAndUp.dataDown
                                                    kItem.data_up = downAndUp.dataUp
                                                    kItem.deviationUpper = downAndUp.deviationUpper
                                                    kItem.deviationLower = downAndUp.deviationLower
                                                    kItem.nominalValue = downAndUp.nominalValue
                                                }
                                                break
                                            }
                                        }
                                    }
                                    if (!isHave) {
                                        let lis = {
                                            id: tdNow.attr('id'),
                                            tableindex: tdNow.attr('tableindex'),
                                            value: wbsNow[j].v,
                                            _val_uid: tdNow.attr('_val_uid'),
                                            x: tdNow.attr('x'),
                                            y: tdNow.attr('y'),
                                        }
                                        if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                            lis.data_down = downAndUp.dataDown
                                            lis.data_up = downAndUp.dataUp
                                            lis.deviationUpper = downAndUp.deviationUpper
                                            lis.deviationLower = downAndUp.deviationLower
                                            lis.nominalValue = downAndUp.nominalValue
                                        }
                                        if (resetDataTable && resetDataTable[0]) {} else {
                                            resetDataTable = []
                                        }
                                        resetDataTable.push(lis)
                                    }
                                }
                            }
                        }
                        _extModelsData.resetDataTable = resetDataTable
                        saveCurrentModel();
                    } else {
                        alert('导入的数据没有sheet为' + _currentModel.tableIndexName + '的数据')
                    }
                } catch (e) {}
            }
        } else {
            alert('请您先创建完模版，选中模版在进行导入数据，该功能只支持表格型数据')
        }
    })

    $(document).on('click', '.okConfirms', function () {
        let modelID = $(this).attr('data-model')
        for (let i = 0; i < _extModelsData.models.length; i++) {
            if (_extModelsData.models[i]["modelID"] === modelID) {
                _extModelsData.models.splice(i, 1);
            }
        }
        saveExtModelsData();
        clearTableTagMarks();
        resetPanel();
        if (hhhf) {
            hhhf.parent("li").remove();
        }
        $("#btnCreateNewModel").css('display', 'inline-block')
        $('.markBox').remove()

    })

    let chooseModalID = ''
    $(document.body).on("click", ".f-model-list li>.edit-btn", function () {
        $('#modalCreateEdit').modal('show')
        chooseModalID = $(this).parent().attr("modelID");
        for (let i = 0; i < _extModelsData.models.length; i++) {
            if (_extModelsData.models[i]["modelID"] == chooseModalID) {
                $("#edit_model_name").val(_extModelsData.models[i].modelName)
            }
        }
    });

    $("#btnCreateEdit").on('click', () => {
        if ($("#edit_model_name").val()) {
            let modelName = $("#edit_model_name").val()
            for (let i = 0; i < _extModelsData.models.length; i++) {
                if (_extModelsData.models[i]["modelID"] == chooseModalID) {
                    _extModelsData.models[i].modelName = modelName
                    saveExtModelsData();
                    clearTableTagMarks();
                    resetPanel();
                    $("li[modelid=" + chooseModalID + "] .list-group-item-title").html(modelName)
                    $('#modalCreateEdit').modal('hide')
                    break
                }
            }
        } else {
            alert('模型名称必填')
        }
    })

    // 选择Radio被点击
    $("input[name='panelRadio'][type='radio']").on("click", function () {
        $(".p-clip .f-clear-tag").remove();
        const clearbtn = $('<button class="f-clear-tag float-right btn btn-xs iconfont">&#xe660;</button>');
        $(this).parent().append(clearbtn)
        clearbtn.on("click", function () {
            clearTagSelected();
            $(this).remove();
        });
        const panelRadioVal = $("input[name='panelRadio'][type='radio']:checked").val();
        if (panelRadioVal == 'valueRangeStart0') {
            chooseStandard = true
        } else if (panelRadioVal == 'link2') {
            chooseStandard = true
        } else {
            chooseStandard = false
        }
        if (panelRadioVal == 'valueRangeStart1') {
            chooseRecord = true
        } else {
            chooseRecord = false
        }
        $(".attributeShow").css('display','none')
        if (panelRadioVal == 'chooseAttribute') {
            $(".attributeShow").css('display','block')
        }
    });
    //解析按钮点击
    $('#parse_table').on('click', function () {
        saveTable()
        setTimeout(() => {
            let urls = 'templateParse.html?url=' + rootURL + '&_currentModelModelId=' + _currentModel.modelID + '&fileName=' + filenameNow
            if (arrObject.technicsNumber) {
                urls += '&technicsNumber=' + arrObject.technicsNumber
            }
            if (arrObject.stepNum) {
                urls += '&stepNum=' + arrObject.stepNum
            }
            if (arrObject.paceNum) {
                urls += '&paceNum=' + arrObject.paceNum
            }
            if (arrObject.type) {
                urls += '&type=' + arrObject.type
            }
            if (arrObject.templateOid) {
                urls += '&templateOid=' + arrObject.templateOid
            }
            window.location.href = urls
        }, 200)
    })

    function zipqbyFunc(name, callback) {
        let zip = new AdmZipD();
        zip.addLocalFolder(name)
        zip.toBuffer();
        let archivePath = _path.join(name + ".zip");
        zip.writeZip(archivePath);
        if (typeof callback === "function") {
            callback(archivePath);
        }
    }
    //解析普通表格
    $('#parse_common_table').on('click', function () {
        saveTable()
        setTimeout(() => {
            let urls = 'templateParseTable.html?url=' + rootURL + '&_currentModelModelId=' + _currentModel.modelID + '&fileName=' + filenameNow
            if (arrObject.technicsNumber) {
                urls += '&technicsNumber=' + arrObject.technicsNumber
            }
            if (arrObject.stepNum) {
                urls += '&stepNum=' + arrObject.stepNum
            }
            if (arrObject.paceNum) {
                urls += '&paceNum=' + arrObject.paceNum
            }
            if (arrObject.type) {
                urls += '&type=' + arrObject.type
            }
            if (arrObject.templateOid) {
                urls += '&templateOid=' + arrObject.templateOid
            }
            window.location.href = urls
        }, 200)
    })
    //阻止浏览器默认右键点击事件
    $(".extractor_table").bind("contextmenu", function () {
        return false;
    })
    $(".extractor_table")[0].addEventListener('scroll', AnimEvent.add(function () {
        for (let i = 0; i < _LINES.length; i++) {
            _LINES[i].position();
        }
    }), false);
    $(".extractor_table").on("mouseover", "table td:not(.headline)", function (e) {
        let tbl = $(this).parents("table");
        tbl.find("td.headline-light").removeClass("headline-light");
        tbl.find("td.headline[X='" + $(this).attr("X") + "']").addClass("headline-light");
        tbl.find("td.headline[Y='" + $(this).attr("Y") + "']").addClass("headline-light");
    });
    /**
     * 点击共享生成图片
     */
    $("#btnArchive").on("click", function () {
        if (_currentModel.modelID) {
            if (_currentModel.modelType == 'table') {
                // 删除所有图片
                _fs.readdir(dataUrlImagePath, function (err, files) {
                    for (let k of files) {
                        if (k && (k.indexOf('.jpg')!=-1 || k.indexOf('.png'))!=-1) {
                            _fs.unlink(_paths.join(dataUrlImagePath, k), function (err) {
                                if (err) {}
                            });
                        }
                    }
                })

                if ((_currentModel.valuesEndCell[1] - _currentModel.valuesStartCell[1] + _currentModel.startCell[1] + 2) > 20) {
                    let counts = Math.ceil((_currentModel.valuesEndCell[1] - _currentModel.valuesStartCell[1] + _currentModel.startCell[1] + 2) / 20)
                    let tables = $('table[tableindex='+_currentModel.tableIndex+']')
                    for (let k = 0; k < counts; k++) {
                        let nk = 0
                        let htmls = '<div id="tblHtml" class="fy-flex-col"> <div class="extractor_table"><table id="tttffd' + k + '"><tbody>'
                        $(tables).find('tr').each(function (i) {
                            if (i != 0) {
                                if (k == 0) {
                                    if ($(this).find('td').hasClass('_EM_start')) {
                                        let thss = $(this).find('td._EM_start')
                                        if ($(thss).hasClass('_EM_key')) {} else {
                                            nk++
                                            htmls += '<tr>'
                                            let $outer = $('<div>')
                                            $outer.append($(thss).clone())
                                            htmls += $outer.html()
                                            htmls += '</tr>'
                                        }
                                    }
                                }

                                if ($(this).find('td').hasClass('_EM_key') || $(this).find('td').hasClass('_EM_value')) {
                                    nk++
                                    let minV = k * 20
                                    let maxV = (k + 1) * 20
                                    if(_currentModel.valuesStartCell[1] == 1){
                                        minV = minV -1
                                    }else{
                                        if(k<1){
                                            maxV = maxV+1
                                            minV = minV -1
                                        }else{
                                            minV = minV -1
                                            // maxV = maxV+1
                                        }
                                    }



                                    if (nk < maxV && nk > minV) {
                                        let tdN = $(this).find('td')
                                        let id0 = ''
                                        let id1 = ''
                                        let tds = []
                                        for (let j = 0; j < tdN.length; j++) {
                                            if ($(tdN[j]).hasClass('_EM_key')) {
                                                if (!id0) {
                                                    id0 = $(tdN[j]).attr('id')
                                                }
                                                id1 = $(tdN[j]).attr('id')
                                            }
                                            if ($(tdN[j]).hasClass('_EM_value')) {
                                                if (!id0) {
                                                    id0 = $(tdN[j]).attr('id')
                                                }
                                                id1 = $(tdN[j]).attr('id')
                                            }
                                        }
                                        let jk = false
                                        for (let j = 0; j < tdN.length; j++) {
                                            if ($(tdN[j]).attr('id') == id0) {
                                                jk = true
                                            }
                                            if (jk) {
                                                tds.push(tdN[j])
                                            }
                                            if ($(tdN[j]).attr('id') == id1) {
                                                jk = false
                                                break
                                            }
                                        }
                                        if (tds && tds[0]) {
                                            htmls += '<tr>'
                                            for (let k = 0; k < tds.length; k++) {
                                                let $outer = $('<div>')
                                                $outer.append($(tds[k]).clone())
                                                htmls += $outer.html()
                                            }
                                            htmls += '</tr>'
                                        }
                                    }
                                }
                            }
                        })
                        htmls += '</tbody></table></div></div>'
                        let tttd = document.createElement('div')
                        tttd.style.position = 'absolute'
                        tttd.style.zIndex = '-1'
                        tttd.id = 'tttt' + k
                        $('body').append(tttd)
                        $(tttd).append(htmls)
                        html2canvas($('#tttffd' + k)[0], {
                            useCORS: true, // 【重要】开启跨域配置
                            scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2,
                            allowTaint: true, // 允许跨域图片
                        }).then((canvas) => {
                            const imgData = canvas.toDataURL('image/jpg', 0.5);
                            const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                            const dataBuffer = new Buffer(base64Data, 'base64');
                            const dataurl = _paths.join(dataUrlImagePath, 'image' + (k + 1) + '.jpg')
                            _fs.writeFile(dataurl, dataBuffer, function (err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    $('#tttt' + k).remove()
                                    if (counts == k + 1) {
                                        parseShare()
                                    }
                                }
                            })
                        })
                    }
                } else {
                    let tables = $('table[tableindex='+_currentModel.tableIndex+']')
                    let htmls = '<div id="tblHtml" class="fy-flex-col"> <div class="extractor_table"><table id="tttffd"><tbody>'
                    $(tables).find('tr').each(function (i) {
                        if (i != 0) {
                            if ($(this).find('td').hasClass('_EM_start')) {
                                let thss = $(this).find('td._EM_start')
                                if ($(thss).hasClass('_EM_key')) {} else {
                                    htmls += '<tr>'
                                    let $outer = $('<div>')
                                    $outer.append($(thss).clone())
                                    htmls += $outer.html()
                                    htmls += '</tr>'
                                }
                            }
                            if ($(this).find('td').hasClass('_EM_key') || $(this).find('td').hasClass('_EM_value')) {
                                let tdN = $(this).find('td')
                                let id0 = ''
                                let id1 = ''
                                let tds = []
                                for (let j = 0; j < tdN.length; j++) {
                                    if ($(tdN[j]).hasClass('_EM_key')) {
                                        if (!id0) {
                                            id0 = $(tdN[j]).attr('id')
                                        }
                                        id1 = $(tdN[j]).attr('id')
                                    }
                                    if ($(tdN[j]).hasClass('_EM_value')) {
                                        if (!id0) {
                                            id0 = $(tdN[j]).attr('id')
                                        }
                                        id1 = $(tdN[j]).attr('id')
                                    }
                                }
                                let jk = false
                                for (let j = 0; j < tdN.length; j++) {
                                    if ($(tdN[j]).attr('id') == id0) {
                                        jk = true
                                    }
                                    if (jk) {
                                        tds.push(tdN[j])
                                    }
                                    if ($(tdN[j]).attr('id') == id1) {
                                        jk = false
                                        break
                                    }
                                }
                                if (tds && tds[0]) {
                                    htmls += '<tr>'
                                    for (let k = 0; k < tds.length; k++) {
                                        let $outer = $('<div>')
                                        $outer.append($(tds[k]).clone())
                                        htmls += $outer.html()
                                    }
                                    htmls += '</tr>'
                                }
                            }
                        }
                    })
                    htmls += '</tbody></table></div></div>'
                    let tttd = document.createElement('div')
                    tttd.style.position = 'absolute'
                    tttd.style.zIndex = '-1'
                    tttd.id = 'tttt'
                    $('body').append(tttd)
                    $(tttt).append(htmls)
                    html2canvas($('#tttffd')[0], {
                        useCORS: true, // 【重要】开启跨域配置
                        scale: window.devicePixelRatio < 3 ? window.devicePixelRatio : 2,
                        allowTaint: true, // 允许跨域图片
                    }).then((canvas) => {
                        const imgData = canvas.toDataURL('image/jpg', 0.5);
                        const base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
                        const dataBuffer = new Buffer(base64Data, 'base64');
                        const dataurl = _paths.join(dataUrlImagePath, 'image1.jpg')
                        _fs.writeFile(dataurl, dataBuffer, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                $('#tttt').remove()
                                parseShare()
                            }
                        })
                    })
                }
            } else {
                parseShare()
            }
        } else {
            alert('请先选择模型')
        }
    });

    /**
     * 解压并共享功能
     */
    function parseShare() {
        _extModelsData.chooseModel = _currentModel.modelID
        saveCurrentModel();
        if (_currentModel.modelType == 'table') {
            const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
            if (tableIndex < 1) return
            const sheetName = wb.SheetNames[tableIndex - 1]
            const ws = wb.Sheets[sheetName]
            if (resetDataTable && resetDataTable[0]) {
                resetDataTable.filter((item) => {
                    if (item.id) {
                        let idS = item.id.split('-')[1]
                        if (ws[idS]) {
                            ws[idS].w = item.value
                            ws[idS].v = item.value
                        }
                    }

                })
            }
            if (!('!ref' in ws)) return
            let dataddd = extractTable(_currentModel, ws)

            newKeys.filter(item => {
                if (item.nameS) {
                    item.name = formatStr(item.name)
                    dataddd.filter(val => {
                        for (let k in val) {
                            if (formatStr(k) == formatStr(item.name)) {
                                if (val[formatStr(item.name)]) {
                                    val[formatStr(item.name)] = val[formatStr(item.name)].toString()
                                    let dataBound = returnBoundFunc(val[formatStr(item.name)])
                                    val[formatStr(item.name) + '_上限'] = dataBound.dataUp
                                    val[formatStr(item.name) + '_下限'] = dataBound.dataDown
                                    val[formatStr(item.name) + '_上偏差'] = dataBound.deviationUpper
                                    val[formatStr(item.name) + '_下偏差'] = dataBound.deviationLower
                                    val[formatStr(item.name) + '_公称值'] = dataBound.nominalValue
                                } else {
                                    val[formatStr(item.name) + '_上限'] = ''
                                    val[formatStr(item.name) + '_下限'] = ''
                                    val[formatStr(item.name) + '_上偏差'] = ''
                                    val[formatStr(item.name) + '_下偏差'] = ''
                                    val[formatStr(item.name) + '_公称值'] = ''
                                }
                                val[formatStr(item.name) + '_规定值'] = val[formatStr(item.name)]
                                val[k + "_值"] = ''
                            }
                        }
                    })
                }
                if (item.nameSD){
                    item.name = formatStr(item.name)
                    dataddd.filter(val => {
                        for (let k in val) {
                            if (formatStr(k) == formatStr(item.name)) {
                                val[k + "_值"] = val[formatStr(item.name)]
                                // delete val[k]
                            }
                        }
                    })

                }
            })
            let dataSou = {
                graphData: {
                    nodes: [],
                    links: []
                },
                tableData: dataddd
            }
            let newKeyNoSI = []
            let newKeySI = []
            newKeyNoSI = newKeys.filter(item => !item.nameSD && !item.nameS)
            newKeySI = newKeys.filter(item => item.nameSD || item.nameS)
            let newDataddd = []
            dataddd.filter((item, index) => {
                let iKey = ''
                newKeyNoSI.filter(key => {
                    if (iKey) {
                        iKey += "_" + formatStr(key.name) + "_" + item[formatStr(key.name)]
                    } else {
                        iKey += formatStr(key.name) + "_" + item[formatStr(key.name)]
                    }
                })
                let key1 = iKey
                newKeySI.filter((key, keyIndex) => {
                    iKey = key1
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
                    item[formatStr(key.name) + '_唯一编码'] = keyCode
                    if (key.nameS) {
                        lis['值'] = ''
                        if(item[formatStr(key.name) + '_指标类型']){
                            lis[formatStr(key.name) + '_指标类型'] = item[formatStr(key.name) + '_指标类型']
                        }
                        if(item[formatStr(key.name) + '_试验类型']){
                            lis[formatStr(key.name) + '_试验类型'] = item[formatStr(key.name) + '_试验类型']
                        }
                        lis[formatStr(key.name) + '_下限'] = item[formatStr(key.name) + '_下限']
                        lis[formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                        lis[formatStr(key.name) + '_上限'] = item[formatStr(key.name) + '_上限']
                        lis[formatStr(key.name) + '_上偏差'] = item[formatStr(key.name) + '_上偏差']
                        lis[formatStr(key.name) + '_下偏差'] = item[formatStr(key.name) + '_下偏差']
                        lis[formatStr(key.name) + '_公称值'] = item[formatStr(key.name) + '_公称值']
                        lis[formatStr(key.name)] = item[formatStr(key.name)]
                    } else {
                        lis['值'] = item[formatStr(key.name)]
                        delete item[formatStr(key.name)]
                    }
                    newDataddd.push(lis)
                })
            })

            let ttData = {
                data1: dataddd,
                data2: newDataddd
            }
            setTimeout(() => {
                _fs.writeFileSync(_paths.join(AppDataFolders, 'tableData.json'), JSON.stringify(ttData))
                _fs.accessSync(_paths.join(AppDataFolders, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                _fs.writeFileSync(_paths.join(AppDataFolders, 'GraphData.json'), JSON.stringify(dataSou))
                _fs.accessSync(_paths.join(AppDataFolders, 'GraphData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
                zipqbyFunc(qbyObjectPath, function (path) {
                    if (window.LS.get('webservicePathSchema')) {
                        sendAjaxWSSchema(AppDataFolders, qbyObjectPath, arrObject, _currentModel)
                    } else {
                        alert('请先设置webservice服务地址')
                    }
                });
            }, 100)
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
                    lis['值'] = ''
                    lis['规定值'] = jSONLast
                    jSONLast = jSONLast.toString()
                    let dataBound = returnBoundFunc(jSONLast)
                    lis['规定值_上限'] = dataBound.dataUp
                    lis['规定值_下限'] = dataBound.dataDown
                    lis['上偏差'] = dataBound.deviationUpper
                    lis['下偏差'] = dataBound.deviationLower
                    lis['公称值'] = dataBound.nominalValue
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
            _fs.writeFileSync(_paths.join(AppDataFolders, 'tableData.json'), JSON.stringify(ttData))
            _fs.accessSync(_paths.join(AppDataFolders, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
            _fs.writeFileSync(_paths.join(AppDataFolders, 'GraphData.json'), JSON.stringify(GraphData))
            _fs.accessSync(_paths.join(AppDataFolders, 'GraphData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
            zipqbyFunc(qbyObjectPath, function (path) {
                if (window.LS.get('webservicePathSchema')) {
                    sendAjaxWSSchema(AppDataFolders, qbyObjectPath, arrObject, _currentModel)
                } else {
                    alert('请先设置webservice服务地址')
                }
            });
        }
    }

    /**
     * 保存tableData
     */
    function saveTable() {
        if (_currentModel.modelType == 'table') {
            const tableIndex = parseInt(_.get(_currentModel, 'tableIndex', 0))
            if (tableIndex < 1) return
            const sheetName = wb.SheetNames[tableIndex - 1]
            const ws = wb.Sheets[sheetName]
            if (resetDataTable && resetDataTable[0]) {
                resetDataTable.filter((item) => {
                    if (item.id) {
                        let idS = item.id.split('-')[1]
                        if (ws[idS]) {
                            ws[idS].w = item.value
                            ws[idS].v = item.value
                        }
                    }
                })
            }
            if (!('!ref' in ws)) return
            let dataddd = extractTable(_currentModel, ws)

            newKeys.filter(item => {
                if (item.nameS) {
                    item.name = formatStr(item.name)
                    dataddd.filter(val => {
                        for (let k in val) {
                            if (formatStr(k) == formatStr(item.name)) {
                                if (val[formatStr(item.name)]) {
                                    val[formatStr(item.name)] = val[formatStr(item.name)].toString()
                                    let dataBound = returnBoundFunc(val[formatStr(item.name)])
                                    val[formatStr(item.name) + '_上限'] = dataBound.dataUp
                                    val[formatStr(item.name) + '_下限'] = dataBound.dataDown
                                    val[formatStr(item.name) + '_上偏差'] = dataBound.deviationUpper
                                    val[formatStr(item.name) + '_下偏差'] = dataBound.deviationLower
                                    val[formatStr(item.name) + '_公称值'] = dataBound.nominalValue
                                } else {
                                    val[formatStr(item.name) + '_上限'] = ''
                                    val[formatStr(item.name) + '_下限'] = ''
                                    val[formatStr(item.name) + '_上偏差'] = ''
                                    val[formatStr(item.name) + '_下偏差'] = ''
                                    val[formatStr(item.name) + '_公称值'] = ''
                                }
                                val[formatStr(item.name) + '_规定值'] = val[formatStr(item.name)]
                                val[k + "_值"] = ''
                            }
                        }
                    })
                }
            })
            let newKeyNoSI = []
            let newKeySI = []
            newKeyNoSI = newKeys.filter(item => !item.nameSD && !item.nameS)
            newKeySI = newKeys.filter(item => item.nameSD || item.nameS)
            let newDataddd = []
            dataddd.filter((item, index) => {
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
                    if (key.nameS) {
                        lis['值'] = ''
                        if(item[formatStr(key.name) + '_指标类型']){
                            lis[formatStr(key.name) + '_指标类型'] = item[formatStr(key.name) + '_指标类型']
                        }
                        if(item[formatStr(key.name) + '_试验类型']){
                            lis[formatStr(key.name) + '_试验类型'] = item[formatStr(key.name) + '_试验类型']
                        }
                        lis[formatStr(key.name) + '_下限'] = item[formatStr(key.name) + '_下限']
                        lis[formatStr(key.name) + '_上限'] = item[formatStr(key.name) + '_上限']
                        lis[formatStr(key.name) + '_上偏差'] = item[formatStr(key.name) + '_上偏差']
                        lis[formatStr(key.name) + '_下偏差'] = item[formatStr(key.name) + '_下偏差']
                        lis[formatStr(key.name) + '_公称值'] = item[formatStr(key.name) + '_公称值']
                        lis[formatStr(key.name) + '_规定值'] = item[formatStr(key.name)]
                        lis[formatStr(key.name)] = item[formatStr(key.name)]
                    } else {
                        lis['值'] = item[formatStr(key.name)]
                    }
                    newDataddd.push(lis)
                })
            })
            let ttData = {
                data1: dataddd,
                data2: newDataddd
            }
            setTimeout(() => {
                _fs.writeFileSync(_paths.join(AppDataFolders, 'tableData.json'), JSON.stringify(ttData))
                _fs.accessSync(_paths.join(AppDataFolders, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
            }, 100)
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
                    lis['值'] = ''
                    lis['规定值'] = jSONLast
                    jSONLast = jSONLast.toString()
                    let dataBound = returnBoundFunc(jSONLast)
                    lis['规定值_上限'] = dataBound.dataUp
                    lis['规定值_下限'] = dataBound.dataDown
                    lis['上偏差'] = dataBound.deviationUpper
                    lis['下偏差'] = dataBound.deviationLower
                    lis['公称值'] = dataBound.nominalValue
                } else {
                    lis['值'] = jSONLast
                }
                lis.字段 = formatStr(lis.字段)
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
            _fs.writeFileSync(_paths.join(AppDataFolders, 'tableData.json'), JSON.stringify(ttData))
            _fs.accessSync(_paths.join(AppDataFolders, 'tableData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
            _fs.writeFileSync(_paths.join(AppDataFolders, 'GraphData.json'), JSON.stringify(GraphData))
            _fs.accessSync(_paths.join(AppDataFolders, 'GraphData.json'), _fs.constants.R_OK | _fs.constants.W_OK)
            zipqbyFunc(qbyObjectPath, function (path) {});
        }
    }
    //****************表格被点击*******  */
    _freelinkLR = [];
    $(".extractor_table").on("mousedown", "td", function (e) {
        if ($(this).hasClass("headline")) return;
        $(".extractor_table").find("td.active").removeClass("active");
        $(this).addClass("active");
        let tbl = $(this).parents("table");
        const panelRadioVal = $("input[name='panelRadio'][type='radio']:checked").val();
        if (panelRadioVal) {
            // 起始点
            if (panelRadioVal === "start") {
                if (3 == e.which) {
                    $(this).removeClass("_EM_start");
                    delete _currentModel["startCell"];
                    startX = 0, startY = 0;
                } else if (1 == e.which) {
                    $(".extractor_table td._EM_start").removeClass("_EM_start");
                    $(this).addClass("_EM_start");
                    _currentModel["startCell"] = [parseInt($(this).attr("X")), parseInt($(this).attr("Y"))];
                    _currentModel["tableIndex"] = $(this).parents("table").attr("tableIndex");
                    _currentModel["tableIndexName"] = $(this).parents(".extractor_table").find('.sheetName').html();
                    startX = parseInt($(this).attr("X"));
                    startY = parseInt($(this).attr("Y"));
                }
                saveCurrentModel();
                checkStartSettedAndThen();
            }
            /**
             * 标记key
             * */
            console.log(panelRadioVal)
            console.log(chooseStandard)
            if (panelRadioVal === "key" || panelRadioVal === 'link2' || panelRadioVal === 'valueRangeStart0' || panelRadioVal === 'valueRangeStart1') {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (!_currentModel.hasOwnProperty("keys")) {
                    _currentModel["keys"] = []
                }
                if (3 == e.which) { //右键为3
                    if (chooseStandard) {
                        const uid = $(this).attr("_key_uid");
                        if ($(this).hasClass("_EM_key_standard")) {
                            $(this).removeClass("_EM_key_standard");
                            $(this).removeClass("_EM_key_standard1");
                            $.each(_currentModel["keys"], function (index, item) {
                                if (item._id == uid) {
                                    delete item.nameS
                                }
                            })
                        }
                    } else if (chooseRecord) {
                        const uid = $(this).attr("_key_uid");
                        if ($(this).hasClass("_EM_key_standard1")) {
                            $(this).removeClass("_EM_key_standard1");
                            $(this).removeClass("_EM_key_standard");
                            $.each(_currentModel["keys"], function (index, item) {
                                if (item._id == uid) {
                                    delete item.nameSD
                                }
                            })
                        }
                    } else {
                        if ($(this).hasClass("_EM_key")) {
                            $(this).removeClass("_EM_key");
                            if ($(this).hasClass("_EM_key_standard")) {
                                $(this).removeClass("_EM_key_standard");
                                $(this).removeClass("_EM_key_standard1");
                            }
                            const uid = $(this).attr("_key_uid");
                            _currentModel["keys"].splice(getKeyIndexFromCurrentModel(uid), 1);
                        }
                    }

                    renderValuesRange(tbl, _currentModel);
                } else if (1 == e.which) { //左键为1
                    let keyType = "Vchar";
                    if (chooseStandard) {
                        console.log(33333)
                        // if (!$(this).hasClass("_EM_key_standard")) {
                        //     $(this).removeClass("_EM_key_standard1");

                            if ($(this).hasClass("_EM_key")) {
                                const uid = $(this).attr("_key_uid");
                                setTimeout(()=>{ $(this).addClass("_EM_key_standard").attr("_key_uid", uid);},10)
                                $.each(_currentModel["keys"], function (index, item) {
                                    if (item._id == uid) {
                                        item.nameS = 'standard'
                                        delete item.nameSD
                                    }
                                })
                            } else {
                                const uid = _uuid();
                                setTimeout(()=>{
                                    $(this).addClass("_EM_key_standard").attr("_key_uid", uid);
                                    $(this).addClass("_EM_key").attr("_key_uid", uid);
                                },10)

                                let model = {
                                    _id: uid,
                                    position: rxy,
                                    type: keyType,
                                    nameS: 'standard',
                                    name: $(this).text()
                                };
                                if ($(this).attr("colspan")) {
                                    if (parseInt($(this).attr("colspan")) > 1) {
                                        model.colspan = parseInt($(this).attr("colspan"))
                                    }
                                }
                                if ($(this).attr("rowspan")) {
                                    if (parseInt($(this).attr("rowspan")) > 1) {
                                        model.rowspan = parseInt($(this).attr("rowspan"))
                                    }
                                }
                                _currentModel["keys"].push(model);
                            }
                        // }
                    } else if (chooseRecord) {
                        if (!$(this).hasClass("_EM_key_standard1")) {
                            $(this).removeClass("_EM_key_standard");
                            if ($(this).hasClass("_EM_key")) {
                                const uid = $(this).attr("_key_uid");
                                setTimeout(()=>{
                                    $(this).addClass("_EM_key_standard1").attr("_key_uid", uid);
                                },10)
                                $.each(_currentModel["keys"], function (index, item) {
                                    if (item._id == uid) {
                                        item.nameSD = 'recordItem'
                                        delete item.nameS
                                    }
                                })
                            } else {
                                const uid = _uuid();
                                setTimeout(()=>{
                                    $(this).addClass("_EM_key_standard1").attr("_key_uid", uid);
                                    $(this).addClass("_EM_key").attr("_key_uid", uid);
                                },10)
                                let model = {
                                    _id: uid,
                                    position: rxy,
                                    type: keyType,
                                    nameSD: 'recordItem',
                                    name: $(this).text()
                                };
                                if ($(this).attr("colspan")) {
                                    if (parseInt($(this).attr("colspan")) > 1) {
                                        model.colspan = parseInt($(this).attr("colspan"))
                                    }
                                }
                                if ($(this).attr("rowspan")) {
                                    if (parseInt($(this).attr("rowspan")) > 1) {
                                        model.rowspan = parseInt($(this).attr("rowspan"))
                                    }
                                }
                                _currentModel["keys"].push(model);
                            }
                        }
                    } else {
                        if (!$(this).hasClass("_EM_key")) {
                            const uid = _uuid();
                            setTimeout(()=>{
                                $(this).addClass("_EM_key").attr("_key_uid", uid);
                            },10)
                            let model = {
                                _id: uid,
                                position: rxy,
                                type: keyType,
                                name: $(this).text()
                            };
                            if ($(this).attr("colspan")) {
                                if (parseInt($(this).attr("colspan")) > 1) {
                                    model.colspan = parseInt($(this).attr("colspan"))
                                }
                            }
                            if ($(this).attr("rowspan")) {
                                if (parseInt($(this).attr("rowspan")) > 1) {
                                    model.rowspan = parseInt($(this).attr("rowspan"))
                                }
                            }
                            _currentModel["keys"].push(model);
                        }
                    }
                    renderValuesRange(tbl, _currentModel);
                }
                calRelationWithKeys(_currentModel)
                saveCurrentModel();
            } else {}
            if (panelRadioVal === "value") {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (!_currentModel.hasOwnProperty("values")) {
                    _currentModel["values"] = []
                }
                if (3 == e.which) {
                    if ($(this).hasClass("_EM_value")) {
                        $(this).removeClass("_EM_value");
                        const uid = $(this).attr("_val_uid");
                        _currentModel["values"].filter((item, index) => {
                            if (item._id == uid) {
                                _currentModel["values"].splice(index, 1)
                            }
                        })
                    }
                } else if (1 == e.which) {
                    if (!$(this).hasClass("_EM_value")) {
                        const uid = _uuid();
                        $(this).addClass("_EM_value").attr("_val_uid", uid);
                        _currentModel["values"].push({
                            _id: uid,
                            position: rxy
                        });
                    }
                }
                saveCurrentModel();
            }
            if (panelRadioVal === "valueRangeStart") {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (3 == e.which) {
                    $(this).removeClass("_EM_value_start");
                    delete _currentModel["valuesStartCell"];
                } else if (1 == e.which) {
                    $(".extractor_table td._EM_value_start").removeClass("_EM_value_start");
                    $(this).addClass("_EM_value_start");
                    _currentModel["valuesStartCell"] = rxy;
                }
                saveCurrentModel();
                renderValuesRange(tbl, _currentModel);
            }
            if (panelRadioVal === "valueRangeEnd") {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (3 == e.which) {
                    $(this).removeClass("_EM_value_end");
                    delete _currentModel["valuesEndCell"];
                } else if (1 == e.which) {
                    $(".extractor_table td._EM_value_end").removeClass("_EM_value_end");
                    $(this).addClass("_EM_value_end");
                    _currentModel["valuesEndCell"] = rxy;
                }
                saveCurrentModel();
                renderValuesRange(tbl, _currentModel);
            }
            if (panelRadioVal === "link") {
                function unique(arr) {
                    isNoUnique = false
                    for (let m = 0; m < arr.length; m++) {
                        let cooo = 0
                        for (let m1 = 0; m1 < arr.length; m1++) {
                            if (arr[m1][0] == arr[m][0]) {
                                cooo++
                            }
                        }
                        if (cooo > 1) {
                            isNoUnique = true
                            arr.splice(m, 1)
                            m--
                        }
                    }
                    return {
                        arr: arr,
                        isNoUnique: isNoUnique
                    }
                }
                if (3 == e.which) {
                    _freelinkLR = [];
                } else if (1 == e.which) {
                    let isNoUnique = false
                    _freelinkLR.push($(this));
                    if (_freelinkLR.length > 1) {
                        _freelinkLR = unique(_freelinkLR).arr
                        isNoUnique = unique(_freelinkLR).isNoUnique
                    }
                    if (_freelinkLR.length >= 2) {
                        if (isNoUnique) {} else {
                            for (let n = 0; n < _freelinkLR.length; n++) {
                                if (_freelinkLR[n + 1]) {
                                    demoFreeLinkLR(_freelinkLR[n], _freelinkLR[n + 1])
                                }
                            }
                        }
                        if (_currentModel.modelType == 'simplefreelink') {
                            _freelinkLR = []
                        } else {

                        }
                    }
                }
            }
            if (panelRadioVal === "link2") {
                let isReset = true
                let isHave = false
                for (let k = 0; k < _LINES.length; k++) {
                    if (_LINES[k].end.id.split('test')[0] == $(this).attr('id')) {
                        isHave = true
                    }
                    if (_LINES[k].end.id.split('test')[0] == $(this).attr('id')) {
                        for (let k1 = 0; k1 < _LINES.length; k1++) {
                            if (_LINES[k1].start.id.split('test')[0] == $(this).attr('id')) {
                                isReset = false
                            }
                        }
                    }
                }
                if (isReset && isHave) {
                    _currentModel.values.filter(item => {
                        if (item._id == $(this).attr('_val_uid')) {
                            item.nameS = 'standard'
                        }
                    })
                    _currentModel.keys.filter(item => {
                        if (item._id == $(this).attr('_val_uid')) {
                            item.nameS = 'standard'
                        }
                    })
                    _currentModel.keysRelation.filter(item => {
                        if (item._id == $(this).attr('_val_uid')) {
                            item.nameS = 'standard'
                        }
                    })
                    if ($(this).hasClass("_EM_key_standard")) {} else {
                        $(this).addClass('_EM_key_standard')
                    }
                    saveCurrentModel();
                } else {
                    $("#alertBox").fadeIn()
                    setTimeout(() => {
                        $("#alertBox").fadeOut()
                    }, 1000)
                }
            }
            if (panelRadioVal === "link1") {
                _freelinkLR = [];
            }
            if (panelRadioVal == "unlink") {
                if ($(this).hasClass("_EM_value")) {
                    let keyAll = _currentModel["keys"]
                    for (let k = 0; k < keyAll.length; k++) {
                        for (let k1 = k + 1; k1 < keyAll.length; k1++) {
                            if (keyAll[k].position[0] == keyAll[k1].position[0] && keyAll[k].position[1] == keyAll[k1].position[1]) {
                                keyAll.splice(k, 1)
                                k--
                                break;
                            }
                        }
                    }
                    let keysRelationAll = _currentModel["keysRelation"]
                    let valuesAll = _currentModel["values"]
                    for (let k = 0; k < valuesAll.length; k++) {
                        for (let k1 = k + 1; k1 < valuesAll.length; k1++) {
                            if (valuesAll[k].position[0] == valuesAll[k1].position[0] && valuesAll[k].position[1] == valuesAll[k1].position[1]) {
                                valuesAll.splice(k, 1)
                                k--
                                break;
                            }
                        }
                    }
                    let newId = $(this).attr('id') + 'test' + $(this).attr('tableindex')
                    let demo = (newIdN) => {
                        for (let k = 0; k < _LINES.length; k++) {
                            if ($(_LINES[k].start).attr('id') == newIdN) {
                                let nnId = $(_LINES[k].start).attr('id').split('test')[0]
                                let uid = $("#" + nnId).attr("_key_uid");
                                let uid2 = $("#" + nnId).attr("_val_uid");
                                $("#" + nnId).removeClass('_EM_value')
                                $("#" + nnId).removeClass('_EM_key')
                                if (uid) {
                                    keyAll = keyAll.filter(item => item._id != uid)
                                    keyAll = keyAll.filter(item => item.targetId != uid)
                                    keysRelationAll = keysRelationAll.filter(item => item._id != uid)
                                    keysRelationAll = keysRelationAll.filter(item => item.pid != uid)
                                    valuesAll = valuesAll.filter(item => item._id != uid)
                                }
                                if (uid2) {
                                    keyAll = keyAll.filter(item => item._id != uid2)
                                    keyAll = keyAll.filter(item => item.targetId != uid2)
                                    keysRelationAll = keysRelationAll.filter(item => item._id != uid2)
                                    keysRelationAll = keysRelationAll.filter(item => item.pid != uid2)
                                    valuesAll = valuesAll.filter(item => item._id != uid2)
                                }
                                let nnId_ = $(_LINES[k].end).attr('id').split('test')[0]
                                let uid_ = $("#" + nnId_).attr("_key_uid");
                                let uid2_ = $("#" + nnId_).attr("_val_uid");
                                $("#" + nnId_).removeClass('_EM_value')
                                $("#" + nnId_).removeClass('_EM_key')
                                if (uid_) {
                                    keyAll = keyAll.filter(item => item._id != uid_)
                                    keyAll = keyAll.filter(item => item.targetId != uid_)
                                    keysRelationAll = keysRelationAll.filter(item => item._id != uid_)
                                    keysRelationAll = keysRelationAll.filter(item => item.pid != uid_)
                                    valuesAll = valuesAll.filter(item => item._id != uid_)
                                }
                                if (uid2_) {
                                    keyAll = keyAll.filter(item => item._id != uid2_)
                                    keyAll = keyAll.filter(item => item.targetId != uid2_)
                                    keysRelationAll = keysRelationAll.filter(item => item._id != uid2_)
                                    keysRelationAll = keysRelationAll.filter(item => item.pid != uid2_)
                                    valuesAll = valuesAll.filter(item => item._id != uid2_)
                                }
                                demo($(_LINES[k].end).attr('id'))
                                _LINES[k].remove();
                                _LINES.splice(k, 1);
                                k--
                            }
                        }
                    }
                    for (let k = 0; k < _LINES.length; k++) {
                        if ($(_LINES[k].start).attr('id') == newId || $(_LINES[k].end).attr('id') == newId) {
                            let nnId_ = $(_LINES[k].end).attr('id').split('test')[0]
                            let uid_ = $("#" + nnId_).attr("_key_uid");
                            let uid2_ = $("#" + nnId_).attr("_val_uid");
                            $("#" + nnId_).removeClass('_EM_value')
                            $("#" + nnId_).removeClass('_EM_key')
                            if (uid_) {
                                keyAll = keyAll.filter(item => item._id != uid_)
                                keyAll = keyAll.filter(item => item.targetId != uid_)
                                keysRelationAll = keysRelationAll.filter(item => item._id != uid_)
                                keysRelationAll = keysRelationAll.filter(item => item.pid != uid_)
                                valuesAll = valuesAll.filter(item => item._id != uid_)
                            }
                            if (uid2_) {
                                keyAll = keyAll.filter(item => item._id != uid2_)
                                keyAll = keyAll.filter(item => item.targetId != uid2_)
                                keysRelationAll = keysRelationAll.filter(item => item._id != uid2_)
                                keysRelationAll = keysRelationAll.filter(item => item.pid != uid2_)
                                valuesAll = valuesAll.filter(item => item._id != uid2_)
                            }
                            if ($(_LINES[k].start).attr('id') == newId) {
                                demo($(_LINES[k].end).attr('id'))
                            } else {}
                            _LINES[k].remove();
                            _LINES.splice(k, 1);
                            k--
                        }
                    }
                    let uid = $(this).attr("_key_uid");
                    let uid2 = $(this).attr("_val_uid");
                    $(this).removeClass('_EM_value')
                    $(this).removeClass('_EM_key')
                    if (uid) {
                        keyAll = keyAll.filter(item => item._id != uid)
                        keyAll = keyAll.filter(item => item.targetId != uid)
                        keysRelationAll = keysRelationAll.filter(item => item._id != uid)
                        keysRelationAll = keysRelationAll.filter(item => item.pid != uid)
                        valuesAll = valuesAll.filter(item => item._id != uid)
                    }
                    if (uid2) {
                        keyAll = keyAll.filter(item => item._id != uid2)
                        keyAll = keyAll.filter(item => item.targetId != uid2)
                        keysRelationAll = keysRelationAll.filter(item => item._id != uid2)
                        keysRelationAll = keysRelationAll.filter(item => item.pid != uid2)
                        valuesAll = valuesAll.filter(item => item._id != uid2)
                    }
                    setTimeout(() => {
                        _currentModel["keys"] = keyAll
                        _currentModel["values"] = valuesAll
                        _currentModel["keysRelation"] = keysRelationAll
                        saveCurrentModel();
                    }, 100)
                }
            }
            if(panelRadioVal=="chooseAttribute"){
                if($("#indicatorTypeChoose").val()&&$("#testTypeChoose").val()){
                    if($(this).hasClass("_EM_key_standard")){
                        if($(this).hasClass("_EM_value")){
                            $(this).attr('data-indicatorType',$("#indicatorTypeChoose").val())
                            $(this).attr('data-testType',$("#testTypeChoose").val())
                            $(this).addClass('dataIndicatorType')
                            let isHave = false
                            const downAndUp = returnBoundFunc($(this).attr('v'))
                            if (resetDataTable && resetDataTable[0]) {
                                for (let jk = 0; jk < resetDataTable.length; jk++) {
                                    let kItem = resetDataTable[jk]
                                    if (kItem.id == $(this).attr('id')) {
                                        isHave = true
                                        kItem.dataIndicatorType=$("#indicatorTypeChoose").val()
                                        kItem.dataTestType = $("#testTypeChoose").val()
                                        kItem.value =$(this).attr('v')
                                        if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                            kItem.data_down = downAndUp.dataDown
                                            kItem.data_up = downAndUp.dataUp
                                            kItem.deviationUpper = downAndUp.deviationUpper
                                            kItem.deviationLower = downAndUp.deviationLower
                                            kItem.nominalValue = downAndUp.nominalValue
                                        }
                                        break
                                    }
                                }
                            }
                            if(!isHave){
                                let lis = {
                                    dataIndicatorType: $("#indicatorTypeChoose").val(),
                                    dataTestType: $("#testTypeChoose").val(),
                                    id: $(this).attr('id'),
                                    tableindex: $(this).attr('tableindex'),
                                    value: $(this).attr('v'),
                                    _val_uid: $(this).attr('_val_uid'),
                                    x: $(this).attr('x'),
                                    y: $(this).attr('y'),
                                }
                                if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                    lis.data_down = downAndUp.dataDown
                                    lis.data_up = downAndUp.dataUp
                                    lis.deviationUpper = downAndUp.deviationUpper
                                    lis.deviationLower = downAndUp.deviationLower
                                    lis.nominalValue = downAndUp.nominalValue
                                }
                                if (resetDataTable && resetDataTable[0]) {} else {
                                    resetDataTable = []
                                }
                                resetDataTable.push(lis)
                            }
                            _extModelsData.resetDataTable = resetDataTable
                            saveCurrentModel();
                        }else{
                            if($(this).hasClass("_EM_key")){
                                tbl.find('td[x='+$(this).attr('x')+']').filter(function () {
                                    if($(this).hasClass("_EM_key_standard")&&$(this).hasClass("_EM_value")){
                                        $(this).attr('data-indicatorType',$("#indicatorTypeChoose").val())
                                        $(this).attr('data-testType',$("#testTypeChoose").val())
                                        $(this).addClass('dataIndicatorType')
                                        let isHave = false
                                        const downAndUp = returnBoundFunc($(this).attr('v'))
                                        if (resetDataTable && resetDataTable[0]) {
                                            for (let jk = 0; jk < resetDataTable.length; jk++) {
                                                let kItem = resetDataTable[jk]
                                                if (kItem.id == $(this).attr('id')) {
                                                    isHave = true
                                                    kItem.dataIndicatorType=$("#indicatorTypeChoose").val()
                                                    kItem.dataTestType = $("#testTypeChoose").val()
                                                    kItem.value =$(this).attr('v')
                                                    if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                                        kItem.data_down = downAndUp.dataDown
                                                        kItem.data_up = downAndUp.dataUp
                                                        kItem.deviationUpper = downAndUp.deviationUpper
                                                        kItem.deviationLower = downAndUp.deviationLower
                                                        kItem.nominalValue = downAndUp.nominalValue
                                                    }
                                                    break
                                                }
                                            }
                                        }
                                        if(!isHave){
                                            let lis = {
                                                dataIndicatorType: $("#indicatorTypeChoose").val(),
                                                dataTestType: $("#testTypeChoose").val(),
                                                id: $(this).attr('id'),
                                                tableindex: $(this).attr('tableindex'),
                                                value: $(this).attr('v'),
                                                _val_uid: $(this).attr('_val_uid'),
                                                x: $(this).attr('x'),
                                                y: $(this).attr('y'),
                                            }
                                            if (downAndUp.dataDown || downAndUp.dataUp || downAndUp.nominalValue) {
                                                lis.data_down = downAndUp.dataDown
                                                lis.data_up = downAndUp.dataUp
                                                lis.deviationUpper = downAndUp.deviationUpper
                                                lis.deviationLower = downAndUp.deviationLower
                                                lis.nominalValue = downAndUp.nominalValue
                                            }
                                            if (resetDataTable && resetDataTable[0]) {} else {
                                                resetDataTable = []
                                            }
                                            resetDataTable.push(lis)
                                        }
                                    }
                                })
                                _extModelsData.resetDataTable = resetDataTable
                                saveCurrentModel();
                            }else{
                                alert('只能检测值设置属性')
                            }
                        }
                    }else{
                        alert('只能检测值设置属性')
                    }
                }else{
                    alert('请您先选择指标类型和试验类型')
                }
            }
        }
    })

    $("#btnTagLink1").on("change", function () {
        _freelinkLR = []
    })
    //文件编辑
    let isEdit = false
    $(document).on('click', "#btnEditFile", function () {
        if ($("._EM_value") && $("._EM_value")[0]) {
            $(".p-clip-form input").attr('disabled', 'disabled')
            $(".p-clip-table input").attr('disabled', 'disabled')
            $(".p-clip-freelink input").attr('disabled', 'disabled')
            $(".p-clip-simplefreelink input").attr('disabled', 'disabled')
            $("input[name='panelRadio'][type='radio']").prop('checked', false)
            $("input[name='panelRadio'][type='radio']").data('checked', false)
            isEdit = true
        } else {
            alert('请您先创建完模版或者选中模版后，再编辑文件')
        }
    })
    //取消文件编辑
    $(document).on('click', "#btnNoEditFile", function () {
        if ($("._EM_value") && $("._EM_value")[0]) {
            $(".p-clip-form input").removeAttr('disabled')
            $(".p-clip-table input").removeAttr('disabled')
            $(".p-clip-freelink input").removeAttr('disabled')
            $(".p-clip-simplefreelink input").removeAttr('disabled')
            isEdit = false
            if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
                let tdf = $('.extractor_table .InputStyle')[0]
                let dataId = tdf.getAttribute('data-id')
                let dataId1 = dataId.split('&&')[0]
                let dataId2 = dataId.split('&&')[1]
                let tds = tdf.parentNode
                let html = tdf.value + "<div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                $(tds).html(html)
            }
        }
    })
    $(document).on('blur', '.InputStyle', function () {
        if ($("._EM_value") && $("._EM_value")[0]) {
            if ($('.extractor_table .InputStyle') && $('.extractor_table .InputStyle')[0]) {
                let tdf = $('.extractor_table .InputStyle')[0]
                let dataId = tdf.getAttribute('data-id')
                let dataId1 = dataId.split('&&')[0]
                let dataId2 = dataId.split('&&')[1]
                let tds = tdf.parentNode
                let html = tdf.value + "<div id='" + dataId1 + 'test' + dataId2 + "' class='leaders'></div>"
                $(tds).html(html)
            }
        }
        if (_currentModel.modelType == 'freelink' || _currentModel.modelType == 'simplefreelink') {
            renderExtractorEffect(_currentModel.modelID)
        }
    })

    //修改文件
    $(document).on('change', '.InputStyle', function () {
        let tdNow = $(this).parent('td')
        tdNow.attr('v', $(this).val())
        let isHave = false
        if (resetDataTable && resetDataTable[0]) {
            resetDataTable.filter(item => {
                if (item.id == tdNow.attr('id') && item.tableindex == tdNow.attr('tableindex')) {
                    isHave = true
                    item._val_uid = tdNow.attr('_val_uid')
                    item.value = $(this).val()
                    let valss = $(this).val().toString()
                    let downAndUp = returnBoundFunc(valss)
                    if (downAndUp.dataDown || downAndUp.dataDown == 0) {
                        tdNow.attr('data_down', downAndUp.dataDown)
                        item.data_down = downAndUp.dataDown
                    }
                    if (downAndUp.dataUp || downAndUp.dataUp == 0) {
                        tdNow.attr('data_up', downAndUp.dataUp)
                        item.data_up = downAndUp.dataUp
                    }
                    if (downAndUp.deviationUpper || downAndUp.deviationUpper == 0) {
                        tdNow.attr('deviationUpper', downAndUp.deviationUpper)
                        item.deviationUpper = downAndUp.deviationUpper
                    }
                    if (downAndUp.deviationLower || downAndUp.deviationLower == 0) {
                        tdNow.attr('deviationLower', downAndUp.deviationLower)
                        item.deviationLower = downAndUp.deviationLower
                    }
                    if (downAndUp.nominalValue || downAndUp.nominalValue == 0) {
                        tdNow.attr('nominalValue', downAndUp.nominalValue)
                        item.nominalValue = downAndUp.nominalValue
                    }
                }
            })
        }
        if (!isHave) {
            let valss = $(this).val().toString()
            let downAndUp = returnBoundFunc(valss)
            if (downAndUp.dataDown || downAndUp.dataDown == 0) {
                tdNow.attr('data_down', downAndUp.dataDown)
            }
            if (downAndUp.dataUp || downAndUp.dataUp == 0) {
                tdNow.attr('data_up', downAndUp.dataUp)
            }
            if (downAndUp.deviationUpper || downAndUp.deviationUpper == 0) {
                tdNow.attr('deviationUpper', downAndUp.deviationUpper)
            }
            if (downAndUp.deviationLower || downAndUp.deviationLower == 0) {
                tdNow.attr('deviationLower', downAndUp.deviationLower)
            }
            if (downAndUp.nominalValue || downAndUp.nominalValue == 0) {
                tdNow.attr('nominalValue', downAndUp.nominalValue)
            }
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
            if (resetDataTable && resetDataTable[0]) {} else {
                resetDataTable = []
            }
            resetDataTable.push(lis)
        }
        _extModelsData.resetDataTable = resetDataTable
        saveCurrentModel();
    })
    $(document).on('click', '._EM_value', function () {
        if ($(this).hasClass('_EM_key')) {} else {
            if (isEdit) {
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
                        let newhtml = "<textarea class='InputStyle' placeholder='" + $(tds).attr('v') +
                            "' style='height:" + $(this).css('height') +
                            ";z-index: 10000;height:100%;width:100%;top:0;' data-id=" + isdd +
                            " value='" + $(this).text() + "'>" + $(this).text() + "</textarea>"
                        $(this).html(newhtml)
                    }
                } else {
                    let isdd = $(this).attr('id') + '&&' + $(this).attr('tableIndex')
                    $(this).css('padding', '0')
                    $(this).css('position', 'relative')
                    let newhtml = "<textarea class='InputStyle' placeholder='" + $(this).attr('v') +
                        "' style='height:" + $(this).css('height') +
                        ";z-index: 10000;height:100%;width:100%;top:0;' data-id=" + isdd +
                        " value='" + $(this).text() + "'>" + $(this).text() + "</textarea>"
                    $(this).html(newhtml)
                }
            }
        }
    })
});

let startX = 0,
    startY = 0;

function renderValuesRangeFree(tbl, _currentModel) {
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
    if (_currentModel.hasOwnProperty("startCell")) {
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
        let startLeft = tbl.find("td._EM_value_start")[0].offsetLeft
        let startTop = tbl.find("td._EM_value_start")[0].offsetTop
        let endLeft = tbl.find("td._EM_value_end")[0].offsetLeft + tbl.find("td._EM_value_end")[0].offsetWidth
        let endTop = tbl.find("td._EM_value_end")[0].offsetTop + tbl.find("td._EM_value_end")[0].offsetHeight
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
                        parseInt($(this).attr("Y")) <= eY) {
                        $(this).addClass("_EM_key_standard")
                        let returnBoundD = returnBoundFunc($(this).attr('v'))
                        $(this).attr("data_down", returnBoundD.dataDown)
                        $(this).attr("data_up", returnBoundD.dataUp)
                        $(this).attr("deviationUpper", returnBoundD.deviationUpper)
                        $(this).attr("deviationLower", returnBoundD.deviationLower)
                        $(this).attr("nominalValue", returnBoundD.nominalValue)
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
                    }
                })
            })
        }
    }
}

function getKeyIndexFromCurrentModel(uid) {
    for (let i = 0; i < _currentModel["keys"].length; i++) {
        if (uid == _currentModel["keys"][i]._id) {
            return i
        }
    }
}

function getValueIndexFromCurrentModel(uid) {
    for (let i = 0; i < _currentModel["values"].length; i++) {
        if (uid == _currentModel["values"][i]._id) {
            return i
        }
    }
}

function clearTableTagMarks() {
    $(".extractor_table td")
        .removeClass("active _EM_key_standard _EM_key_standard1 _TYPE_ _TYPE_Int _TYPE_Float _TYPE_Bool _TYPE_Date _TYPE_DateTime _EM_start _EM_key _EM_mid_key _EM_value _EM_loop_end _EM_value_start _EM_value_end _EM_selected_spical_cell _EM_selected_virtual_key_cell _EM_virtual_key");
    $(".extractor_table td").removeAttr(" _key_uid");
    $(".extractor_table td").removeData("_EM_line").removeData("_EM_line_target").removeData("rxy");
    clearTagSelected();
    for (let i = 0; i < _LINES.length; i++) {
        _LINES[i].remove();
    }
    _LINES = [];
}



function resetPanel() {
    clearTagSelected();
    $(".p-clip").hide();
}

function checkStartSettedAndThen() {
    if ($(".extractor_table td._EM_start").length < 1) {
        $("input[name='panelRadio'][type='radio']").not("[value='start']").attr("disabled", "disabled");
    } else {
        $("input[name='panelRadio'][type='radio']").not("[value='start']").removeAttr("disabled");
    }
}


function loadExtractor() {
    for (let i = 0; i < _extModelsData.models.length; i++) {
        insertModal(_extModelsData.models[i]);
    }
    if (_extModelsData.models && _extModelsData.models[0]) {
        $("#btnCreateNewModel").css('display', 'none')
    } else {
        $("#btnCreateNewModel").css('display', 'inline-block')
    }
    $(".f-model-list").eq(0).trigger("click");
    checkAndRestPanelUI();
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

function insertModal(model) {
    const modalLi = $('<li class="list-group-item list-group-item-dark fy-flex fy-between fy-middle" ' +
        ' modelID="' + model['modelID'] + '" modelType="' + model['modelType'] + '"><span class="list-group-item-title fy-bigger-enabled">' + model['modelName'] + '</span>' +
        '<button class="btn btn-sm edit-btn iconfont">&#xe623;</button><button class="btn btn-sm close-btn iconfont">&#xe60c;</button></li>');
    $(".f-model-list").append(modalLi);
}

function saveCurrentModel() {
    for (let i = 0; i < _extModelsData.models.length; i++) {
        if (_extModelsData.models[i]["modelID"] == _currentModel["modelID"]) {
            _extModelsData.models[i] = _currentModel;
        }
    }
    saveExtModelsData();
}

function getCurrentModelTable() {
    let tableIndex = 1;
    if (_currentModel.hasOwnProperty("tableIndex")) {
        tableIndex = parseInt(_currentModel["tableIndex"]);
    }
    return $(".extractor_table table").eq(tableIndex - 1);
}

function saveExtModelsData() {
    _fse.writeJsonSync(_extractorModelFile, _extModelsData);
}

function createCoordinate(container) {
    container.find("table").each(function (i) {
        let tbl = $(this);
        tbl.attr("tableIndex", (i + 1))
        let lee = 0
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
}

function calRelationWithMD(_currentModel) {
    const keys = _.get(_currentModel, 'keys', []),
        values = _.get(_currentModel, 'values', [])
    const relation = []
    if (keys.length) {
        relation.push({
            _id: keys[0]._id,
            name: keys[0].name,
            pid: '-1'
        })
    }
    values.forEach((value, index) => {
        const targets = keys.filter(key => key.targetId === value._id)
        targets.forEach(target => {
            let obj = {
                _id: value._id,
                pid: target._id,
                name: value.name
            }
            relation.push(obj)
        })
    })
    if (relation && relation[0]) {
        for (let m = 0; m < relation.length; m++) {
            for (let m1 = m + 1; m1 < relation.length; m1++) {
                if (relation[m].pid == relation[m1].pid && relation[m]._id == relation[m1]._id) {
                    relation.splice(m1, 1)
                    m--
                    break
                }
            }
        }
    }
    _currentModel['keysRelation'] = relation
    saveExtModelsData()
}
//计算字段和中间字段的关系?*****
function calRelationWithKeys(_currentModel) {
    const {
        keys = [], middleKeys = []
    } = _currentModel
    const relation = []
    if (keys.length === 0 || middleKeys.length === 0) {
        return
    }
    keys.sort(function (a, b) {
        return a['position'][0] === b['position'][0] ? a['position'][1] - b['position'][1] : a['position'][0] - b['position'][0]
    })
    middleKeys.sort(function (a, b) {
        return a['position'][1] === b['position'][1] ? a['position'][0] - b['position'][0] : a['position'][1] - b['position'][1]
    })
    //查询左上角公共点
    //leftPoints: 左上角公共点，单个cell或 上下多个cell
    //otherKeys：字段里去除公共点的所有点
    //maxMiddleColspan: 中间字段最大跨了多少列
    let leftPoints = [],
        otherKeys = [],
        maxMiddleColspan = 1
    middleKeys.reduce((prev, cur) => {
        maxMiddleColspan = Math.max(maxMiddleColspan, _.get(cur, 'colspan', 1))
        return cur
    })
    const middleX = middleKeys[0]['position'][0]
    if (maxMiddleColspan === 1) { //如果中间字段没跨列
        leftPoints = keys.filter(item => item['position'][0] === middleX)
        otherKeys = keys.filter(item => item['position'][0] !== middleX)
    } else {
        const arr = _.range(middleX, middleX + maxMiddleColspan - 1)
        leftPoints = keys.filter(item => arr.includes(_.get(item, 'position.0', null)))
        otherKeys = keys.filter(item => !arr.includes(_.get(item, 'position.0', null)))
    }
    const pointRelations = processPoints(leftPoints, relation, 'common'),
        middleKeysRelation = processPoints(middleKeys, relation, 'left'),
        keysRelation = processPoints(otherKeys, relation)
    const lPointsLength = pointRelations.length
    const mPointsLength = middleKeysRelation.length
    const kPointsLength = keysRelation.length
    //连接公共点和中间字段关系
    if (leftPoints.length > 0) {
        const lPoints = lPointsLength === 0 ? leftPoints : pointRelations['tail']
        const mPoints = mPointsLength === 0 ? middleKeys : middleKeysRelation['head']
        lPoints.forEach(lPoint => {
            mPoints.forEach(mPoint => {
                const findIndex = relation.findIndex(item => item['_id'] === mPoint['_id'] && item['pid'] === '-1')
                if (findIndex > -1) {
                    _.set(relation, `${findIndex}.pid`, lPoint['_id'])
                }
            })
        })
    }
    //连接中间字段和顶部字段的关系
    const mPoints = mPointsLength === 0 ? middleKeys : _.uniqBy(middleKeysRelation['tail'], '_id')
    const kPoints = kPointsLength === 0 ? otherKeys : _.uniqBy(keysRelation['head'], '_id')
    mPoints.forEach(m => {
        kPoints.forEach(kPoint => {
            const k = keys.find(item => item['_id'] === kPoint['_id'])
            relation.push({
                _id: kPoint['_id'],
                pid: m['_id'],
                name: _.get(k, 'name')
            })
        })
    })
    _currentModel['keysRelation'] = relation
}

function processPoints(points, relation, type = 'top') {
    const colspanKeys = points.filter(item => item.hasOwnProperty('colspan'))
    colspanKeys.forEach(key => {
        const colspan = key['colspan']
        const addKeys = [...Array(colspan - 1).keys()].map(item => {
            return {
                ...key,
                position: [key['position'][0] + item + 1, key['position'][1]]
            }
        })
        points = points.concat(addKeys)
    })
    const rowspanKeys = points.filter(item => item.hasOwnProperty('rowspan'))
    rowspanKeys.forEach(key => {
        const rowspan = key['rowspan']
        const addKeys = [...Array(rowspan - 1).keys()].map(item => {
            return {
                ...key,
                position: [key['position'][0], key['position'][1] + item + 1]
            }
        })
        points = points.concat(addKeys)
    })
    points.sort((a, b) => {
        return a['position'][1] === b['position'][1] ? a['position'][0] - b['position'][0] : a['position'][1] - b['position'][1]
    })
    const allKeys = _.groupBy(points, `position.${ type === 'top' || type === 'common' ? 0 : 1 }`),
        relations = {
            head: [],
            tail: []
        }
    Object.values(allKeys).forEach(allKey => {
        allKey.reduce((prev, cur, index) => {
            const obj = {
                _id: cur['_id'],
                pid: _.isObject(prev) ? prev['_id'] : '-1',
                name: cur['name']
            }
            const o = {
                _id: cur['_id']
            }
            if (index === 0) {
                relations['head'].push(o)
            }
            if (index === allKey.length - 1) {
                if (type === 'left') {
                    obj.y = _.get(cur, 'position.1')
                }
                if (type === 'top') {
                    obj.x = _.get(cur, 'position.0')
                }
                relations['tail'].push(o)
            }
            if (obj.pid === '-1' && type === 'top') {} else {
                relation.push(obj)
            }
            return cur
        }, null)
    })
    return relations
}
/***
 *获取json文件数据方法
 */
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

            if (key.name) {
                if(dataIndicatorType){
                    _.set(obj, formatStr(key.name.replace('.', 'dottod'))+'_指标类型', dataIndicatorType)
                    _.set(obj, formatStr(key.name.replace('.', 'dottod'))+'_试验类型', dataTestType)
                }
                _.set(obj, formatStr(key.name.replace('.', 'dottod')), formatStr(v))
            }
        })
        data.push(obj)
    }
    return data
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

function demoFreeLinkLR(_freeLinkLRStart, _freeLinkLREnd) {
    $(_freeLinkLRStart[0]).css('position', 'relative')
    $(_freeLinkLREnd[0]).css('position', 'relative')
    const line = new LeaderLine($("#" + _freeLinkLRStart[0].id + 'test' + _freeLinkLRStart.attr('tableIndex'))[0], $("#" + _freeLinkLREnd[0].id + 'test' + _freeLinkLRStart.attr('tableIndex'))[0], {
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
    _freeLinkLRStart.data("_EM_line", line);
    _freeLinkLRStart.data("_EM_line_target", $(_freeLinkLREnd[0]));
    _LINES.push(line);
    _freeLinkLRStart.addClass("_EM_key");
    _freeLinkLREnd.addClass("_EM_value");
    const rxyA = [parseInt(_freeLinkLRStart.attr("X")) - startX, parseInt(_freeLinkLRStart.attr("Y")) - startY];
    const rxyB = [parseInt(_freeLinkLREnd.attr("X")) - startX, parseInt(_freeLinkLREnd.attr("Y")) - startY];
    const uidB = getHash(_freeLinkLREnd.text() + rxyB.join('-'));
    if (!_currentModel.hasOwnProperty("keys")) {
        _currentModel["keys"] = []
    }
    let textx = formatStr(_freeLinkLRStart.text())
    let textx1 = formatStr(_freeLinkLREnd.text())
    _currentModel["keys"].push({
        _id: getHash(_freeLinkLRStart.text() + rxyA.join('-')),
        position: rxyA,
        type: "Vchar",
        name: textx,
        targetId: uidB
    });
    if (!_currentModel.hasOwnProperty("values")) {
        _currentModel["values"] = []
    }
    _currentModel["values"].push({
        _id: uidB,
        position: rxyB,
        name: textx1
    });
    saveCurrentModel();
    calRelationWithMD(_currentModel)
}
