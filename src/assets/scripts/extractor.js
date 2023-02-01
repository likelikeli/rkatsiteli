let _uuid = require('uuid-random')
const _shell = require('electron').shell
let _fs = require('fs')
let _ = require('lodash')
let _currentProj = {};
let _currentProjFileData = {};
let _extModelsData,_extractorModelFile;
let _currentModel = {};
let _LINES = [];
let chooseStandard=false
let _modalCreateNew;
let _freelinkLR = [];
$(function () {
    _modalCreateNew = new bootstrap.Modal(document.getElementById('modalCreateNew'), {keyboard: false})
    //***********************项目初始化
    _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    _currentProjFile = _path.join(_currentProj["projPath"], "project.json");
    _currentProjFileData = _fse.readJsonSync(_currentProjFile);
    if (!_currentProjFileData.hasOwnProperty("original_file") || !_currentProjFileData.hasOwnProperty("table_file") ||
        _currentProjFileData["original_file"].length <= 1 || _currentProjFileData["table_file"].length <= 1) {
        alert("ERR!")
        return;
    }
    $("#btnOpenProjFolder").click(function(){
        _shell.openPath(_currentProj["projPath"]);
    })
    const tblFile = _path.join(_currentProj["projPath"], _currentProjFileData["table_file"])
    $.get(tblFile, function(doc){
        $(".extractor_table").html(doc)
        createCoordinate($(".extractor_table"));
    });
    _extractorModelFile = _path.join(_path.join(_currentProj["projPath"],"models"),"extractor_model.json");
    _fse.ensureFileSync(_extractorModelFile);
    $(".pcjixie").css("display",'inline-block')
    _extModelsData = _fse.readJsonSync(_extractorModelFile, {throws: false});
    if (_extModelsData == null) {
        _extModelsData = {
            "varsion" : "1.0",
            "templeteID": _uuid(),
            "templeteFileType":"EXCEL",
            "templeteFileSuffix": _path.extname(_currentProjFileData["original_file"]).toLowerCase(),
            "models":[]
        };
        saveExtModelsData();
    }else{
        loadExtractor();
    }
    /**************************/
    $("#btnCreateNewModel").on("click", function(){
        $("#ipt_model_name").val("")
        _modalCreateNew.show();
    })
    $("#sel_model_type").on('input',function () {
    })
    $("#btnCreateNew").on("click", function () {
        _currentModel = {
            "modelID": _uuid(),
            "modelName": $("#ipt_model_name").val(),
            "modelType": $("#sel_model_type").val(),
        }
        _extModelsData["models"].push(_currentModel);
        saveExtModelsData();
        insertModal(_currentModel);
        checkAndRestPanelUI();
        $(".f-model-list li:last-child>.list-group-item-title").trigger("click");
        _modalCreateNew.hide();
    })
    $(document.body).on("click", ".f-model-list li>.list-group-item-title", function () {
        $(".f-model-list li.active").removeClass("active");
        chooseStandard=false
        $(this).parent().addClass("active");
        renderExtractorEffect($(this).parent().attr("modelID"));
        //如果是三维表，显示解析按钮
        if($(this).parent().attr('modelType') === 'freelink'|| $(this).parent().attr('modelType') === 'simplefreelink'){
            $('#parse').show()
        }
    });
    $(document.body).on("click", ".f-model-list li>.close-btn", function(){
        if(confirm("是否确认删除提取模型："+$(this).parent().find("span").text()+" ?")){
            const modelID = $(this).parent().attr("modelID");
            for(let i=0; i<_extModelsData.models.length; i++){
                if(_extModelsData.models[i]["modelID"] === modelID){
                    _extModelsData.models.splice(i,1);
                }
            }
            saveExtModelsData();
            clearTableTagMarks();
            resetPanel();
            $(this).parent("li").remove();
        }else{}
    });
    // 编辑名称
    let chooseModalID=''
    $(document.body).on("click", ".f-model-list li>.edit-btn", function () {
        chooseModalID = $(this).parent().attr("modelID");
        for(let i=0; i<_extModelsData.models.length; i++){
            if(_extModelsData.models[i]["modelID"] === chooseModalID){
                $("#edit_model_name").val(_extModelsData.models[i].modelName)
            }
        }
        $('#modalCreateEdit').modal('show')
    });
    $("#btnCreateEdit").on('click',()=>{
        if($("#edit_model_name").val()){
            let modelName = $("#edit_model_name").val()
            for (let i = 0; i < _extModelsData.models.length; i++) {
                if (_extModelsData.models[i]["modelID"] === chooseModalID) {
                    _extModelsData.models[i].modelName = modelName
                    saveExtModelsData();
                    clearTableTagMarks();
                    resetPanel();
                    $("li[modelid="+chooseModalID+"] .list-group-item-title").html(modelName)
                    $('#modalCreateEdit').modal('hide')
                    break
                }
            }
        }else{
            alert('模型名称必填')
        }
    })
    // 选择Radio被点击
    $("input[name='panelRadio'][type='radio']").on("click", function(){
        $(".p-clip .f-clear-tag").remove();
        const clearbtn = $('<button class="f-clear-tag float-right btn btn-xs iconfont">&#xe660;</button>');
        $(this).parent().append(clearbtn)
        clearbtn.on("click", function(){
            clearTagSelected();
            $(this).remove();
        });
        const panelRadioVal = $("input[name='panelRadio'][type='radio']:checked").val();
        if (panelRadioVal === 'valueRangeStart0') {
            chooseStandard=true
        }else{
            chooseStandard=false
        }
        if("valueVirtualKey" !== panelRadioVal && "key" !== panelRadioVal){
            $("#divSetKeyType").hide();
            $("#divSetKeyTypeBoolValue").hide();
        }
    });
    //解析按钮点击
    $('#parse_table').on('click', function () {
        window.LS.set('parseModel', JSON.stringify(_currentModel))
        window.LS.set('fromAuto', 0)
        window.LS.set('original_file', _currentProjFileData['original_file'])
        window.location.href = 'parse.html'
        zipqby(_currentProjFileData["name"]);
    })
    //解析普通表格
    $('#parse_common_table').on('click', function () {
        window.LS.set('parseModel', JSON.stringify(_currentModel))
        window.LS.set('fromAuto', 0)
        window.LS.set('original_file', _currentProjFileData['original_file'])
        window.location.href = 'parse_table.html'
        zipqby(_currentProjFileData["name"]);
    })
    /**
     * 解析汇总
     */
    $('#parse_common_table1').on('click', function () {
        window.LS.set('parseModel', JSON.stringify(_currentModel))
        window.LS.set('parseModelAll', JSON.stringify(_extModelsData.models))
        window.LS.set('fromAuto', 0)
        window.LS.set('original_file', _currentProjFileData['original_file'])
        if(_extModelsData.models&&_extModelsData.models[0]){
            window.location.href = 'newParse.html'
            zipqby(_currentProjFileData["name"]);
        }else{
            alert('请您先创建模版')
        }
    })
    let timer_iptKeyTypeBoolValue;
    $("#iptKeyTypeBoolValue").on("keyup", function(){
        const val = $(this).val();
        window.clearTimeout(timer_iptKeyTypeBoolValue);
        timer_iptKeyTypeBoolValue = window.setTimeout(function (){
            const acell = $(".extractor_table td.active");
            const uid = acell.attr("_key_uid");
            _currentModel["keys"][getKeyIndexFromCurrentModel(uid)].typeBoolSetTrueText = val;
            saveCurrentModel();
        }, 300);
    });
    //阻止浏览器默认右键点击事件
    $(".extractor_table").bind("contextmenu", function(){
        return false;
    })
    $(".extractor_table")[0].addEventListener('scroll', AnimEvent.add(function() {
        for(let i=0; i<_LINES.length; i++){
            _LINES[i].position();
        }
    }), false);
    $(".extractor_table").on("mouseover", "table td:not(.headline)", function(){
        let tbl = $(this).parents("table");
        tbl.find("td.headline-light").removeClass("headline-light");
        tbl.find("td.headline[X='"+$(this).attr("X")+"']").addClass("headline-light");
        tbl.find("td.headline[Y='"+$(this).attr("Y")+"']").addClass("headline-light");
    });
    $("#btnArchive").on("click", function(){
        zipqby(_currentProjFileData["name"], function (path){
            alert("生成可共享模型文件成功！");
            _shell.showItemInFolder(path);
        });
    });
    //****************表格被点击*******  */
    _freelinkLR = [];
    $(".extractor_table").on("mousedown", "td", function (e) {
        if ($(this).hasClass("headline")) return;
        if($(this).hasClass("headline"))return;
        $(".extractor_table").find("td.active").removeClass("active");
        $(this).addClass("active");
        let tbl = $(this).parents("table");
        const panelRadioVal = $("input[name='panelRadio'][type='radio']:checked").val();
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
                checkStartSettedAndThen();
            }
            if (panelRadioVal === "key"||panelRadioVal==='valueRangeStart0') {
                const rxy = [parseInt($(this).attr("X")) - startX, parseInt($(this).attr("Y")) - startY];
                if (!_currentModel.hasOwnProperty("keys")) {
                    _currentModel["keys"] = []
                }
                if (3 === e.which) { //右键为3
                    if(chooseStandard){
                        const uid = $(this).attr("_key_uid");
                        if ($(this).hasClass("_EM_key_standard")) {
                            $(this).removeClass("_EM_key_standard");
                            $.each(_currentModel["keys"],function (index,item) {
                                if(item._id===uid){
                                    delete item.nameS
                                }
                            })
                        }
                    }else{
                        if ($(this).hasClass("_EM_key")) {
                            $(this).removeClass("_EM_key");
                            if ($(this).hasClass("_EM_key_standard")) {
                                $(this).removeClass("_EM_key_standard");
                            }
                            const uid = $(this).attr("_key_uid");
                            _currentModel["keys"].splice(getKeyIndexFromCurrentModel(uid), 1);
                        }
                    }
                    $("#divSetKeyType").hide();
                    $("#divSetKeyTypeBoolValue").hide();
                }else if(1 === e.which){ //左键为1
                    let keyType = "Vchar";
                    $("#divSetKeyType").show();
                    if(chooseStandard){
                        if (!$(this).hasClass("_EM_key_standard")) {
                            if($(this).hasClass("_EM_key")){
                                const uid = $(this).attr("_key_uid");
                                $(this).addClass("_EM_key_standard").attr("_key_uid", uid);
                                $.each(_currentModel["keys"],function (index,item) {
                                    if(item._id===uid){
                                        item.nameS='standard'
                                    }
                                })
                            }else{
                                const uid = _uuid();
                                $(this).addClass("_EM_key_standard").attr("_key_uid", uid);
                                $(this).addClass("_EM_key").attr("_key_uid", uid);
                                let model = {
                                    _id: uid,
                                    position: rxy,
                                    type: keyType,
                                    nameS:'standard',
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
                    }else{
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
            } else {
                $("#divSetKeyType").hide();
            }
            if(panelRadioVal === "midkey"){
                const rxy = [parseInt($(this).attr("X"))-startX,parseInt($(this).attr("Y"))-startY];
                if(!_currentModel.hasOwnProperty("middleKeys")){_currentModel["middleKeys"]=[]}
                if (3 === e.which) {
                    if($(this).hasClass("_EM_mid_key")){
                        $(this).removeClass("_EM_mid_key");
                        const uid = $(this).attr("_key_uid");
                        _currentModel["middleKeys"].splice( getMidKeyIndexFromCurrentModel(uid) , 1);
                    }
                }else if(1 === e.which){
                    let keyType = "Vchar";
                    if(!$(this).hasClass("_EM_mid_key")){
                        const uid = _uuid();
                        $(this).addClass("_EM_mid_key").attr("_key_uid", uid);
                        let model = {
                            _id : uid,
                            position : rxy,
                            type : keyType,
                            name : $(this).text()
                        };
                        if($(this).attr("colspan")){
                            if(parseInt($(this).attr("colspan"))>1){
                                model.colspan = parseInt($(this).attr("colspan"))
                            }
                        }
                        if($(this).attr("rowspan")){
                            if(parseInt($(this).attr("rowspan"))>1){
                                model.colspan = parseInt($(this).attr("rowspan"))
                            }
                        }
                        _currentModel["middleKeys"].push(model);
                    }
                }
                saveCurrentModel();
            }else{
                $("#divSetKeyType").hide();
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
                                width:10,
                                height:10,
                                size: 1.8,
                                startPlugSize: 1,
                                endPlugSize: 1,
                                outlineSize:'3px',
                                startPlugColor: '#ff3792',
                                endPlugColor: '#ff1a26',
                                gradient: true,
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
                    $("#divSetKeyType").hide();
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
                    $("#divSetKeyType").show();
                    if(keyType === "Bool"){
                        $("#divSetKeyTypeBoolValue").show();
                    }else{
                        $("#divSetKeyTypeBoolValue").hide();
                    }
                }
            }
        }
    })

    $(document.body).on("change", "#selSetKeyType", function(){
        const keyType = $(this).val();
        const acell = $(".extractor_table td.active");
        acell.removeClass("_TYPE_Int _TYPE_Float _TYPE_Bool _TYPE_Date _TYPE_DateTime")
            .addClass("_TYPE_").addClass("_TYPE_"+keyType);
        const uid = acell.attr("_key_uid");
        if(acell.hasClass("_EM_mid_key")){
            _currentModel["middleKeys"][getMidKeyIndexFromCurrentModel(uid)].type = keyType;
        }else if(acell.hasClass("_EM_key")){
            _currentModel["keys"][getKeyIndexFromCurrentModel(uid)].type = keyType;
        }
        saveCurrentModel();
        if(keyType!=="Bool"){
            $("#divSetKeyTypeBoolValue").hide()
        }else{
            $("#divSetKeyTypeBoolValue").show()
        }
    });
    $("#iptKeyTypeBoolValue").on("keyup", function(){
        const val = $(this).val();
        window.clearTimeout(timer_iptKeyTypeBoolValue);
        timer_iptKeyTypeBoolValue = window.setTimeout(function (){
            const acell = $(".extractor_table td.active");
            const uid = acell.attr("_key_uid");
            _currentModel["keys"][getKeyIndexFromCurrentModel(uid)].typeBoolSetTrueText = val;
            saveCurrentModel();
        }, 300);
    });

    // 删除并重新上传
    $("#btnReupload").on("click", function(){
        if(confirm("确认要删除模板和提取模型并重新上传？")){
            try{
                _fs.unlinkSync(_path.join(_currentProj["projPath"], _currentProjFileData["original_file"]));
                _fs.unlinkSync(_path.join(_currentProj["projPath"], _currentProjFileData["table_file"]));
            }catch(e){}
            try{
                _fs.unlinkSync(_path.join(_path.join(_currentProj["projPath"], "models"),
                             _currentProjFileData["models"]["extractorModel"]));
            }catch(e){}
            try{
                _fs.unlinkSync(_path.join(_path.join(_currentProj["projPath"], "models"),
                             _currentProjFileData["models"]["metadataModel"]));
            }catch(e){}
            _currentProjFileData["original_file"] = "";
            _currentProjFileData["table_file"] = "";
            _fse.writeJsonSync(_currentProjFile, _currentProjFileData);
            window.location.href = "upload_file.html";
        }else{}
    });

    $("#submitPreviewSplitStringToTable").on("click", function (){
        const type = $("#selSplitStringToTableType").val();
        const reg = getConfigRegForSplitStringToTable(type);
        const str = $("._EM_selected_spical_cell").text();
        const strArr = str.trim().split(reg);
        let tdsHtml = '<tr>';
        for(let i =0 ; i<strArr.length; i++){
            tdsHtml+= '<td>'+strArr[i]+'</td>';
        }
        tdsHtml += '</tr>';
        $("#previewSplitStringToTable").html(tdsHtml);
    })

    $("#submitSaveSplitStringToTable").on("click", function (){
        const type = $("#selSplitStringToTableType").val();
        const reg = getConfigRegForSplitStringToTable(type);
        let tbl = getCurrentModelTable();
        const sX = parseInt(tbl.find("td._EM_value_start").attr("X"));
        const sY = parseInt(tbl.find("td._EM_value_start").attr("Y"));
        const eX = parseInt(tbl.find("td._EM_value_end").attr("X"));
        const eY = parseInt(tbl.find("td._EM_value_end").attr("Y"));
        tbl.find("td").filter(function() {
            return  parseInt($(this).attr("X")) >=  sX &&
                    parseInt($(this).attr("Y")) >=  sY &&
                    parseInt($(this).attr("X")) <=  eX &&
                    parseInt($(this).attr("Y")) <=  eY
        });
        const str = $("._EM_selected_spical_cell").text();
        const strArr = str.trim().split(reg);
        let tdsHtml = '<tr>';
        for(let i =0 ; i<strArr.length; i++){
            tdsHtml+= '<td>'+strArr[i]+'</td>';
        }
        tdsHtml += '</tr>';
        $("#previewSplitStringToTable").html(tdsHtml);
    })
    function getConfigRegForSplitStringToTable(type){
        let reg = /\s+/;
        if("2space" === type){
            reg = /\s{2,}/;
        }
        if("3space" === type){
            reg = /\s{3,}/;
        }
        if("4space" === type){
            reg = /\s{4,}/;
        }
        if("tab" === type){
            reg = /\t/;
        }
        if("comma" === type){
            reg = /\,/;
        }
        return reg;
    }
});
let startX=0,startY=0;
$("#btnTagLink1").on("change", function () {
    _freelinkLR=[]
})
function renderExtractorEffect(modelID) {
    _currentModel = getModelData(modelID);
    let modelType = _currentModel["modelType"];
    resetPanel();
    $(".p-clip-" + modelType).show();
    $('td').removeClass('_EM_key_standard')
    clearTableTagMarks();
    let tbl = getCurrentModelTable();
    if(_currentModel.hasOwnProperty("startCell")){
        tbl.find("td[X='"+_currentModel["startCell"][0]+"'][Y='"+_currentModel["startCell"][1]+"']").addClass("_EM_start");
        startX=_currentModel["startCell"][0];
        startY=_currentModel["startCell"][1];
    }
    checkStartSettedAndThen();
    if(_currentModel.hasOwnProperty("values") && _currentModel["values"].length>0){
        for(let i=0; i<_currentModel["values"].length; i++){
            const rxy = _currentModel["values"][i]["position"];
            const cell = tbl.find("td[X='" + (rxy[0] + startX) + "'][Y='" + (rxy[1] + startY) + "']");
            cell.addClass("_EM_value").attr("_val_uid", _currentModel["values"][i]["_id"]).data("rxy", rxy);
            if(_currentModel["values"][i].nameS){
                cell.addClass('_EM_key_standard')
            }
        }
    }
    if(_currentModel.hasOwnProperty("valuesStartCell") && _currentModel["valuesStartCell"].length>0){
        const rxy = _currentModel["valuesStartCell"];
        tbl.find("td[X='"+(rxy[0]+startX)+"'][Y='"+(rxy[1]+startY)+"']")
            .addClass("_EM_value_start");
    }
    if(_currentModel.hasOwnProperty("valuesEndCell") && _currentModel["valuesEndCell"].length>0){
        const rxy = _currentModel["valuesEndCell"];
        tbl.find("td[X='"+(rxy[0]+startX)+"'][Y='"+(rxy[1]+startY)+"']")
            .addClass("_EM_value_end");
        renderValuesRange(tbl);
    }
    if(_currentModel.hasOwnProperty("keys") && _currentModel["keys"].length>0){ //
        for(let i=0; i<_currentModel["keys"].length; i++){
            const rxy = _currentModel["keys"][i]["position"];
            const cell = tbl.find("td[X='"+(rxy[0]+startX)+"'][Y='"+(rxy[1]+startY)+"']");
            cell.attr("_key_uid", _currentModel["keys"][i]["_id"]).data("rxy",rxy);
            if(_currentModel["keys"][i].hasOwnProperty("virtualKey") && _currentModel["keys"][i]["virtualKey"]){
                cell.addClass("_EM_virtual_key")
            } else {
                if(_currentModel["keys"][i].nameS){
                    cell.addClass("_EM_key")
                    cell.addClass("_EM_key_standard")
                }else{
                    cell.addClass("_EM_key")
                    if(cell.hasClass('_EM_key_standard')){
                        cell.removeClass('_EM_key_standard')
                    }
                }
            }
            if(_currentModel["keys"][i].type !== "Vchar"){
                cell.addClass("_TYPE_").addClass("_TYPE_"+_currentModel["keys"][i].type);
            }
            if (_currentModel["keys"][i].hasOwnProperty("targetId")) {
                let targetInfo = _currentModel["values"][getValueIndexFromCurrentModel(_currentModel["keys"][i]["targetId"])];
                const cellB = tbl.find("td[X='" + (targetInfo["position"][0] + startX) + "'][Y='" + (targetInfo["position"][1] + startY) + "']");
                let line = new LeaderLine($("#"+cell[0].id+'test'+cell.attr('tableIndex'))[0], $("#"+cellB[0].id+'test'+cellB.attr('tableIndex'))[0], {
                    "showEffectName": "draw",
                    endPlug: 'arrow1',
                    path:'straight',
                    width:10,
                    height:10,
                    size: 1.8,
                    startPlugSize: 1,
                    endPlugSize: 1,
                    outlineSize:'3px',
                    startPlugColor: '#ff3792', // 渐变色开始色
                    endPlugColor: '#ff1a26',// 渐变色结束色
                    gradient: true, // 使用渐变色
                });
                cell.data("_EM_line", line);
                cell.data("_EM_line_target", cellB);
                _LINES.push(line);
            }
        }
    }
    if(_currentModel.hasOwnProperty("middleKeys") && _currentModel["middleKeys"].length>0){ //
        for(let i=0; i<_currentModel["middleKeys"].length; i++){
            const rxy = _currentModel["middleKeys"][i]["position"];
            const cell = tbl.find("td[X='"+(rxy[0]+startX)+"'][Y='"+(rxy[1]+startY)+"']");
            cell.attr("_key_uid", _currentModel["middleKeys"][i]["_id"]).data("rxy",rxy);
            cell.addClass("_EM_mid_key");
        }
    }
    if(_currentModel.hasOwnProperty("loopEnd")){
        tbl.find("td[X='"+(_currentModel["loopEnd"][0]+startX)+"'][Y='"+(_currentModel["loopEnd"][1]+startY)+"']")
            .addClass("_EM_loop_end");
    }
}

function renderValuesRange(tbl){
    tbl.find("td._EM_value").removeClass("_EM_value");
    if(tbl.find("td._EM_value_start").length>0 && tbl.find("td._EM_value_end").length>0){
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
function getKeyIndexFromCurrentModel(uid){
    for(let i =0; i<_currentModel["keys"].length; i++){
        if(uid === _currentModel["keys"][i]._id){
            return i
        }
    }
}
function getMidKeyIndexFromCurrentModel(uid){
    for(let i =0; i<_currentModel["middleKeys"].length; i++){
        if(uid === _currentModel["middleKeys"][i]._id){
            return i
        }
    }
}
function getValueIndexFromCurrentModel(uid){
    for(let i =0; i<_currentModel["values"].length; i++){
        if(uid === _currentModel["values"][i]._id){
            return i
        }
    }
}
function clearTableTagMarks(){
    $(".extractor_table td")
        .removeClass("active _TYPE_ _TYPE_Int _TYPE_Float _TYPE_Bool _TYPE_Date _TYPE_DateTime _EM_start _EM_key _EM_value _EM_loop_end _EM_value_start _EM_value_end _EM_selected_spical_cell _EM_selected_virtual_key_cell _EM_virtual_key");
    $(".extractor_table td").removeAttr(" _key_uid");
    $(".extractor_table td").removeData("_EM_line").removeData("_EM_line_target").removeData("rxy");
    clearTagSelected();
    for(let i=0; i<_LINES.length; i++){
        _LINES[i].remove();
    }
    _LINES = [];
}
function clearTagSelected(){
    $("input[name='panelRadio'][type='radio']:checked").prop("checked", false);
    $(".p-clip .f-clear-tag").remove();
}
function resetPanel(){
    $("#selSetKeyType").val("Vchar");
    clearTagSelected();
    $(".p-clip").hide();
}
function checkStartSettedAndThen(){
    if($(".extractor_table td._EM_start").length<1){
        $("input[name='panelRadio'][type='radio']").not("[value='start']").attr("disabled", "disabled");
    }else{
        $("input[name='panelRadio'][type='radio']").not("[value='start']").removeAttr("disabled");
    }
}
function getModelData(modelID){
    for(let i=0; i<_extModelsData.models.length; i++){
        if(_extModelsData.models[i]["modelID"] === modelID){
            return _extModelsData.models[i];
        }
    }
}
function loadExtractor(){
    for(let i=0; i<_extModelsData.models.length; i++){
        insertModal(_extModelsData.models[i]);
    }
    $(".f-model-list").eq(0).trigger("click");
    checkAndRestPanelUI();
}
function checkAndRestPanelUI(){
    if(_extModelsData.models.length>0){
        $("#boxNextCreateNewModel").append($("#btnCreateNewModel"));
        $(".l-panel").removeClass("fy-flex")
    }else{
        $("#panelContent .p-clip").hide();
        $("#panelContent").append($("#btnCreateNewModel"));
        $(".l-panel").addClass("fy-flex")
    }
}
function insertModal(modal){
    const modalLi = $('<li class="list-group-item list-group-item-dark fy-flex fy-between fy-middle" '
                 +' modelID="'+modal['modelID']+'" modelType="'+modal['modelType']+'"><span class="list-group-item-title fy-bigger-enabled">'+modal['modelName']+'</span>'
                 +'<button class="btn btn-sm edit-btn  iconfont">&#xe623;</button><button class="btn btn-sm close-btn iconfont">&#xe60c;</button></li>');
    $(".f-model-list").append(modalLi);
}
function saveCurrentModel(){
    for(let i=0; i<_extModelsData.models.length; i++){
        if(_extModelsData.models[i]["modelID"] === _currentModel["modelID"]){
            _extModelsData.models[i] = _currentModel;
        }
    }
    saveExtModelsData();
}
function getCurrentModelTable(){
    let tableIndex = 1;
    if(_currentModel.hasOwnProperty("tableIndex")){
        tableIndex = parseInt(_currentModel["tableIndex"]);
    }
    return $(".extractor_table table").eq(tableIndex-1);
}
function saveExtModelsData(){
    _fse.writeJsonSync(_extractorModelFile, _extModelsData);
}
function createCoordinate(container){
    container.find("table").each(function(i){
        let tbl = $(this);
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
        for(let y=0; y<tbl.find("tr").length; y++){
            let tr= tbl.find("tr").eq(y);
            let _x = 0;
            for(let x=0; x< tr.find("td").length; x++){
                let td= tr.find("td").eq(x);
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
function processPoints(points, relation, type = 'top') {
    const colspanKeys = points.filter(item => item.hasOwnProperty('colspan'))
    colspanKeys.forEach(key => {
        const colspan = key['colspan']
        const addKeys = [...Array(colspan - 1).keys()].map(item => {
            return {...key, position: [key['position'][0] + item + 1, key['position'][1]]}
        })
        points = points.concat(addKeys)
    })
    const rowspanKeys = points.filter(item => item.hasOwnProperty('rowspan'))
    rowspanKeys.forEach(key => {
        const rowspan = key['rowspan']
        const addKeys = [...Array(rowspan - 1).keys()].map(item => {
            return {...key, position: [key['position'][0], key['position'][1] + item + 1]}
        })
        points = points.concat(addKeys)
    })
    points.sort((a, b) => {
        return a['position'][1] === b['position'][1] ? a['position'][0] - b['position'][0] : a['position'][1] - b['position'][1]
    })
    const allKeys = _.groupBy(points, `position.${ type === 'top' || type === 'common' ? 0 : 1 }`), relations = {head: [], tail: []}
    Object.values(allKeys).forEach(allKey => {
        allKey.reduce((prev, cur, index) => {
            const obj = {
                _id: cur['_id'],
                pid: _.isObject(prev) ? prev['_id'] : '-1',
                name: cur['name']
            }
            const o = {_id: cur['_id']}
            if(index === 0) {
                relations['head'].push(o)
            }
            if(index === allKey.length - 1) {
                if(type === 'left') {
                    obj.y = _.get(cur, 'position.1')
                }
                if(type === 'top') {
                    obj.x = _.get(cur, 'position.0')
                }
                relations['tail'].push(o)
            }
            if(obj.pid === '-1' && type === 'top') {
            } else {
                relation.push(obj)
            }
            return cur
        }, null)
    })

    return relations
}
(function ($) {
    /* { left: x-coord, top: y-coord } */
    function scanTable( $table ) {
        let m = [];
        $table.children( "tr" ).each( function( y, row ) {
            $( row ).children( "td, th" ).each( function( x, cell ) {
                let $cell = $( cell ),
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
                let pos = { Y: y, X: x };
                $cell.data( "cellPos", pos );
            } );
        } );
    };
    /* 输出plugin */
    $.fn.cellPos = function( rescan ) {
        let $cell = this.first(),
            pos = $cell.data( "cellPos" );
        if( !pos || rescan ) {
            let $table = $cell.closest( "table, thead, tbody, tfoot" );
            scanTable( $table );
        }
        pos = $cell.data( "cellPos" );
        return pos;
    }
})(jQuery);
