var AdmZip = require('adm-zip');
function zipqby(name, callback) {
    var zip = new AdmZip();
    zip.addLocalFile(_currentProjFile);
    zip.addLocalFile(_path.join(_currentProj["projPath"], _currentProjFileData["table_file"]));
    zip.addLocalFile(_path.join(_currentProj["projPath"], _currentProjFileData["original_file"]));
    zip.addLocalFolder(_path.join(_currentProj["projPath"], "models"), "models")
    zip.toBuffer();
    var archivePath = _path.join(_currentProj["projPath"], name+".qby");
    zip.writeZip(archivePath);
    if(typeof callback === "function"){
        callback(archivePath);
    }
}
