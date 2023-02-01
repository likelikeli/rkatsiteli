const _ = require('lodash')
const _paths = require("path");
const {remote: _remotes} = require("electron");

let newKeys
$(function () {
    let _extModelsData
    let _currentModel
    const _remotes = require('electron').remote
    const m = _remotes.Menu.getApplicationMenu();
    const dx = (_remotes.process.platform === 'darwin')?1:0;
    m.items[dx].submenu.items[0].enabled = false
    m.items[dx].submenu.items[1].enabled = false
    m.items[dx].submenu.items[2].enabled = false
    let data=[]
    let query = window.location.search.substring(1)
    let ucode=query
    let vars = ucode.split("&");
    let arrobject={}
    for (let i = 0; i < vars.length; i++) {
        let pair = vars[i].split("=");
        arrobject[pair[0]]=decodeURI(pair[1])
    }
    let _currentModelModelId =arrobject._currentModelModelId
    let url=arrobject.url
    const _paths = require('path')
    let AppDataFoldersRoot='nowPage_baiyu'
    let _AppDataPathRoot = _paths.join(_remotes.app.getPath("appData"),AppDataFoldersRoot);
    $('#btn_return').on('click', function () {
        let urls = 'templatePage.html?urlLocal='+url+'&fileName='+arrobject.fileName
        if(arrobject.technicsNumber){
            urls+='&technicsNumber='+arrobject.technicsNumber
        }
        if(arrobject.stepNum){
            urls+='&stepNum='+arrobject.stepNum
        }
        if(arrobject.paceNum){
            urls+='&paceNum='+arrobject.paceNum
        }
        if(arrobject.type){
            urls+='&type='+arrobject.type
        }
        if(arrobject.templateOid){
            urls+='&templateOid='+arrobject.templateOid
        }
        window.location.href = urls
    })
    let newUR = url.split('original')[0]
    openFileShow(_paths.join(_AppDataPathRoot,newUR,'tableData.json'))
    function openFileShow(xlsxPath){
        function getObjectKeys(object) {
            var keys = [];
            for (var property in object){
                for(let key in  object[property]){
                    keys.push(key);
                }

            }

            return keys;
        }

        const _extModelsData1= _fse.readJsonSync(xlsxPath, {throws: false});

        let keyAllls = getObjectKeys(_extModelsData1.data2)
        keyAllls = [...new Set(keyAllls)]
        data = _extModelsData1.data2
        let keyAll = [
            {field:'唯一编码',title:'唯一编码', width: 480,visible: true,sortable: false,align: 'center'},
            {field:'字段',title:'字段', width: 480,visible: true,sortable: false,align: 'center'},
            {field:'值',title:'值', width: 480,visible: true,sortable: false,align: 'center'},
        ]
        keyAllls.filter(item=>{
            if(item!='唯一编码'&&item!='字段'&&item!='值'){
                let li ={field:item,title:item, width: 480,visible: true,sortable: false,align: 'center'}
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
            rowStyle:rowStyle,
            cache: false,
            columns: keyAll,
            data: _extModelsData1.data2,
        });
        $(".pagination-detail").css('display','none')
        $(".no-records-found td").html('没有数据请您重新筛选')
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
    /**
     * 导出表格
     */
    $("#exportExcel1").on("click", function () {
        downloadXlsxFile(data)
    })
    /**
     * 导出JSON文件
     */
    $('#exportExcel2').on('click', function () {
        saveJSON(data,'表格型文件.json')
    })
})
