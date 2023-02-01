const _remote = require('electron').remote

let _path = require('path')
let _fse = require('fs-extra')
let XLSX = require('xlsx')
var _cryto = require('crypto-js')
let _dialog = _remote.dialog
const _dialogs = require('electron-dialogs').renderer('dialogs')
const _tray = _remote.Tray
const __srcdir = _path.resolve(__dirname, '..')

let _RecentData;
let _AppDataPath;
let _AppDataFile;
const AppDataFolder = "com.Kindling.WhiteFeather";

$(function(){
    _AppDataPath = _path.join(_remote.app.getPath("appData"),AppDataFolder);
    _fse.ensureDirSync(_AppDataPath, err => {});
    _AppDataFile = _path.join(_AppDataPath, "recents.json")
    _fse.ensureFileSync(_AppDataFile)

    _Recent = _fse.readJsonSync(_AppDataFile , { throws: false });
    if(_Recent==null || !_Recent.hasOwnProperty("history")){
        _Recent = { "history":[] };
        saveRecents();
    }

})
//计算文件hash id
function getFileHashId(filePath) {
    const wb = XLSX.readFile(filePath)
    let htmlStr = ''
    wb.SheetNames.forEach(function (sheetName) {
        try {
            const sheet = wb.Sheets[sheetName]
            for(let i in sheet) {
                if(sheet.hasOwnProperty(i) && i.indexOf('!') === -1) {
                    sheet[i]['v'] = ''
                    sheet[i]['w'] = ''
                    _.set(sheet[i], 'r', '')
                    _.set(sheet[i], 'h', '')
                    _.set(sheet[i], 'f', '')
                    _.set(sheet[i], 't', '')
                }
            }
            htmlStr += XLSX.utils.sheet_to_html(sheet, {header: '', footer: '', editable: false})
        } catch (e) {}
    })
    return _cryto.SHA1(htmlStr).toString()
}
function getHash(str) {
    return _cryto.SHA1(str).toString()
}
function saveRecents(callback){
    _fse.writeJsonSync(_AppDataFile, _Recent);
    if(typeof callback === 'function'){
        callback();
    }
}

function alert(title, type){
    var type = type?type:"info";
    let iconPath
    if(window.location.href.indexOf('newPage')!=-1){
        iconPath = _path.join(__dirname,'..','..','assets','icons', type+'_48.png');
    }else{
        iconPath = _path.join(__dirname,'..','assets','icons', type+'_48.png');
    }

    _dialog.showMessageBox({
        "type": type,
        "title": "消息",
        "message": title,
        "icon": iconPath,
        "buttons":['好']
    },(index) => {
        if ( index == 0 ) {
        }
    })
}


function goback() {
    window.history.go(-1);
}

function goto(page){
    window.location.href = page;
}

function notice(title, subtitle, type) {
    alert(title+"\n"+subtitle);
}

function formatUTF8ToJson(bin) {
    //utf-8分有dom版和无dom版,解决办法是先将读到的文件转成二进制，然后检索dom符号删除
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
        bin = bin.slice(3);
    }
    return JSON.parse(bin.toString('utf-8'));
}

function isFilenameValid(filename) {
    const Regi = /^(?!\.)[^\\\/:\*\?"<>\|]{1,255}$/;
    if (Regi.test(filename)) {
        return true;
    } else {
        return false;
    }
}
function confirms(name,modelName,modelID){
    let htmls = '<div class="markBox">' +
        '<div class="markBoxCenter">' +
        '<div class="confirmsTitleS">'+name+'：'+modelName+'？</div>' +
        '<div><span class="btnConcel cancelConfirms mr-3">取消</span>' +
        '<span class="btnOk okConfirms" data-model="'+modelID+'">确定</span></div>' +
        '</div>' +
        '</div>'
    $('body').append(htmls)
}

const az = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ',
    'BA', 'BB', 'BC', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BK', 'BM', 'BN', 'BO', 'BP', 'BQ', 'BR', 'BS', 'BT', 'BU', 'BV', 'BW', 'BX', 'BY', 'BZ',
    'CA', 'CB', 'CC', 'CD', 'CE', 'CF', 'CG', 'CH', 'CI', 'CJ', 'CK', 'CM', 'CN', 'CO', 'CP', 'CQ', 'CR', 'CS', 'CT', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ',
    'DA', 'DB', 'DC', 'DD', 'DE', 'DF', 'DG', 'DH', 'DI', 'DJ', 'DK', 'DM', 'DN', 'DO', 'DP', 'DQ', 'DR', 'DS', 'DT', 'DU', 'DV', 'DW', 'DX', 'DT', 'DZ',
    'EA', 'EB', 'EC', 'ED', 'EE', 'EF', 'EG', 'EH', 'EI', 'EJ', 'EK', 'EM', 'EN', 'EO', 'EP', 'EQ', 'ER', 'ES', 'ET', 'EU', 'EV', 'EW', 'EX', 'ET', 'EZ'
]
function dislodgeLetter(str) {
    var result;
    var reg = /[a-zA-Z]+/;  //[a-zA-Z]表示匹配字母，g表示全局匹配
    while (result = str.match(reg)) { //判断str.match(reg)是否没有字母了
        str = str.replace(result[0], ''); //替换掉字母  result[0] 是 str.match(reg)匹配到的字母
    }
    return str;
}
function dislodgeNum(str) {
    let result;
    result = str.replace(/[ \d]/g, '');
    return result
}
