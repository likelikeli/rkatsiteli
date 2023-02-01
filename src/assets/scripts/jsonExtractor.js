var _uuid = require('uuid-random')
const _shell = require('electron').shell
let _fs = require('fs')
let _ = require('lodash')

let _currentProj = {};
let _currentProjFilePath;
let _currentProjFileData = {};
let _extModelsData, _extractorModelFile;
let _currentModel = {};
let _Recent

let _LINES = [];
let chooseStandard=false
let _modalCreateNew;
var _freelinkLR = [];
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
    const tblFile = _path.join(_currentProj["projPath"], _currentProjFileData["table_file"])
    $.get(tblFile, function (doc) {
        $('#jstree_demo_div').jstree({
            "core": {
                "themes": {
                    "responsive": false
                },
                'check_callback': true,
                'data':doc
            },
            "types": {
                "default": {
                    "icon": "fa fa-folder icon-state-warning icon-lg"
                },
                "file": {
                    "icon": "fa fa-file icon-state-warning icon-lg"
                }
            },
            "plugins": ["types", "checkbox"],
            "checkbox": {
                "keep_selected_style": false,//是否默认选中
                "three_state": false//父子级别级联选择
            }
        });
    });
})

