const soap = require("soap");
let _remoted = require('electron').remote
let _dialogd = _remoted.dialog
let _pathd = require('path')

function sendAjaxWSContent(AppDataFolders, qbyObjectPath, arrobject, _currentModel) {
    if (qbyObjectPath.indexOf('.qby') != -1) {
        qbyObjectPath = qbyObjectPath.split('.qby')[0]
    }
    if (qbyObjectPath.indexOf('.zip') != -1) {
        qbyObjectPath = qbyObjectPath.split('.zip')[0]
    }
    let _fs = require('fs')
    let _paths = require('path')
    let url = window.LS.get('webservicePathContent');
    let wsUrl1 = qbyObjectPath + ".zip"
    let wsUrl2 = _paths.join(AppDataFolders, 'GraphData.json')
    let wsUrl3 = _paths.join(AppDataFolders, 'tableData.json')
    let qbyData = _fs.readFileSync(wsUrl1)
    let graphData = _fs.readFileSync(wsUrl2)
    let tableData = _fs.readFileSync(wsUrl3)
    let buffer1 = Buffer.from(qbyData, 'utf-8')
    let buffer2 = Buffer.from(graphData, 'utf-8')
    let buffer3 = Buffer.from(tableData, 'utf-8')
    let base64Str1 = buffer1.toString('base64')
    let base64Str2 = buffer2.toString('base64')
    let base64Str3 = buffer3.toString('base64')
    let customizedValue = arrobject.customizedValue
    let params = {
        ContainerInfo: customizedValue,
        TableName: arrobject.name,
        QbyFile: base64Str1,
        GraphFile: base64Str2,
        TableFile: base64Str3
    };
    soapServiceContent(url, params, AppDataFolders)
}

function sendAjaxWSSchema(AppDataFolders, qbyObjectPath, arrobject, _currentModel) {
    let _fs = require('fs')
    let _paths = require('path')
    let url = window.LS.get('webservicePathSchema');
    let wsUrl1 = qbyObjectPath + ".zip"
    let wsUrl2 = _paths.join(AppDataFolders, 'GraphData.json')
    let wsUrl3 = _paths.join(AppDataFolders, 'tableData.json')
    let qbyData = _fs.readFileSync(wsUrl1)
    let graphData = _fs.readFileSync(wsUrl2)
    let tableData = _fs.readFileSync(wsUrl3)
    let qbyName = _paths.basename(wsUrl1)
    let graphName = _paths.basename(wsUrl2)
    let tableName = _paths.basename(wsUrl3)
    let buffer1 = Buffer.from(qbyData, 'utf-8')
    let buffer2 = Buffer.from(graphData, 'utf-8')
    let buffer3 = Buffer.from(tableData, 'utf-8')
    let base64Str1 = buffer1.toString('base64')
    let base64Str2 = buffer2.toString('base64')
    let base64Str3 = buffer3.toString('base64')


    if (arrobject.type) {
        if (arrobject.templateOid) {
            let params = {
                methodName: 'baiyuTemplate',
                parameters: JSON.stringify({
                    qbyContent: base64Str1,
                    qbyFileName: qbyName,
                    oneJsonContent: base64Str2,
                    oneJsonFileName: graphName,
                    moreJsonContent: base64Str3,
                    moreJsonFileName: tableName,
                    tableName: _currentModel.modelName,
                    type: arrobject.type,
                    templateOid: arrobject.templateOid,
                })
            };
            soapServiceSchemaTemplateUpdate(url, params, AppDataFolders)
        } else {
            if (arrobject.templateOid) {

            } else {
                arrobject.templateOid = ''
            }
            let params = {
                methodName: 'baiyuTemplate',
                parameters: JSON.stringify({
                    qbyContent: base64Str1,
                    qbyFileName: qbyName,
                    oneJsonContent: base64Str2,
                    oneJsonFileName: graphName,
                    moreJsonContent: base64Str3,
                    moreJsonFileName: tableName,
                    tableName: _currentModel.modelName,
                    type: arrobject.type,
                    templateOid: '',
                })
            };
            soapServiceSchemaTemplateCreate(url, params, AppDataFolders)
        }
    } else {
        let params = {
            methodName: 'baiyu',
            parameters: JSON.stringify({
                qbyContent: base64Str1,
                qbyFileName: qbyName,
                oneJsonContent: base64Str2,
                oneJsonFileName: graphName,
                moreJsonContent: base64Str3,
                moreJsonFileName: tableName,
                tableName: _currentModel.modelName,
                technicsNumber: arrobject.technicsNumber,
                stepNum: arrobject.stepNum,
                paceNum: arrobject.paceNum,
            })
        };
        soapServiceSchema(url, params, AppDataFolders)
    }


}

function rmdir(dir, cb) {

    let _fs = require('fs')
    let _paths = require('path')
    _fs.readdir(dir, function (err, files) {
        next(0);

        function next(index) {
            if (index == files.length)
                return _fs.rmdir(dir, cb);
            let newPath = _paths.join(dir, files[index]);
            _fs.stat(newPath, function (err, stat) {
                if (err) {}
                if (stat.isDirectory()) {
                    rmdir(newPath, () => next(index + 1));
                } else {
                    _fs.unlink(newPath, function (err) {
                        if (err) {}
                        next(index + 1);
                    });
                }
            })
        }
    })
}



