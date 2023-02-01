let _uuid = require('uuid-random')
const _shell = require('electron').shell
let _fs = require('fs')
let _ = require('lodash')
const uuid = require("uuid-random");
const cytoscape = require('cytoscape')
const d3Force = require('cytoscape-d3-force')
let _currentProj = {};
let _currentProjFileData = {};
let _extModelsData, _extractorModelFile;
let _currentModel = {};
let _LINES = [];
let chooseStandard = false
let _modalCreateNew;
let step = 1
let _freelinkLR = [];

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

$(function () {
    dataSou={
        nodes:[],
        links:[]
    }
    let urls = window.location.search.substring(1)
    let vars = urls.split("&");
    let arrobject1 = {}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrobject1[pair[0]] = decodeURI(pair[1])
    }
    $(document).on('click', '#newBtn', async function () {
        $("#modalCreateNew").modal('show')
        $("#ipt_model_name").val('')
    })
    $(document).on('click', '.glyphicon1', async function () {
        $("#modalCreateNew").modal('show')
        $("#ipt_model_name").val('')
    })
    /**
     * 重选模型
     */
    $(document).on('click', '#preBtnBack', async function () {
        step = 1
        $(".displayNone").addClass('hide')
        $('.new-model-left').removeClass('hide')
        $('#preBtn').addClass('hide')
        $("#preBtnBack").css('display','none')
        $("#nextBtn").html('下一步')
        $('.modal_li').removeClass('active')
        _currentModel = {}
        _freelinkLR = []
        panelRadioVal = ''
        clearTableTagMarks();
    })
    let panelRadioVal = ''
    $(document).on('click', '#nextBtn', async function () {
        panelRadioVal = ''
        $("#preBtnBack").css('display','none')
        if($(this).html()=='预览'){
            /**
             * 查看解析数据
             */
            if(_currentModel.modelType=='table'){
                tableD = await returnParseTableData(_currentModel,_currentProj,_currentProjFileData)
                convertJsonToTable(_currentModel,tableD)
                $("#modalDataTableShow").modal('show')
            }else{
                await returnParseTableData(_currentModel,_currentProj,_currentProjFileData)
            }
        }
        if(_currentModel.modelType=='table'){
            $('.new-model-left').addClass('hide')
            $('#preBtn').removeClass('hide')
            step++
            $(".displayNone").addClass('hide')
            if(step>5){
                step=5
                panelRadioVal = 'valueRangeEnd'
                $(".displayNone[step-now="+5+"][data-type=table]").removeClass('hide')
            }else{
                if(step==2){
                    panelRadioVal = 'start'
                    $(".displayNone[step-now="+step+"]").removeClass('hide')
                }else{
                    if(_currentModel.startCell){
                        if(step==3){
                            panelRadioVal = 'key'
                        }
                        if(step==4){
                            panelRadioVal = 'valueRangeStart'
                        }
                        if(step==5){
                            panelRadioVal = 'valueRangeEnd'
                        }
                        $(".displayNone[step-now="+step+"][data-type=table]").removeClass('hide')
                    }else{
                        step = 1
                        alert('请您先选择开始点位置再往下操作')
                        $(".displayNone[step-now="+2+"]").removeClass('hide')
                    }
                }
            }
            if(step>=5){
                $("#preBtnBack").css('display','inline-block')
                $(this).html('预览')
                step=5
            }
        }else if(_currentModel.modelType=="freelink"){
            $('.new-model-left').addClass('hide')
            $('#preBtn').removeClass('hide')
            step++
            $(".displayNone").addClass('hide')
            if(step>4){
                step=4
                _freelinkLR = []
                panelRadioVal = 'link1'
                $(".displayNone[step-now="+4+"][data-type=link]").removeClass('hide')
            }else{
                if(step==2){
                    panelRadioVal = 'start'
                    $(".displayNone[step-now="+step+"]").removeClass('hide')
                }else{
                    if(_currentModel.startCell){
                        if(step==3){
                            panelRadioVal = 'link'
                        }
                        if(step==4){
                            _freelinkLR = []
                            panelRadioVal = 'link1'
                        }
                        $(".displayNone[step-now="+step+"][data-type=link]").removeClass('hide')
                    }else{
                        step = 1
                        alert('请您先选择开始点位置再往下操作')
                        $(".displayNone[step-now="+2+"]").removeClass('hide')
                    }
                }
            }
            if(step>=4){
                $(this).html('预览')
                $("#preBtnBack").css('display','inline-block')
                step=4
            }
        }else if(_currentModel.modelType=='simplefreelink'){
            $('.new-model-left').addClass('hide')
            $('#preBtn').removeClass('hide')
            step++
            $(".displayNone").addClass('hide')
            if(step>3){
                step=3
                panelRadioVal = 'link'
                $(".displayNone[step-now="+3+"][data-type=link]").removeClass('hide')
            }else{
                if(step==2){
                    panelRadioVal = 'start'
                    $(".displayNone[step-now="+step+"]").removeClass('hide')
                }else{
                    if(_currentModel.startCell){
                        if(step==3){
                            panelRadioVal = 'link'
                        }
                        $(".displayNone[step-now="+step+"][data-type=link]").removeClass('hide')
                    }else{
                        step = 1
                        alert('请您先选择开始点位置再往下操作')
                        $(".displayNone[step-now="+2+"]").removeClass('hide')
                    }
                }
            }
            if(step>=3){
                $(this).html('预览')
                $("#preBtnBack").css('display','inline-block')
                step=3
            }
        }
    })
    $(document).on('click', '#preBtn', async function () {
        panelRadioVal = ''
        $("#nextBtn").html('下一步')
        step--
        if(_currentModel.modelType=='table'){
            $(".displayNone").addClass('hide')
            if(step==3){
                panelRadioVal = 'key'
            }
            if(step==4){
                panelRadioVal = 'valueRangeStart'
            }
            if(step==5){
                panelRadioVal = 'valueRangeEnd'
            }
            if(step==2){
                $(".displayNone[step-now="+step+"]").removeClass('hide')
            }else if(step!=1){
                $(".displayNone[step-now="+step+"][data-type=table]").removeClass('hide')
            }else{
                $(".displayNone").addClass('hide')
                $('.new-model-left').removeClass('hide')
                $('#preBtn').addClass('hide')
                step=1
            }
        }else if(_currentModel.modelType=='simplefreelink'){
            $(".displayNone").addClass('hide')
            if(step==2){
                panelRadioVal = 'start'
            }else {
                if (step == 3) {
                    panelRadioVal = 'link'
                }
                if (step == 4) {
                    panelRadioVal = 'link1'
                }
            }
            if(step==2){
                $(".displayNone[step-now="+step+"]").removeClass('hide')
            }else if(step!=1){
                $(".displayNone[step-now="+step+"][data-type=link]").removeClass('hide')
            }else{
                $(".displayNone").addClass('hide')
                $('.new-model-left').removeClass('hide')
                $('#preBtn').addClass('hide')
                step=1
            }
        }else if(_currentModel.modelType=='freelink'){
            $(".displayNone").addClass('hide')
            if(step==2){
                panelRadioVal = 'start'
            }else {
                if (step == 3) {
                    panelRadioVal = 'link'
                }
                if (step == 4) {
                    panelRadioVal = 'link1'
                }
            }
            if(step==2){
                $(".displayNone[step-now="+step+"]").removeClass('hide')
            }else if(step!=1){
                $(".displayNone[step-now="+step+"][data-type=link]").removeClass('hide')
            }else{
                $(".displayNone").addClass('hide')
                $('.new-model-left').removeClass('hide')
                $('#preBtn').addClass('hide')
                step=1
            }
        }
    })
    $(document).on('click', '.goBack', async function () {
        window.location.href = 'project1.html?type=' + arrobject1.type
    })
    _modalCreateNew = new bootstrap.Modal(document.getElementById('modalCreateNew'), {
        keyboard: false
    })
    //***********************项目初始化
    _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    _currentProjFile = _path.join(_currentProj["projPath"], "project.json");
    _currentProjFileData = _fse.readJsonSync(_currentProjFile);
    if (!_currentProjFileData.hasOwnProperty("original_file") || !_currentProjFileData.hasOwnProperty("table_file") ||
        _currentProjFileData["original_file"].length <= 1 || _currentProjFileData["table_file"].length <= 1) {
        alert("ERR!")
        return;
    }
    const tblFile = _path.join(_currentProj["projPath"], _currentProjFileData["table_file"])
    $.get(tblFile, function (doc) {
        $(".extractor_table").html(doc)
        createCoordinate($(".extractor_table"));
        $('.title').removeClass('active')
        $('#design').addClass('active')
        $('#newBtn').removeClass('hide')
    });
    _extractorModelFile = _path.join(_path.join(_currentProj["projPath"], "models"), "extractor_model.json");
    _fse.ensureFileSync(_extractorModelFile);
    $(".pcjixie").css("display", 'inline-block')
    _extModelsData = _fse.readJsonSync(_extractorModelFile, {
        throws: false
    });
    if (_extModelsData == null) {
        _extModelsData = {
            "varsion": "1.0",
            "templeteID": _uuid(),
            "templeteFileType": "EXCEL",
            "templeteFileSuffix": _path.extname(_currentProjFileData["original_file"]).toLowerCase(),
            "models": []
        };
        saveExtModelsData();
    } else {
        loadExtractor();
    }

    function loadExtractor() {
        if (_extModelsData && _extModelsData.models && _extModelsData.models[0]) {
            setTimeout(() => {
                $('.model-step').addClass('hide')
                $('.new-model').removeClass('hide')
            }, 10)

        }
        for (let i = 0; i < _extModelsData.models.length; i++) {
            insertModal(_extModelsData.models[i]);
        }
    }
    /**
     * 保存模版
     */
    function saveExtModelsData() {
        _fse.writeJsonSync(_extractorModelFile, _extModelsData);
    }
    /**
     * 表格处理
     * @param container
     */
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
                if(lengths>lee){
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
                let _x = 0;
                for (let x = 0; x < tr.find("td").length; x++) {
                    let td = tr.find("td").eq(x);
                    td.attr('tableIndex', tbl.attr("tableIndex"))
                    if(td[0].id){
                        td[0].innerHTML=td[0].innerHTML+"<div id='"+td[0].id+"test"+tbl.attr("tableIndex")+"' class='leaders'></div>"
                    }
                    td.attr("Y", td.cellPos().Y)
                    td.attr("X", td.cellPos().X)
                }
            }
        })
    }

    /**
     * 新增模版
     */
    $("#btnCreateNew").on("click", function () {
        if ($("#ipt_model_name").val()) {
            _currentModel = {
                "modelID": _uuid(),
                "modelName": $("#ipt_model_name").val(),
                "modelType": $("#sel_model_type").val(),
            }
            _extModelsData["models"].push(_currentModel);
            _LINES =[]
            _freelinkLR = []
            saveExtModelsData();
            $('.model-step').addClass('hide')
            $('.new-model').removeClass('hide')
            insertModal(_currentModel, 1);
            _modalCreateNew.hide();
            $('.modal_li').removeClass('active')
            $("#ipt_model_name").val('')
        } else {
            alert('请您填写模型名称')
        }
    })

    /**
     * 新增模版填充
     * @param modal
     */
    function insertModal(modal, now) {
        let chooseClass = ''
        if (now) {
            chooseClass = 'active'
        }
        const modalLi = ' <div class="model-list-item modal_li ' + chooseClass + '" modelName="' + modal['modelName'] + '" modelID="' + modal['modelID'] + '" modelType="' + modal['modelType'] + '">' +
            '<div class="liName">' + modal["modelName"] + '</div>' +
            '<div class="btn-icon deleteLi">&times;</div>' +
            '</div>'
        $(".model-list").append(modalLi);
    }

    $(document).on('click', '.modal_li', function () {
        $('.modal_li').removeClass('active')
        $(this).addClass('active')
        renderExtractorEffect($(this).attr("modelID"));
        $('#nextBtn').removeClass('hide')
    })
    let startX = 0,
        startY = 0;
    function getModelData(modelID) {
        for (let i = 0; i < _extModelsData.models.length; i++) {
            if (_extModelsData.models[i]["modelID"] === modelID) {
                return _extModelsData.models[i];
            }
        }
    }

    function getCurrentModelTable() {
        let tableIndex = 1;
        if (_currentModel.hasOwnProperty("tableIndex")) {
            tableIndex = parseInt(_currentModel["tableIndex"]);
        }
        return $(".extractor_table table").eq(tableIndex - 1);
    }

    function renderValuesRange(tbl) {
        tbl.find("td._EM_value").removeClass("_EM_value");
        if (tbl.find("td._EM_value_start").length > 0 && tbl.find("td._EM_value_end").length > 0) {
            let startLeft = tbl.find("td._EM_value_start")[0].offsetLeft
            let startTop = tbl.find("td._EM_value_start")[0].offsetTop
            let endLeft =tbl.find("td._EM_value_end")[0].offsetLeft+tbl.find("td._EM_value_end")[0].offsetWidth
            let endTop = tbl.find("td._EM_value_end")[0].offsetTop+tbl.find("td._EM_value_end")[0].offsetHeight
            tbl.find("td").filter(function () {
                return parseInt($(this)[0].offsetLeft) >= startLeft &&
                    parseInt($(this)[0].offsetTop) >= startTop &&
                    (parseInt($(this)[0].offsetLeft)+parseInt($(this)[0].offsetWidth)) <= endLeft &&
                    (parseInt($(this)[0].offsetTop)+parseInt($(this)[0].offsetHeight)) <= endTop
            }).addClass("_EM_value");
        }
    }

    function getValueIndexFromCurrentModel(uid) {
        for (let i = 0; i < _currentModel["values"].length; i++) {
            if (uid === _currentModel["values"][i]._id) {
                return i
            }
        }
    }
    //阻止浏览器默认右键点击事件
    $(".extractor_table").bind("contextmenu", function () {
        return false;
    })
    $(".extractor_table")[0].addEventListener('scroll', AnimEvent.add(function () {
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
    /**
     * 压缩
     */
    $("#btnArchive").on("click", function(){
        zipqby(_currentProjFileData["name"], function (path){
            alert("生成可共享模型文件成功！");
            _shell.showItemInFolder(path);
        });
    });
    /**
     * 模型渲染
     * @param modelID
     */
    function renderExtractorEffect(modelID) {
        _currentModel = getModelData(modelID);
        let modelType = _currentModel["modelType"];
        resetPanel();
        $(".p-clip-" + modelType).show();
        $('td').removeClass('_EM_key_standard')
        clearTableTagMarks();
        let tbl = getCurrentModelTable();
        if (_currentModel.hasOwnProperty("startCell")) { // s:187
            tbl.find("td[X='" + _currentModel["startCell"][0] + "'][Y='" + _currentModel["startCell"][1] + "']").addClass("_EM_start");
            startX = _currentModel["startCell"][0];
            startY = _currentModel["startCell"][1];
        }
        if (_currentModel.hasOwnProperty("values") && _currentModel["values"].length > 0) { //
            for (let i = 0; i < _currentModel["values"].length; i++) {
                const rxy = _currentModel["values"][i]["position"];
                const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
                cell.addClass("_EM_value").attr("_val_uid", _currentModel["values"][i]["_id"]).data("rxy", rxy);
                if (_currentModel["values"][i].nameS) {
                    cell.addClass('_EM_key_standard')
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
            renderValuesRange(tbl);
        }
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
                    } else {
                        cell.addClass("_EM_key")
                        if (cell.hasClass('_EM_key_standard')) {
                            cell.removeClass('_EM_key_standard')
                        }
                    }
                }
                if (_currentModel["keys"][i].type !== "Vchar") {
                    cell.addClass("_TYPE_").addClass("_TYPE_" + _currentModel["keys"][i].type);
                }
                if (_currentModel["keys"][i].hasOwnProperty("targetId")) {
                    let targetInfo = _currentModel["values"][getValueIndexFromCurrentModel(_currentModel["keys"][i]["targetId"])];
                    const cellB = tbl.find("td[X='" + (targetInfo["position"][0] + startX) + "'][Y='" + (targetInfo["position"][1] + startY) + "']");
                    let line = new LeaderLine($("#" + cell[0].id + 'test' + cell.attr('tableIndex'))[0], $("#" + cellB[0].id + 'test' + cellB.attr('tableIndex'))[0], {
                        "showEffectName": "draw",
                        endPlug: 'arrow1',
                        path:'straight',
                        width: 12,
                        height: 12,
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
        if (_currentModel.hasOwnProperty("middleKeys") && _currentModel["middleKeys"].length > 0) { //
            for (let i = 0; i < _currentModel["middleKeys"].length; i++) {
                const rxy = _currentModel["middleKeys"][i]["position"];
                const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
                cell.attr("_key_uid", _currentModel["middleKeys"][i]["_id"]).data("rxy", rxy);
                cell.addClass("_EM_mid_key");
            }
        }
        if (_currentModel.hasOwnProperty("loopEnd")) { // 标记值循环停止点
            tbl.find("td[X='" + (_currentModel["loopEnd"][0] + startX) + "'][Y='" + (_currentModel["loopEnd"][1] + startY) + "']")
                .addClass("_EM_loop_end");
        }
    }

    /**
     * 删除该模型
     */
    let hhhf
    $(document).on('click', '.deleteLi', function (e) {
        let modelName = $(this).parent('.modal_li').attr('modelName')
        let modelID = $(this).parent('.modal_li').attr('modelID')
        let modelType = $(this).parent('.modal_li').attr('modelType')
        e.preventDefault();
        e.stopPropagation();
        hhhf = $(this)
        confirms('是否确认删除提取模型',modelName,modelID)

    })
    $(document).on('click','.cancelConfirms',function (){
        $('.markBox').remove()
    })
    $(document).on('click','.okConfirms',function (){
        let modelID = $(this).attr('data-model')
            for (let i = 0; i < _extModelsData.models.length; i++) {
                if (_extModelsData.models[i]["modelID"] === modelID) {
                    _extModelsData.models.splice(i, 1);
                }
            }
            saveExtModelsData();
            clearTableTagMarks();
            resetPanel();
            if(hhhf){
                hhhf.parent(".modal_li").remove();
            }
            if (_extModelsData.models && _extModelsData.models[0]) {
            } else {
                $(".model-step").removeClass('hide')
                $(".new-model").addClass('hide')
            }
        $('.markBox').remove()

    })
    function clearTableTagMarks() {
        $(".extractor_table td")
            .removeClass("active _TYPE_ _TYPE_Int _TYPE_Float _TYPE_Bool _TYPE_Date _TYPE_DateTime _EM_start _EM_key _EM_value _EM_loop_end _EM_value_start _EM_value_end _EM_selected_spical_cell _EM_selected_virtual_key_cell _EM_virtual_key");
        $(".extractor_table td").removeAttr(" _key_uid");
        $(".extractor_table td").removeData("_EM_line").removeData("_EM_line_target").removeData("rxy");
        clearLine()
        for (let i = 0; i < _LINES.length; i++) {
            _LINES[i].remove();
        }
        _LINES = [];
    }

    function resetPanel() {
        $("#selSetKeyType").val("Vchar");
        $(".p-clip").hide();
    }

    _freelinkLR = [];
    $(".extractor_table").on("mousedown", "td", function (e) {
        if ($(this).hasClass("headline")) return;
        if($(this).hasClass("headline"))return;
        $(".extractor_table").find("td.active").removeClass("active");
        $(this).addClass("active");
        let tbl = $(this).parents("table");
        if(_currentModel.tableIndex){
            if($(this).attr('tableindex')==_currentModel.tableIndex){
            }else{
                alert('当前选择错误，必须选择同一个sheet里面的表格')
                return;
            }
        }
        if (panelRadioVal) {
            // 起始点
            if(panelRadioVal === "start"){
                if (3 === e.which) {
                    $(this).removeClass("_EM_start");
                    delete _currentModel["startCell"];
                    startX=0,startY=0;
                }else if(1 === e.which){
                    $(".extractor_table td._EM_start").removeClass("_EM_start");
                    $(this).addClass("_EM_start");
                    _currentModel["startCell"] = [parseInt($(this).attr("X")),parseInt($(this).attr("Y"))];
                    _currentModel["tableIndex"] = $(this).parents("table").attr("tableIndex");
                    let indexx= $(this).parents("table").attr("tableIndex");
                    let ll = $(this).parents(".extractor_table").children('div')
                    if(ll[indexx-1] && ll[indexx-1].innerHTML) {
                        _currentModel["tableIndexName"] =ll[indexx-1].innerHTML
                    }
                    startX = parseInt($(this).attr("X"));
                    startY = parseInt($(this).attr("Y"));
                }
                saveCurrentModel();
            }
            if (panelRadioVal === "key"||panelRadioVal==='valueRangeStart0') {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (!_currentModel.hasOwnProperty("keys")) {
                    _currentModel["keys"] = []
                }
                if (3 === e.which) { //右键为3
                    if ($(this).hasClass("_EM_key")) {
                        $(this).removeClass("_EM_key");
                        if ($(this).hasClass("_EM_key_standard")) {
                            $(this).removeClass("_EM_key_standard");
                        }
                        const uid = $(this).attr("_key_uid");
                        _currentModel["keys"].splice(getKeyIndexFromCurrentModel(uid), 1);
                    }
                    $("#divSetKeyTypeBoolValue").hide();
                }else if(1 === e.which){ //左键为1
                    let keyType = "Vchar";
                    if (!$(this).hasClass("_EM_key")) {
                        const uid = _uuid();
                        $(this).addClass("_EM_key").attr("_key_uid", uid);
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
                    } else {
                        const uid = $(this).attr("_key_uid");
                        const keyInfo = _currentModel["keys"].filter((item) => item._id === uid)[0];
                        if (keyInfo.hasOwnProperty("type")) {
                            keyType = keyInfo["type"];
                            if (keyInfo.hasOwnProperty("typeBoolSetTrueText")) {
                                $("#iptKeyTypeBoolValue").val(keyInfo["typeBoolSetTrueText"]);
                            }
                        }
                    }
                    $("#selSetKeyType").val(keyType);
                    if(keyType === "Bool"){
                        $("#divSetKeyTypeBoolValue").show();
                    }else{
                        $("#divSetKeyTypeBoolValue").hide();
                    }
                }
                calRelationWithKeys(_currentModel)
                saveCurrentModel();
            }
            if(panelRadioVal === "value"){
                const rxy = [parseInt($(this).attr("X"))-startX,parseInt($(this).attr("Y"))-startY];
                if(!_currentModel.hasOwnProperty("values")){_currentModel["values"]=[]}
                if (3 === e.which) {
                    if($(this).hasClass("_EM_value")){
                        $(this).removeClass("_EM_value");
                        const uid = $(this).attr("_val_uid");
                        _currentModel["values"].splice( getKeyValueFromCurrentModel(uid) , 1);
                    }
                }else if(1 === e.which){
                    if(!$(this).hasClass("_EM_value")){
                        const uid = _uuid();
                        $(this).addClass("_EM_value").attr("_val_uid", uid);
                        _currentModel["values"].push({
                            _id : uid,
                            position : rxy
                        });
                    }
                }
                saveCurrentModel();
            }
            if(panelRadioVal === "valueRangeStart"){
                const rxy = [parseInt($(this).attr("X"))-startX,parseInt($(this).attr("Y"))-startY];
                if (3 === e.which) {
                    $(this).removeClass("_EM_value_start");
                    delete _currentModel["valuesStartCell"];
                }else if(1 === e.which){
                    $(".extractor_table td._EM_value_start").removeClass("_EM_value_start");
                    $(this).addClass("_EM_value_start");
                    _currentModel["valuesStartCell"] = rxy;
                }
                saveCurrentModel();
                renderValuesRange(tbl);
            }
            if(panelRadioVal === "valueRangeEnd"){
                const rxy = [parseInt($(this).attr("X"))-startX,parseInt($(this).attr("Y"))-startY];
                if($(this).attr('colSpan')){
                    _currentModel["valuesColSpan"] = $(this).attr('colSpan')
                }else{
                    delete _currentModel["valuesColSpan"];
                }
                if($(this).attr('rowSpan')){
                    _currentModel["valuesRowSpan"] = $(this).attr('rowSpan')
                }else{
                    delete _currentModel["valuesRowSpan"];
                }
                if (3 === e.which) {
                    $(this).removeClass("_EM_value_end");
                    delete _currentModel["valuesEndCell"];
                }else if(1 === e.which){
                    $(".extractor_table td._EM_value_end").removeClass("_EM_value_end");
                    $(this).addClass("_EM_value_end");
                    _currentModel["valuesEndCell"] = rxy;
                }
                saveCurrentModel();
                renderValuesRange(tbl);
            }
            let isNoUnique = false
            if (panelRadioVal === "link") {
                function unique (arr) {
                    isNoUnique=false
                    for(let m=0;m< arr.length;m++){
                        let cooo=0
                        for(let m1=0;m1<arr.length;m1++){
                            if(arr[m1][0]===arr[m][0]){
                                cooo++
                            }
                        }
                        if(cooo>1){
                            isNoUnique=true
                            arr.splice(m,1)
                            m--
                        }
                    }
                    return {arr:arr,isNoUnique:isNoUnique}
                }
                if (3 === e.which) {
                    _freelinkLR = [];
                } else if (1 === e.which) {
                    let isNoUnique=false
                    _freelinkLR.push($(this));
                    if(_freelinkLR.length>1){
                        _freelinkLR=unique(_freelinkLR).arr
                        isNoUnique=unique(_freelinkLR).isNoUnique
                    }
                    if(_freelinkLR.length >= 2) {
                        if (isNoUnique) {
                        } else {
                            for (let n = 0; n < _freelinkLR.length; n++) {
                                if (_freelinkLR[n + 1]) {
                                    demoFreeLinkLR(_freelinkLR[n], _freelinkLR[n + 1])
                                }
                            }
                        }
                        function demoFreeLinkLR(_freeLinkLRStart,_freeLinkLREnd) {
                            $(_freeLinkLRStart[0]).css('position','relative')
                            $(_freeLinkLREnd[0]).css('position','relative')
                            let line = new LeaderLine($("#"+_freeLinkLRStart[0].id+'test'+_freeLinkLRStart.attr('tableIndex'))[0], $("#"+_freeLinkLREnd[0].id+'test'+_freeLinkLRStart.attr('tableIndex'))[0], {
                                "showEffectName": "draw",
                                endPlug: 'arrow1',
                                path:'straight',
                                width:12,
                                height:12,
                                size: 1.8,
                                startPlugSize: 1,
                                endPlugSize: 1,
                                outlineSize:'3px',
                                startPlugColor: '#ff3792', // 渐变色开始色
                                endPlugColor: '#ff1a26',// 渐变色结束色
                                gradient: true, // 使用渐变色
                            });
                            _freeLinkLRStart.data("_EM_line", line);
                            _freeLinkLRStart.data("_EM_line_target",$(_freeLinkLREnd[0]));
                            _LINES.push(line);
                            _freeLinkLRStart.addClass("_EM_key");
                            _freeLinkLREnd.addClass("_EM_value");
                            const rxyA = [parseInt(_freeLinkLRStart.attr("X")) - startX, parseInt(_freeLinkLRStart.attr("Y")) - startY];
                            const rxyB = [parseInt(_freeLinkLREnd.attr("X")) - startX, parseInt(_freeLinkLREnd.attr("Y")) - startY];
                            const uidB = getHash(_freeLinkLREnd.text() + rxyB.join('-'));
                            if (!_currentModel.hasOwnProperty("keys")) {
                                _currentModel["keys"] = []
                            }
                            _currentModel["keys"].push({
                                _id: getHash(_freeLinkLRStart.text() + rxyA.join('-')),
                                position: rxyA,
                                type: "Vchar",
                                name: _freeLinkLRStart.text(),
                                targetId: uidB
                            });
                            if (!_currentModel.hasOwnProperty("values")) {
                                _currentModel["values"] = []
                            }
                            _currentModel["values"].push({
                                _id: uidB,
                                position: rxyB,
                                name: _freeLinkLREnd.text()
                            });
                            saveCurrentModel();
                            calRelationWithMD(_currentModel)
                        }
                        if(_currentModel.modelType==='simplefreelink'){ _freelinkLR=[]}else{}
                    }
                }
            }
            if(panelRadioVal==="link2"){
                let isReset=true
                let isHave=false
                for(let k=0;k<_LINES.length;k++){
                    if(_LINES[k].end.id.split('test')[0]===$(this).attr('id')){
                        isHave=true
                    }
                    if(_LINES[k].end.id.split('test')[0]===$(this).attr('id')){
                        for(let k1=0;k1<_LINES.length;k1++){
                            if(_LINES[k1].start.id.split('test')[0]===$(this).attr('id')){
                                isReset=false
                            }
                        }
                    }
                }
                if(isReset&&isHave){
                    _currentModel.values.filter(item=>{
                        if(item._id===$(this).attr('_val_uid')){
                            item.nameS='standard'
                        }
                    })
                    _currentModel.keys.filter(item=>{
                        if(item._id===$(this).attr('_val_uid')){
                            item.nameS='standard'
                        }
                    })
                    _currentModel.keysRelation.filter(item=>{
                        if(item._id===$(this).attr('_val_uid')){
                            item.nameS='standard'
                        }
                    })
                    if($(this).hasClass("_EM_key_standard")){
                    }else{
                        $(this).addClass('_EM_key_standard')
                    }
                    saveCurrentModel();
                }else{
                    $("#alertBox").fadeIn()
                    setTimeout(()=>{
                        $("#alertBox").fadeOut()
                    },1000)
                }
            }
            if(panelRadioVal === "link1"){
                _freelinkLR = [];
            }
            if (panelRadioVal === "unlink") {
                if ($(this).hasClass("_EM_value")) {
                    let keyAll = _currentModel["keys"]
                    for(let k=0;k<keyAll.length;k++){
                        for(let k1=k+1;k1<keyAll.length;k1++){
                            if(keyAll[k].position[0]===keyAll[k1].position[0]&&keyAll[k].position[1]===keyAll[k1].position[1]){
                                keyAll.splice(k,1)
                                k--
                                break;
                            }
                        }
                    }
                    let keysRelationAll = _currentModel["keysRelation"]
                    let valuesAll = _currentModel["values"]
                    for(let k=0;k<valuesAll.length;k++){
                        for(let k1=k+1;k1<valuesAll.length;k1++){
                            if(valuesAll[k].position[0]===valuesAll[k1].position[0]&&valuesAll[k].position[1]===valuesAll[k1].position[1]){
                                valuesAll.splice(k,1)
                                k--
                                break;
                            }
                        }
                    }
                    let newId = $(this).attr('id')+'test'+$(this).attr('tableindex')
                    let demo=(newIdN)=>{
                        for(let k=0;k<_LINES.length;k++){
                            if($(_LINES[k].start).attr('id')===newIdN){
                                let nnId= $(_LINES[k].start).attr('id').split('test')[0]
                                let uid = $("#"+nnId).attr("_key_uid");
                                let uid2 = $("#"+nnId).attr("_val_uid");
                                $("#"+nnId).removeClass('_EM_value')
                                $("#"+nnId).removeClass('_EM_key')
                                if(uid){
                                    keyAll = keyAll.filter(item=>item._id!==uid)
                                    keyAll = keyAll.filter(item=>item.targetId!==uid)
                                    keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid)
                                    keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid)
                                    valuesAll  = valuesAll.filter(item=>item._id!==uid)
                                }
                                if(uid2){
                                    keyAll = keyAll.filter(item=>item._id!==uid2)
                                    keyAll = keyAll.filter(item=>item.targetId!==uid2)
                                    keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid2)
                                    keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid2)
                                    valuesAll  = valuesAll.filter(item=>item._id!==uid2)
                                }
                                let nnId_= $(_LINES[k].end).attr('id').split('test')[0]
                                let uid_ = $("#"+nnId_).attr("_key_uid");
                                let uid2_ = $("#"+nnId_).attr("_val_uid");
                                $("#"+nnId_).removeClass('_EM_value')
                                $("#"+nnId_).removeClass('_EM_key')
                                if(uid_){
                                    keyAll = keyAll.filter(item=>item._id!==uid_)
                                    keyAll = keyAll.filter(item=>item.targetId!==uid_)
                                    keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid_)
                                    keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid_)
                                    valuesAll  = valuesAll.filter(item=>item._id!==uid_)
                                }
                                if(uid2_){
                                    keyAll = keyAll.filter(item=>item._id!==uid2_)
                                    keyAll = keyAll.filter(item=>item.targetId!==uid2_)
                                    keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid2_)
                                    keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid2_)
                                    valuesAll  = valuesAll.filter(item=>item._id!==uid2_)
                                }
                                demo($(_LINES[k].end).attr('id'))
                                _LINES[k].remove();
                                _LINES.splice(k, 1);
                                k--
                            }
                        }
                    }
                    for(let k=0;k<_LINES.length;k++){
                        if($(_LINES[k].start).attr('id')===newId||$(_LINES[k].end).attr('id')===newId){
                            let nnId_= $(_LINES[k].end).attr('id').split('test')[0]
                            let uid_ = $("#"+nnId_).attr("_key_uid");
                            let uid2_ = $("#"+nnId_).attr("_val_uid");
                            $("#"+nnId_).removeClass('_EM_value')
                            $("#"+nnId_).removeClass('_EM_key')
                            if(uid_){
                                keyAll = keyAll.filter(item=>item._id!==uid_)
                                keyAll = keyAll.filter(item=>item.targetId!==uid_)
                                keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid_)
                                keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid_)
                                valuesAll  = valuesAll.filter(item=>item._id!==uid_)
                            }
                            if(uid2_){
                                keyAll = keyAll.filter(item=>item._id!==uid2_)
                                keyAll = keyAll.filter(item=>item.targetId!==uid2_)
                                keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid2_)
                                keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid2_)
                                valuesAll  = valuesAll.filter(item=>item._id!==uid2_)
                            }
                            if($(_LINES[k].start).attr('id')===newId){
                                demo($(_LINES[k].end).attr('id'))
                            }else{
                            }
                            _LINES[k].remove();
                            _LINES.splice(k, 1);
                            k--
                        }
                    }
                    let uid = $(this).attr("_key_uid");
                    let uid2 = $(this).attr("_val_uid");
                    $(this).removeClass('_EM_value')
                    $(this).removeClass('_EM_key')
                    if(uid){
                        keyAll = keyAll.filter(item=>item._id!==uid)
                        keyAll = keyAll.filter(item=>item.targetId!==uid)
                        keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid)
                        keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid)
                        valuesAll  = valuesAll.filter(item=>item._id!==uid)
                    }
                    if(uid2){
                        keyAll = keyAll.filter(item=>item._id!==uid2)
                        keyAll = keyAll.filter(item=>item.targetId!==uid2)
                        keysRelationAll  = keysRelationAll.filter(item=>item._id!==uid2)
                        keysRelationAll  = keysRelationAll.filter(item=>item.pid!==uid2)
                        valuesAll  = valuesAll.filter(item=>item._id!==uid2)
                    }
                    setTimeout(()=>{
                        _currentModel["keys"] = keyAll
                        _currentModel["values"] = valuesAll
                        _currentModel["keysRelation"] = keysRelationAll
                        saveCurrentModel();
                    },100)
                }
            }
            if(panelRadioVal === "spicalValueProcess"){
                if (3 === e.which) {
                    $(this).removeClass("_EM_selected_spical_cell")
                }else{
                    $("._EM_selected_spical_cell").removeClass("_EM_selected_spical_cell");
                    $(this).addClass("_EM_selected_spical_cell")
                }
            }
            if(panelRadioVal === "valueVirtualKey"){
                if(!_currentModel.hasOwnProperty("keys")){_currentModel["keys"]=[]}
                if (3 === e.which && $(this).hasClass("_EM_virtual_key")) {
                    $(this).removeClass("_EM_virtual_key")
                    $("#divSetKeyTypeBoolValue").hide();
                    const uid = $(this).attr("_key_uid");
                    _currentModel["keys"].splice( getKeyIndexFromCurrentModel(uid) , 1);
                    saveCurrentModel();
                }else{
                    let keyType = "Vchar";
                    const rxy = [parseInt($(this).attr("X"))-startX,parseInt($(this).attr("Y"))-startY];
                    if(!$(this).hasClass("_EM_virtual_key")){
                        $(this).addClass("_EM_virtual_key");
                        const uid = _uuid();
                        $(this).attr("_key_uid", uid);
                        let model = {
                            _id : uid,
                            position : rxy,
                            virtualKey : true
                        };
                        if($(this).attr("colspan")){
                            if(parseInt($(this).attr("colspan"))>1){
                                model.colspan = parseInt($(this).attr("colspan"))
                            }
                        }
                        _currentModel["keys"].push(model);
                    }else{
                        const uid = $(this).attr("_key_uid");
                        const keyInfo = _currentModel["keys"].filter( (item) => item._id === uid)[0];
                        if(keyInfo.hasOwnProperty("type")){
                            keyType = keyInfo["type"];
                            if(keyInfo.hasOwnProperty("typeBoolSetTrueText")){
                                $("#iptKeyTypeBoolValue").val(keyInfo["typeBoolSetTrueText"]);
                            }
                        }
                    }
                    $("#selSetKeyType").val(keyType);
                    if(keyType === "Bool"){
                        $("#divSetKeyTypeBoolValue").show();
                    }else{
                        $("#divSetKeyTypeBoolValue").hide();
                    }
                }
            }
        }
    })
    function getKeyIndexFromCurrentModel(uid){
        for(let i =0; i<_currentModel["keys"].length; i++){
            if(uid === _currentModel["keys"][i]._id){
                return i
            }
        }
    }
    function saveCurrentModel(){
        for(let i=0; i<_extModelsData.models.length; i++){
            if(_extModelsData.models[i]["modelID"] === _currentModel["modelID"]){
                _extModelsData.models[i] = _currentModel;
            }
        }
        saveExtModelsData();
    }
    //计算字段和中间字段的关系
    function calRelationWithKeys(_currentModel) {
        const {keys = [], middleKeys = []} = _currentModel
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
        let leftPoints = [], otherKeys = [], maxMiddleColspan = 1
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
                    if(findIndex > -1) {
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
                relation.push({_id: kPoint['_id'], pid: m['_id'], name: _.get(k, 'name')})
            })
        })
        _currentModel['keysRelation'] = relation
    }
    function calRelationWithMD(_currentModel) {
        const keys = _.get(_currentModel, 'keys', []),
            values = _.get(_currentModel, 'values', [])
        const relation = []
        if(keys.length) {
            relation.push({_id: keys[0]._id, name: keys[0].name, pid: '-1'})
        }
        values.forEach((value, index) => {
            const targets = keys.filter(key => key.targetId === value._id)
            targets.forEach(target => {
                let obj = {_id: value._id, pid: target._id, name: value.name}
                relation.push(obj)
            })
        })
        if(relation&&relation[0]){
            for(let m=0;m<relation.length;m++ ){
                for(let m1 =m+1;m1<relation.length;m1++){
                    if(relation[m].pid===relation[m1].pid&&relation[m]._id===relation[m1]._id){
                        relation.splice(m1,1)
                        m--
                        break
                    }
                }
            }
        }
        _currentModel['keysRelation'] = relation
        saveExtModelsData()
    }
})
