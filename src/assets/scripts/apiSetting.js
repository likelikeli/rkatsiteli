$(function (){
    let _uuid = require('uuid-random')
    const _path = require("path");
    const _shell = require('electron').shell
    function saveExtModelsData(){
        _fse.writeJsonSync(_extractorModelFile, _extModelsData);
    }
    let _currentProj = JSON.parse(window.LS.get("CurrentProj"));
    let _extractorModelFile = _path.join(_path.join(_currentProj["projPath"],"models"),"apiSchemaModal.json");
    _fse.ensureFileSync(_extractorModelFile);
    let dataSource ={}
    let _extModelsData = _fse.readJsonSync(_extractorModelFile, {throws: false});
    if (_extModelsData == null) {
        _extModelsData = {
            "type": "object",
            "properties":{"feild_1":{"type":"string"}}
        };
        saveExtModelsData();
        dataSource = _extModelsData
    }else{
        dataSource = _extModelsData
    }
    let addUuid = (dd)=>{
        dd.uuid = _uuid()
        for(let k in dd){
            if(typeof dd[k] == 'object'){
                addUuid(dd[k])
            }
        }
    }
    addUuid(dataSource)
    let widthsNow= 296
    let paddingLeft=0
    let rootNow = true
    let index=0
    let chooseData = {}
    /**
     * 默认渲染
     * @param data
     * @param widths
     * @param rootNow
     * @param padding
     * @param htmlId
     * @param keys
     */
    let fillingData=(data,widths,rootNow,padding,htmlId,keys)=>{
        index++
        let nowId = 'outputBox'+index
        let nowI1d = nowId+index
        let noneStyle = 'block'
        if(data&&data.type!='object'&&data.type!='array'){
            noneStyle= 'none'
        }
        if(typeof data == 'object'){
            if(rootNow){
                let title = data&&data.title?data.title:''
                let htmlNow='<div id="'+nowId+'"><div class="fy-flex flexBox" >' +
                    '                <div class="outShow">' +
                    '                    <div class="outShowClose" style="display: '+noneStyle+'"></div>' +
                    '                </div>' +
                    '                <div style="width:'+widths+'px">' +
                    '                    <input class="form-control inputChangeN" uuid="'+data.uuid+'" disabled value="root" type="text" placeholder="请输入字段名称">' +
                    '                </div>' +
                    '                <div class="ml-2" style="width:294px">' +
                    '                    <select class="form-select checkType" uuid="'+data.uuid+'" id="'+nowI1d+'" v-value="'+data.type+'" >' +
                    '                        <option value="">请您选择字段类型</option>' +
                    '                        <option value="object">Object</option>' +
                    '                        <option value="array">Array</option>' +
                    '                        <option value="string">String</option>' +
                    '                        <option value="boolean">Boolean</option>' +
                    '                        <option value="number">Number</option>' +
                    '                        <option value="integer">Integer</option>' +
                    '                    </select>' +
                    '                </div>' +
                    '                <div class="ml-2" style="width:294px">' +
                    '                    <input class="form-control inputChangeN1" uuid="'+data.uuid+'" value="'+title+'" type="text" placeholder="请输入标题">' +
                    '                </div>' +
                    '                <div class="ml-2 " style="width:30px">' +
                    '                    <div class="jse--setting" uuid="'+data.uuid+'" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg class="icon" width="1.5em" height="1.5em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#1296db" d="M439.264 208a16 16 0 0 0-16 16v67.968a239.744 239.744 0 0 0-46.496 26.896l-58.912-34a16 16 0 0 0-21.856 5.856l-80 138.56a16 16 0 0 0 5.856 21.856l58.896 34a242.624 242.624 0 0 0 0 53.728l-58.88 34a16 16 0 0 0-6.72 20.176l0.848 1.68 80 138.56a16 16 0 0 0 21.856 5.856l58.912-34a239.744 239.744 0 0 0 46.496 26.88V800a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-67.968a239.744 239.744 0 0 0 46.512-26.896l58.912 34a16 16 0 0 0 21.856-5.856l80-138.56a16 16 0 0 0-4.288-20.832l-1.568-1.024-58.896-34a242.624 242.624 0 0 0 0-53.728l58.88-34a16 16 0 0 0 6.72-20.176l-0.848-1.68-80-138.56a16 16 0 0 0-21.856-5.856l-58.912 34a239.744 239.744 0 0 0-46.496-26.88V224a16 16 0 0 0-16-16h-160z m32 48h96v67.376l28.8 12.576c13.152 5.76 25.632 12.976 37.184 21.52l25.28 18.688 58.448-33.728 48 83.136-58.368 33.68 3.472 31.2a194.624 194.624 0 0 1 0 43.104l-3.472 31.2 58.368 33.68-48 83.136-58.432-33.728-25.296 18.688c-11.552 8.544-24.032 15.76-37.184 21.52l-28.8 12.576V768h-96v-67.376l-28.784-12.576c-13.152-5.76-25.632-12.976-37.184-21.52l-25.28-18.688-58.448 33.728-48-83.136 58.368-33.68-3.472-31.2a194.624 194.624 0 0 1 0-43.104l3.472-31.2-58.368-33.68 48-83.136 58.432 33.728 25.296-18.688a191.744 191.744 0 0 1 37.184-21.52l28.8-12.576V256z m47.28 144a112 112 0 1 0 0 224 112 112 0 0 0 0-224z m0 48a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" /></svg></div>' +
                    '                </div>' +
                    '                <div class="ml-2" style="width:30px"><div class="jse--plus" uuid="'+data.uuid+'">+</div></div>' +
                    '            </div></div>'
                $('#'+htmlId).append(htmlNow)
                $("#"+nowI1d).val($("#"+nowI1d).attr('v-value'))
                if(data.type=='object'||data.type=='array'){
                    widths=widths - 24
                    padding=padding + 24
                    if(data&&data.type=='object'){
                        for(let k in data.properties){
                            fillingData(data.properties[k],widths,false,padding,nowId,k)
                        }
                    }else if(data&&data.type=='array'){
                        for(let k in data){
                            if(typeof data[k] == 'object'){
                                fillingData(data[k],widths,false,padding,k)
                            }
                        }
                    }
                }
            }else{
                let nowId = 'outputBox'+index
                let nowI1d = nowId+index
                let type= data&&data.type?data.type:''
                let title = data&&data.title?data.title:''
                let htmlNow= '<div id="'+nowId+'"><div class="flexBox" style="padding-left:'+padding+'px;margin-top:5px;">' +
                    '                <div class="fy-flex" >' +
                    '                    <div class="outShow">' +
                    '                        <div class="outShowClose" style="display: '+noneStyle+'"></div>' +
                    '                    </div>' +
                    '                    <div style="width:'+widths+'px;">' +
                    '                        <input class="form-control inputChangeN" uuid="'+data.uuid+'" value="'+keys+'" type="text" placeholder="请输入字段名称">' +
                    '                    </div>' +
                    '                    <div class="ml2" style="width:294px">' +
                    '                        <select class="form-select checkType" uuid="'+data.uuid+'" id="'+nowI1d+'" v-value="'+type+'" >' +
                    '                            <option value="">请您选择字段类型</option>' +
                    '                            <option value="object">Object</option>' +
                    '                            <option value="array">Array</option>' +
                    '                            <option value="string">String</option>' +
                    '                            <option value="boolean">Boolean</option>' +
                    '                            <option value="number">Number</option>' +
                    '                            <option value="integer">Integer</option>' +
                    '                        </select>' +
                    '                    </div>' +
                    '                    <div class="ml2" style="width:294px">' +
                    '                        <input class="form-control inputChangeN1" uuid="'+data.uuid+'" value="'+title+'" type="text" placeholder="请输入标题">' +
                    '                    </div>' +
                    '                    <div class="ml2 " style="width:30px">' +
                    '                        <div class="jse--setting" uuid="'+data.uuid+'" data-bs-toggle="modal" data-bs-target="#exampleModal"><svg class="icon" width="1.5em" height="1.5em" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="#1296db" d="M439.264 208a16 16 0 0 0-16 16v67.968a239.744 239.744 0 0 0-46.496 26.896l-58.912-34a16 16 0 0 0-21.856 5.856l-80 138.56a16 16 0 0 0 5.856 21.856l58.896 34a242.624 242.624 0 0 0 0 53.728l-58.88 34a16 16 0 0 0-6.72 20.176l0.848 1.68 80 138.56a16 16 0 0 0 21.856 5.856l58.912-34a239.744 239.744 0 0 0 46.496 26.88V800a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16v-67.968a239.744 239.744 0 0 0 46.512-26.896l58.912 34a16 16 0 0 0 21.856-5.856l80-138.56a16 16 0 0 0-4.288-20.832l-1.568-1.024-58.896-34a242.624 242.624 0 0 0 0-53.728l58.88-34a16 16 0 0 0 6.72-20.176l-0.848-1.68-80-138.56a16 16 0 0 0-21.856-5.856l-58.912 34a239.744 239.744 0 0 0-46.496-26.88V224a16 16 0 0 0-16-16h-160z m32 48h96v67.376l28.8 12.576c13.152 5.76 25.632 12.976 37.184 21.52l25.28 18.688 58.448-33.728 48 83.136-58.368 33.68 3.472 31.2a194.624 194.624 0 0 1 0 43.104l-3.472 31.2 58.368 33.68-48 83.136-58.432-33.728-25.296 18.688c-11.552 8.544-24.032 15.76-37.184 21.52l-28.8 12.576V768h-96v-67.376l-28.784-12.576c-13.152-5.76-25.632-12.976-37.184-21.52l-25.28-18.688-58.448 33.728-48-83.136 58.368-33.68-3.472-31.2a194.624 194.624 0 0 1 0-43.104l3.472-31.2-58.368-33.68 48-83.136 58.432 33.728 25.296-18.688a191.744 191.744 0 0 1 37.184-21.52l28.8-12.576V256z m47.28 144a112 112 0 1 0 0 224 112 112 0 0 0 0-224z m0 48a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" /></svg></div>' +
                    '                    </div>'
                if(data&&data.type=='object'){
                    htmlNow+= '<div class="ml2" style="width:30px;"><div uuid="'+data.uuid+'" class="jse--plus">+</div></div>'
                }else{
                    htmlNow+= '<div class="ml2" style="width:30px;display: none"><div uuid="'+data.uuid+'" class="jse--plus">+</div></div>'
                }
                htmlNow+=
                    '<div class="ml2" style="width:30px"><div uuid="'+data.uuid+'" class="jse--delete">&times;</div></div>' +
                    '</div></div></div>'
                $('#'+htmlId).append(htmlNow)
                $("#"+nowI1d).val($("#"+nowI1d).attr('v-value'))
                if(data&&data.type=='object'||data&&data.type=='array'){
                    widths=widths - 24
                    padding=padding + 24
                    if(data&&data.type=='array'){
                        for(let k in data){
                            if(typeof data[k] == 'object'){
                                fillingData(data[k],widths,false,padding,nowId,k)
                            }
                        }
                    }else if(data&&data.type=='object'){
                        if(data.properties){
                            for(let k in data.properties){
                                fillingData(data.properties[k],widths,false,padding,nowId,k)
                            }
                        }
                    }
                }
            }
        }
    }
    fillingData(dataSource,widthsNow,rootNow,paddingLeft,'outputBox')
    /**
     * 隐藏文件夹
     */
    $(document).on('click','.outShowClose',function (){
        $(this).addClass('outShowOpen')
        $(this).removeClass('outShowClose')
        $(this).parents('.flexBox').siblings().css('display','none')
    })
    /**
     * 展开文件夹
     */
    $(document).on('click','.outShowOpen',function (){
        $(this).addClass('outShowClose')
        $(this).removeClass('outShowOpen')
        $(this).parents('.flexBox').siblings().css('display','block')
    })
    /**
     * 设置属性以及自定义属性modal显示
     */
    $(document).on('click','.jse--setting',async function (){
        await returnDa($(this).attr('uuid'),dataSource)
        $(".numberBox").css('display','none')
        $(".objectBox").css('display','none')
        $(".arrayBox").css('display','none')
        $(".stringBox").css('display','none')
        if(chooseData.description){
            $("#description").val(chooseData.description)
        }
        if(chooseData.type=='object'){
            $(".objectBox").css('display','block')
            if(chooseData.minProperties){
                $("#minProperties").val(chooseData.minProperties)
            }
            if(chooseData.maxProperties){
                $("#maxProperties").val(chooseData.maxProperties)
            }
        }else if(chooseData.type=='array'){
            $(".arrayBox").css('display','block')
            if(chooseData.minItems){
                $("#minItems").val(chooseData.minItems)
            }
            if(chooseData.maxItems){
                $("#maxItems").val(chooseData.maxItems)
            }
        }else if(chooseData.type=='string'){
            $(".stringBox").css('display','block')
            if(chooseData.minLength){
                $("#minLength").val(chooseData.minLength)
            }
            if(chooseData.maxLength){
                $("#maxLength").val(chooseData.maxLength)
            }
            if(chooseData.pattern){
                $("#pattern").val(chooseData.pattern)
            }
            if(chooseData.format){
                $("#format").val(chooseData.format)
            }
        }else if(chooseData.type=='number'||chooseData.type=='Integer'){
            $(".numberBox").css('display','block')
            if(chooseData.minimum){
                $("#minimum").val(chooseData.minimum)
            }
            if(chooseData.maximum){
                $("#maximum").val(chooseData.maximum)
            }
            if(chooseData.exclusiveMinimum){
                $("#exclusiveMinimum").attr('checked',true)
            }
            if(chooseData.exclusiveMaximum){
                $("#exclusiveMaximum").attr('checked',true)
            }
        }
        let keyAll=['title','uuid','type','description','minProperties','maxProperties','minItems','maxItems','minLength','maxLength','pattern','format','minimum','maximum','exclusiveMinimum','exclusiveMaximum']
        for(let k in chooseData){
            if(typeof chooseData[k] != 'object'){
                if(keyAll.includes(k)){
                }else{
                    let htmls='<div class="fieldStyle mr2">' +
                        '          <div class="input-group">' +
                        '              <span class="input-group-text groupText">'+k+'</span>' +
                        '              <input class="form-control inputChange" id="'+k+'" type="text" value="'+chooseData[k]+'">' +
                        '          </div>' +
                        '      </div>'
                    $("#customBox").append(htmls)
                }
            }
        }
        $("#exampleModal").modal('show')
        let nowChooseData = JSON.parse(JSON.stringify(chooseData))
        deleteUuid(nowChooseData)
        $("#result").html(JSON.stringify(nowChooseData,null,2))
    })
    $(document).on('click','.closeModal',function (){
        $("#exampleModal").modal('hide')
    })
    $(document).on('click','.close',function (){
        $("#exampleModal").modal('hide')
    })
    /**
     * 自定义属性或者基础数据改变
     */
    $(document).on('change','.inputChange',async function (e){
        await returnDa($(this).parents('.fy-flex').find('.jse--setting').attr('uuid'),dataSource)
        if($(this)[0].type='number'){
            if($(this).val()){
                chooseData[$(this).attr('id')] = parseFloat($(this).val())
            }
        }else{
            chooseData[$(this).attr('id')] = $(this).val()
        }
        let nowChooseData = JSON.parse(JSON.stringify(chooseData))
        deleteUuid(nowChooseData)
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
        $("#result").html(JSON.stringify(nowChooseData,null,2))
    })
    /**
     * 去除uuid
     */
    let deleteUuid =(dd)=>{
        for(let k in dd){
            if(typeof dd[k] =='object'){
                deleteUuid(dd[k])
            }else if(k=='uuid'){
                delete dd[k]
            }
        }
    }
    /**
     * 修改字段名称或者标题
     *
     */
    let fileId = ''
    let returnDa = (uuid,dd,Par,purpose,il)=>{
        if(dd.uuid==uuid){
            if(purpose=='delete'){
                if(Par){
                    delete Par[il]
                }
            }else if(purpose=='updateFiled'){
                chooseData =  Par
                fileId = il
            }else{
                chooseData =  dd
            }
        }else{
            for(let k in dd){
                if(typeof dd[k] =='object'){
                    returnDa(uuid,dd[k],dd,purpose,k)
                }
            }
        }
    }

    $(document).on('change','.inputChangeN',async function (e){
        await returnDa($(this).attr('uuid'),dataSource,'','updateFiled')
        chooseData[$(this).val()] = chooseData[fileId]
        delete chooseData[fileId]
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    $(document).on('change','.inputChangeN1',async function (e){
        await returnDa($(this).attr('uuid'),dataSource)
        chooseData.title = $(this).val()
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    /**
     * 选择数据必须大于最小值或者小于最大值
     */
    $(document).on('change','.checkChange',async function (e){
        if($(this)[0].checked){
            chooseData[$(this).attr('id')] = true
        }else{
            delete chooseData[$(this).attr('id')]
        }
        let nowChooseData = JSON.parse(JSON.stringify(chooseData))
        deleteUuid(nowChooseData)
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
        $("#result").html(JSON.stringify(nowChooseData,null,2))
    })
    /**
     * 新增自定义属性
     */
    let count = 1
    $(document).on('click','.addCustom',function (){
        let htmls='<div class="fieldStyle mr2">' +
            '          <div class="input-group">' +
            '               <span class="input-group-text groupText"><input class="form-control checkChange1" type="text" value="feild_'+count+'" id="feild_'+count+'"></span>' +
            '               <input class="form-control inputChange" type="text" value="">' +
            '               <span class="input-group-text addCustomOver" ><div class="form-check-label">√' +
            '               </div></span>' +
            '           </div>' +
            '       </div>'
        $("#customBox").append(htmls)
        $(".addCustom").attr('disabled','true')
        count++
    })
    /**
     * 自定义属性保存
     */
    $(document).on('click','.addCustomOver',function (){
        $(".addCustom").removeAttr('disabled')
        $(this).parent('.input-group').find('.groupText').html($(this).parent('.input-group').find('.form-control').val())
        $(this).parent('.input-group').find('.inputChange').attr('id',$(this).parent('.input-group').find('.groupText').html())
        $(this).css('display','none')
        chooseData[$(this).parent('.input-group').find('.inputChange').attr('id')] = $(this).parent('.input-group').find('.inputChange').val()
        let nowChooseData = JSON.parse(JSON.stringify(chooseData))
        deleteUuid(nowChooseData)
        $("#result").html(JSON.stringify(nowChooseData,null,2))
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    /**
     * 删除功能
     */
    $(document).on('click','.jse--delete',async function (){
        await returnDa($(this).attr('uuid'),dataSource,'','delete')
        ResetData(dataSource)
        $("#outputBox").html('')
        index=0
        fillingData(dataSource,widthsNow,rootNow,paddingLeft,'outputBox')
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    /**
     * 修改
     */
    $(document).on('change','.checkType',async function (){
        await returnDa($(this).attr('uuid'),dataSource,)
        for(let k in chooseData){
            if(k!='type'&&k!='uuid'){
                delete chooseData[k]
            }
        }
        chooseData.type = $(this).val()
        if(chooseData.type=='object'||chooseData.type=='array'){
            $(this).parents('.fy-flex').find('.outShow').find('div').css('display','block')
            $(this).parents('.fy-flex').find('.outShow').find('div').addClass('outShowOpen')
            $(this).parents('.fy-flex').find('.outShow').find('div').removeClass('outShowClose')
            if(chooseData.type=='object'){
                chooseData.properties ={
                    feild_1:{"type":'string',uuid:_uuid()}
                }
                $(this).parents('.fy-flex').find('.jse--plus').parent('div').css('display','block')
            }else{
                chooseData.items = {"type": "string",uuid:_uuid()}
                $(this).parents('.fy-flex').find('.jse--plus').parent('div').css('display','none')
            }
        }else{

        }
        $("#outputBox").html('')
        index=0
        fillingData(dataSource,widthsNow,rootNow,paddingLeft,'outputBox')
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    /**
     * 新增字段
     */
    $(document).on('click','.jse--plus',async function(){
        await returnDa($(this).attr('uuid'),dataSource,'','add')
        let names = parseInt(Math.random()*10000,10)
        chooseData.properties['field_'+names]= {type:'string',uuid:_uuid()}
        ResetData(dataSource)
        $("#outputBox").html('')
        index=0
        fillingData(dataSource,widthsNow,rootNow,paddingLeft,'outputBox')
        let nowData = JSON.parse(JSON.stringify(dataSource))
        deleteUuid(nowData)
        _extModelsData = nowData
        saveExtModelsData();
    })
    /**
     * 分享
     */
    $(document).on('click','#btnArchive',async function(){
        _shell.showItemInFolder(_extractorModelFile);
    })
})
/**
 * 重制数据
 * @param data
 * @constructor
 */
let ResetData =(data)=>{
    for(let k in data){
        if(k!='properties'){
            if(typeof data[k] =='object'){
                ResetData(data[k])
            }
        }else if(k=='properties'){
            for(let k1 in data[k]){
                if(data[k][k1]){
                    ResetData(data[k])
                }else{
                    delete data[k][k1]
                }
            }
        }
    }
}

