/**
 * 表格样式
 * @param row
 * @param index
 * @returns {{classes: string}}
 */
let rowStyle = function (row, index) {
    let classes = ['success1', 'info1'];
    if (index % 2 === 0) {
        return { classes: classes[0]};
    } else {
        return {classes: classes[1]};
    }
}


/**
 * 获取当前表格数据
 * @param x
 * @param y
 * @param ws
 * @returns {string}
 */
function getCellValue(x, y, ws) {
    let cell_address = {
        c: x,
        r: y
    }
    let cell_ref = XLSX.utils.encode_cell(cell_address)
    if (ws[cell_ref] && ws[cell_ref]['z']) {
        if (ws[cell_ref]['v']) {
            if (ws[cell_ref]['v'] > 60) {
                let nowDates = new Date((ws[cell_ref]['v'] - 25569) * 24 * 3600 * 1000)
                let nowDatesYear = nowDates.getFullYear()
                let nowDatesMonth = nowDates.getMonth() + 1
                let nowDatesDay = nowDates.getDate()
                if (nowDatesMonth < 10) {
                    nowDatesMonth = nowDatesMonth
                }
                if (nowDatesDay < 10) {
                    nowDatesDay = nowDatesDay
                }
                return nowDatesYear + '/' + nowDatesMonth + '/' + nowDatesDay
            } else {
                let nowDates = new Date((ws[cell_ref]['v'] - 25568) * 24 * 3600 * 1000)
                let nowDatesYear = nowDates.getFullYear()
                let nowDatesMonth = nowDates.getMonth() + 1
                if (nowDatesMonth < 10) {
                    nowDatesMonth = nowDatesMonth
                }
                let nowDatesDay = nowDates.getDate()
                if (nowDatesDay < 10) {
                    nowDatesDay = nowDatesDay
                }
                return nowDatesYear + '/' + nowDatesMonth + '/' + nowDatesDay
            }
        } else {
            return _.get(ws, `${cell_ref}.v`, '') ? _.get(ws, `${cell_ref}.v`, '') : ''
        }
    } else {
        return _.get(ws, `${cell_ref}.v`, '') ? _.get(ws, `${cell_ref}.v`, '') : ''
    }
}
/**
 * 去除|n \n \r
 * @param str
 * @returns {number}
 */
function formatStr(str) {
    if (str && typeof str != 'number') {
        str = str.replace('\r', '')
        str = str.replace('\n', '')
        str = str.replace('|n', '')
    }
    return str
}

/**
 * 获取当前模版数据
 * @param modelID
 * @returns {*}
 */
function getModelData(modelID) {
    for (let i = 0; i < _extModelsData.models.length; i++) {
        if (_extModelsData.models[i]["modelID"] === modelID) {
            return _extModelsData.models[i];
        }
    }
}

function clearTagSelected() {
    $("input[name='panelRadio'][type='radio']:checked").prop("checked", false);
    $(".p-clip .f-clear-tag").remove();
}