function soapServiceSchemaTemplateCreate(url, params, AppDataFolders) {
    soap.createClient(url, (err, client) => {
        if (client) {
            let webservicePathSchemaUserName = window.LS.get('webservicePathSchemaUserName')
            let webservicePathSchemaPassWord = window.LS.get('webservicePathSchemaPassWord')
            let buffer3 = Buffer.from(webservicePathSchemaUserName + ':' + webservicePathSchemaPassWord)
            let base64Str1 = buffer3.toString('base64')
            client.addHttpHeader('Authorization', `Basic ` + base64Str1)
            client.callPDMService(params, (err, result) => {
                if (err) {
                    alert(JSON.stringify(err))
                } else {
                    let iconPath
                    iconPath = _pathd.join(__dirname, '..', 'assets', 'icons', 'info_48.png');
                    _dialogd.showMessageBox({
                        "type": 'info',
                        "title": "消息",
                        "message": '上传成功',
                        "buttons": ['好']
                    }).then((index) => {
                        if (index.response == 0) {
                        }
                    })
                }
            });
        } else {
            alert(JSON.stringify(err))
        }
    });
}

function soapServiceSchemaTemplateUpdate(url, params, AppDataFolders) {
    soap.createClient(url, (err, client) => {
        if (client) {
            let webservicePathSchemaUserName = window.LS.get('webservicePathSchemaUserName')
            let webservicePathSchemaPassWord = window.LS.get('webservicePathSchemaPassWord')
            let buffer3 = Buffer.from(webservicePathSchemaUserName + ':' + webservicePathSchemaPassWord)
            let base64Str1 = buffer3.toString('base64')
            client.addHttpHeader('Authorization', `Basic ` + base64Str1)
            client.callPDMService(params, (err, result) => {
                if (err) {
                    alert(JSON.stringify(err))
                } else {
                    let iconPath
                    iconPath = _pathd.join(__dirname, '..', 'assets', 'icons', 'info_48.png');
                    _dialogd.showMessageBox({
                        "type": 'info',
                        "title": "消息",
                        "message": '上传成功',
                        "buttons": ['好']
                    }).then((index) => {
                        if (index.response == 0) {
                        }
                    })
                }
            });
        } else {
            alert(JSON.stringify(err))
        }
    });
}

function soapServiceSchema(url, params, AppDataFolders) {
    soap.createClient(url, (err, client) => {
        if (client) {
            let webservicePathSchemaUserName = window.LS.get('webservicePathSchemaUserName')
            let webservicePathSchemaPassWord = window.LS.get('webservicePathSchemaPassWord')
            let buffer3 = Buffer.from(webservicePathSchemaUserName + ':' + webservicePathSchemaPassWord)
            let base64Str1 = buffer3.toString('base64')
            client.addHttpHeader('Authorization', `Basic ` + base64Str1)
            client.callPDMService(params, (err, result) => {
                if (err) {
                    alert(JSON.stringify(err))
                } else {
                    let iconPath
                    iconPath = _pathd.join(__dirname, '..', 'assets', 'icons', 'info_48.png');
                    _dialogd.showMessageBox({
                        "type": 'info',
                        "title": "消息",
                        "message": '上传成功',
                        "buttons": ['好']
                    }).then((index) => {
                        if (index.response == 0) {
                            // rmdir(AppDataFolders,function () {
                            //     app.quit();
                            // });
                        }
                    })
                }
            });
        } else {
            alert(JSON.stringify(err))
        }
    });
}

function soapServiceContent(url, params, AppDataFolders) {
    soap.createClient(url, (err, client) => {
        if (client) {
            client.SaveMESDataRequestAsync(params, (err, result) => {
                if (err) {
                    alert(JSON.stringify(err))
                } else {
                    let iconPath
                    iconPath = _pathd.join(__dirname, '..', 'assets', 'icons', 'info_48.png');
                    _dialogd.showMessageBox({
                        "type": 'info',
                        "title": "消息",
                        "message": '上传成功',
                        "buttons": ['好']
                    }, (index) => {
                        if (index == 0) {
                            // rmdir(AppDataFolders,function () {
                            //     // app.quit();
                            // });
                        }
                    })
                }
            });
        } else {
            alert(JSON.stringify(err))
        }


    });
}

function soapService(url, params, AppDataFolders) {
    soap.createClient(url, (err, client) => {
        client.uploadFileAsync(params, (err, result) => {
            if (err) {} else {
                let iconPath
                iconPath = _pathd.join(__dirname, '..', 'assets', 'icons', 'info_48.png');
                _dialogd.showMessageBox({
                    "type": 'info',
                    "title": "消息",
                    "message": '上传成功',
                    "buttons": ['好']
                }).then((index) => {
                    if (index.response == 0) {
                        // rmdir(AppDataFolders,function () {
                        //     app.quit();
                        // });
                    }
                })
            }
        });
    });
}
async function getRoutService(url, params) {
    soap.createClient(url, (err, client) => {
        if (client) {
            let webservicePathSchemaUserName = window.LS.get('webservicePathSchemaUserName')
            let webservicePathSchemaPassWord = window.LS.get('webservicePathSchemaPassWord')
            let buffer3 = Buffer.from(webservicePathSchemaUserName + ':' + webservicePathSchemaPassWord)
            let base64Str1 = buffer3.toString('base64')
            client.addHttpHeader('Authorization', `Basic ` + base64Str1)
            client.callPDMService(params, (err, result) => {})
        }
    });
}
