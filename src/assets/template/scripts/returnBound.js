function returnBoData(leftSymbols, rightSymbols, data, Equals) {
    let returnD = {
        dataUp: '',
        dataDown: '',
        deviationUpper: '',
        deviationLower: '',
        nominalValue: ''
    }
    let dataM = []
    let leftValue = 0
    if (data.split(leftSymbols)[0]) {
        let lf = data.split(leftSymbols)[0]
        let noud21 = parseFloat(lf)
        if (isNaN(noud21) === false && noud21 !== Infinity && noud21 !== -Infinity) {
            leftValue = noud21
        }
    }else{
        leftValue = 0
    }
    let dd = data.split(leftSymbols)[1].split(rightSymbols)[0]
    if (dd.indexOf(',') !== -1) {
        dataM = dd.split(',')
    }
    if (dd.indexOf('，') !== -1) {
        dataM = dd.split('，')
    }
    if (dataM[0] || dataM[0] === 0 || dataM[0] === '0') {
        let noud2 = parseFloat(dataM[0])
        if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {} else {
            dataM[0] = ''
        }
    }
    if (dataM[1] || dataM[1] === 0 || dataM[1] === '0') {
        let noud2 = parseFloat(dataM[1])
        if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {} else {
            dataM[1] = ''
        }
    }
    if (Equals == 'noEquals') {
        if (dataM[0]) {
            dataM[0] = (parseFloat(dataM[0])*1000000000 + 1)/1000000000
        }
        if (dataM[1]) {
            dataM[1] = (parseFloat(dataM[1])*1000000000 - 1)/1000000000
        }
    }
    if (Equals == 'rightEquals') {
        if (dataM[1]) {
            dataM[1] = (parseFloat(dataM[1])*1000000000 - 1)/1000000000
        }
    }
    if (Equals == 'leftEquals') {
        if (dataM[0]) {
            dataM[0] = (parseFloat(dataM[0])*1000000000 + 1)/1000000000
        }
    }
    if (leftValue || leftValue === 0 || leftValue === '0') {
        leftValue = parseFloat(leftValue)
        if (isNaN(leftValue) === false && leftValue !== Infinity && leftValue !== -Infinity) {} else {
            leftValue = 0
        }
        returnD.nominalValue = leftValue
        if (dataM[0]) {
            returnD.deviationLower = parseFloat(dataM[0])
        }
        if (dataM[1]) {
            returnD.deviationUpper = parseFloat(dataM[1])
        }
        if (leftValue||leftValue==0) {
            if (dataM[0]) {
                returnD.dataDown = (parseFloat(dataM[0])*1000000000 + parseFloat(leftValue)*1000000000)/1000000000
            }
            if (dataM[1]) {
                returnD.dataUp = (parseFloat(dataM[1])*1000000000 + parseFloat(leftValue)*1000000000)/1000000000
            }
        }
    } else {
        if (dataM[0]) {
            returnD.dataDown = dataM[0]
        }
        if (dataM[1]) {
            returnD.dataUp = dataM[1]
        }
    }
    if (returnD.dataUp == returnD.dataDown) {
        returnD.deviationLower = 0
        returnD.deviationUpper = 0
        returnD.nominalValue = returnD.dataDown
    }

    return returnD
}

function returnBo1Data(symbols, Equals) {
    let returnD = {
        dataUp: '',
        dataDown: '',
        deviationUpper: '',
        deviationLower: '',
        nominalValue: ''
    }
    let dataM = data.split(symbols)
    if (Equals == 'noEquals') {
        if (dataM[0]) {
            dataM[0] = ((parseFloat(dataM[0]))*1000000000 + 1)/1000000000
        }
        if (dataM[1]) {
            dataM[1] = (parseFloat(dataM[1])*1000000000 - 1)/1000000000
        }
    }
    if (Equals == 'rightEquals') {
        if (dataM[1]) {
            dataM[1] = ((parseFloat(dataM[1]))*1000000000 - 1)/1000000000
        }
    }
    if (Equals == 'leftEquals') {
        if (dataM[0]) {
            dataM[0] = ((parseFloat(dataM[0]))*1000000000 + 1)/1000000000
        }
    }
    if (dataM[0]) {
        returnD.dataUp = dataM[0]
        returnD.deviationLower = returnD.dataUp
    }
    if (dataM[1]) {
        returnD.dataDown = dataM[1]
        returnD.deviationUpper = dataM[1]
    }
    returnD.nominalValue = 0
    return returnD
}

function returnBoundFunc(data) {
    let dataUp = ''
    let dataDown = ''
    let deviationUpper = ''
    let deviationLower = ''
    let nominalValue = ''
    if (typeof data === 'string') {
        if (data.indexOf('≤') === -1 &&
            data.indexOf('±') === -1 &&
            data.indexOf('[') === -1 &&
            data.indexOf(']') === -1 &&
            data.indexOf('(') === -1 &&
            data.indexOf(')') === -1 &&
            data.indexOf('【') === -1 &&
            data.indexOf('】') === -1 &&
            data.indexOf('（') === -1 &&
            data.indexOf('）') === -1 &&
            data.indexOf('~') === -1 &&
            data.indexOf('～') === -1 &&
            data.indexOf('/') === -1 &&
            data.indexOf('<') === -1 &&
            data.indexOf('﹤') === -1 &&
            data.indexOf('>') === -1 &&
            data.indexOf('≥') === -1) {
            if (isNaN(parseFloat(data)) === false) {
                dataDown = parseFloat(data)
                dataUp = parseFloat(data)
                if (dataUp == dataDown) {
                    deviationLower = 0
                    deviationUpper = 0
                    nominalValue = dataDown
                }
            }
        } else if (data.indexOf('≤x<') !== -1 ||
            data.indexOf('≤x﹤') !== -1 ||
            data.indexOf('≤x≤') !== -1 ||
            data.indexOf('<x<') !== -1 ||
            data.indexOf('<x﹤') !== -1 ||
            data.indexOf('<x≤') !== -1 ||
            data.indexOf('﹤x<') !== -1 ||
            data.indexOf('﹤x﹤') !== -1 ||
            data.indexOf('﹤x≤') !== -1 ||
            data.indexOf('≤X<') !== -1 ||
            data.indexOf('≤X﹤') !== -1 ||
            data.indexOf('≤X≤') !== -1 ||
            data.indexOf('<X<') !== -1 ||
            data.indexOf('<X﹤') !== -1 ||
            data.indexOf('<X≤') !== -1 ||
            data.indexOf('﹤X<') !== -1 ||
            data.indexOf('﹤X﹤') !== -1 ||
            data.indexOf('﹤X≤') !== -1
        ) {
            let dataNow = {}
            if (data.indexOf('≤x<') !== -1) {
                dataNow = returnBo1Data('≤x<', 'rightEquals')
            }
            if (data.indexOf('≤x﹤') !== -1) {
                dataNow = returnBo1Data('≤x﹤', 'rightEquals')
            }
            if (data.indexOf('≤x≤') !== -1) {
                dataNow = returnBo1Data('≤x≤', 'allEquals')
            }
            if (data.indexOf('<x<') !== -1) {
                dataNow = returnBo1Data('<x<', 'noEquals')
            }
            if (data.indexOf('<x﹤') !== -1) {
                dataNow = returnBo1Data('<x﹤', 'noEquals')
            }
            if (data.indexOf('<x≤') !== -1) {
                dataNow = returnBo1Data('<x≤', 'leftEquals')
            }
            if (data.indexOf('﹤x<') !== -1) {
                dataNow = returnBo1Data('﹤x<', 'noEquals')
            }
            if (data.indexOf('﹤x﹤') !== -1) {
                dataNow = returnBo1Data('﹤x﹤', 'noEquals')
            }
            if (data.indexOf('﹤x≤') !== -1) {
                dataNow = returnBo1Data('﹤x≤', 'leftEquals')
            }
            if (data.indexOf('≤X<') !== -1) {
                dataNow = returnBo1Data('≤X<', 'rightEquals')
            }
            if (data.indexOf('≤X﹤') !== -1) {
                dataNow = returnBo1Data('≤X﹤', 'rightEquals')
            }
            if (data.indexOf('≤X≤') !== -1) {
                dataNow = returnBo1Data('≤X≤', 'allEquals')
            }
            if (data.indexOf('<X<') !== -1) {
                dataNow = returnBo1Data('<X<', 'noEquals')
            }
            if (data.indexOf('<X﹤') !== -1) {
                dataNow = returnBo1Data('<X﹤', 'noEquals')
            }
            if (data.indexOf('<X≤') !== -1) {
                dataNow = returnBo1Data('<X≤', 'leftEquals')
            }
            if (data.indexOf('﹤X<') !== -1) {
                dataNow = returnBo1Data('﹤X<', 'noEquals')
            }
            if (data.indexOf('﹤X﹤') !== -1) {
                dataNow = returnBo1Data('﹤X﹤', 'noEquals')
            }
            if (data.indexOf('﹤X≤') !== -1) {
                dataNow = returnBo1Data('﹤X≤', 'leftEquals')
            }
            dataUp = dataNow.dataUp
            dataDown = dataNow.dataDown
            deviationUpper = dataNow.deviationUpper
            deviationLower = dataNow.deviationLower
            nominalValue = dataNow.nominalValue
        } else {
            if (
                (data.indexOf('(') !== -1 && data.indexOf(')') !== -1) ||
                (data.indexOf('(') !== -1 && data.indexOf('）') !== -1) ||
                (data.indexOf('(') !== -1 && data.indexOf('】') !== -1) ||
                (data.indexOf('(') !== -1 && data.indexOf(']') !== -1) ||
                (data.indexOf('（') !== -1 && data.indexOf(')') !== -1) ||
                (data.indexOf('（') !== -1 && data.indexOf('）') !== -1) ||
                (data.indexOf('（') !== -1 && data.indexOf('】') !== -1) ||
                (data.indexOf('（') !== -1 && data.indexOf(']') !== -1) ||
                (data.indexOf('【') !== -1 && data.indexOf(')') !== -1) ||
                (data.indexOf('【') !== -1 && data.indexOf('）') !== -1) ||
                (data.indexOf('【') !== -1 && data.indexOf('】') !== -1) ||
                (data.indexOf('【') !== -1 && data.indexOf(']') !== -1) ||
                (data.indexOf('[') !== -1 && data.indexOf(')') !== -1) ||
                (data.indexOf('[') !== -1 && data.indexOf('）') !== -1) ||
                (data.indexOf('[') !== -1 && data.indexOf('】') !== -1) ||
                (data.indexOf('[') !== -1 && data.indexOf(']') !== -1)
            ) {
                let dataNow = {}
                if ((data.indexOf('(') !== -1 && data.indexOf(')') !== -1)) {
                    dataNow = returnBoData('(', ')', data, 'noEquals')
                }
                if ((data.indexOf('(') !== -1 && data.indexOf('）') !== -1)) {
                    dataNow = returnBoData('(', '）', data, 'noEquals')
                }
                if ((data.indexOf('(') !== -1 && data.indexOf('】') !== -1)) {
                    dataNow = returnBoData('(', '】', data, 'leftEquals')
                }
                if ((data.indexOf('(') !== -1 && data.indexOf(']') !== -1)) {
                    dataNow = returnBoData('(', ']', data, 'leftEquals')
                }
                if ((data.indexOf('（') !== -1 && data.indexOf(')') !== -1)) {
                    dataNow = returnBoData('（', ')', data, 'noEquals')
                }
                if ((data.indexOf('（') !== -1 && data.indexOf('）') !== -1)) {
                    dataNow = returnBoData('（', '）', data, 'noEquals')
                }
                if ((data.indexOf('（') !== -1 && data.indexOf('】') !== -1)) {
                    dataNow = returnBoData('（', '】', data, 'leftEquals')
                }
                if ((data.indexOf('（') !== -1 && data.indexOf(']') !== -1)) {
                    dataNow = returnBoData('（', ']', data, 'leftEquals')
                }
                if ((data.indexOf('【') !== -1 && data.indexOf(')') !== -1)) {
                    dataNow = returnBoData('【', ')', data, 'rightEquals')
                }
                if ((data.indexOf('【') !== -1 && data.indexOf('）') !== -1)) {
                    dataNow = returnBoData('【', '）', data, 'rightEquals')
                }
                if ((data.indexOf('【') !== -1 && data.indexOf('】') !== -1)) {
                    dataNow = returnBoData('【', '】', data, 'allEquals')
                }
                if ((data.indexOf('【') !== -1 && data.indexOf(']') !== -1)) {
                    dataNow = returnBoData('【', ']', data, 'allEquals')
                }
                if ((data.indexOf('[') !== -1 && data.indexOf(')') !== -1)) {
                    dataNow = returnBoData('[', ')', data, 'rightEquals')
                }
                if ((data.indexOf('[') !== -1 && data.indexOf('）') !== -1)) {
                    dataNow = returnBoData('[', '）', data, 'rightEquals')
                }
                if ((data.indexOf('[') !== -1 && data.indexOf('】') !== -1)) {
                    dataNow = returnBoData('[', '】', data, 'allEquals')
                }
                if ((data.indexOf('[') !== -1 && data.indexOf(']') !== -1)) {
                    dataNow = returnBoData('[', ']', data, 'allEquals')
                }
                dataUp = dataNow.dataUp
                dataDown = dataNow.dataDown
                deviationUpper = dataNow.deviationUpper
                deviationLower = dataNow.deviationLower
                nominalValue = dataNow.nominalValue
            } else if (data.indexOf('≤') !== -1) {
                let dataM = data.split('≤')
                if(dataM[0]){
                    nominalValue = dataM[0]
                    deviationUpper = 0
                    dataDown = dataM[0]
                    dataUp= ''
                    deviationLower = ''

                }
                if(dataM[1]){
                    nominalValue = dataM[1]
                    deviationLower = 0
                    dataUp =  dataM[1]
                    dataDown = ''
                    deviationUpper = ''
                }
            } else if (data.indexOf('±') !== -1) {
                let dataM = data.split('±')
                let dataM0 = dataM[0]
                let dataM1 = dataM[1]
                dataM[0] = parseFloat(dataM0) - parseFloat(dataM1)
                dataM[1] = parseFloat(dataM0) + parseFloat(dataM1)
                let dd1 = dataM[0]
                if (dd1) {
                    let noud0 = parseFloat(dd1)
                    if (isNaN(noud0) === false && noud0 !== Infinity && noud0 !== -Infinity) {
                        nominalValue = parseFloat(dataM0)
                        deviationLower = -parseFloat(dataM1)
                        deviationUpper = parseFloat(dataM1)
                    }
                }
                if (dataM[0] || dataM[0] === 0 || dataM[0] === '0') {
                    let noud2 = parseFloat(dataM[0])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                            dataDown = noud2
                    }
                }
                if (dataM[1] || dataM[1] === 0 || dataM[1] === '0') {
                    let noud2 = parseFloat(dataM[1])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        dataUp = noud2
                    }
                }
            } else if (data.indexOf('~') !== -1 || data.indexOf('～') !== -1) {
                let dataM = []
                if(data.indexOf('~') !== -1){
                    dataM = data.split('~')
                }else{
                    dataM = data.split('～')
                }
                if (dataM[0] || dataM[0] === 0 || dataM[0] === '0') {
                    let noud2 = parseFloat(dataM[0])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        dataDown = noud2
                    }
                }
                if (dataM[1] || dataM[1] === 0 || dataM[1] === '0') {
                    let noud2 = parseFloat(dataM[1])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        dataUp = noud2
                    }
                }
                if(dataDown||dataDown == 0){
                    nominalValue = dataDown
                    if(dataUp||dataUp == 0){
                        deviationUpper = (Math.abs(dataUp*1000000000 - dataDown*1000000000))/1000000000
                        deviationLower = 0
                    }
                }
            } else if (data.indexOf('/') !== -1) {
                nominalValue = ''
                deviationUpper = ''
                deviationLower = ''
                dataUp = ''
                dataDown = ''
            } else if (data.indexOf('<') !== -1 || data.indexOf('﹤') !== -1) {
                let dataM = []
                if (data.indexOf('<') !== -1) {
                    dataM = data.split('<')
                } else {
                    dataM = data.split('﹤')
                }
                if(dataM[0]||dataM[0]==0){
                    let noud2 = parseFloat(dataM[0])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue = dataM[0]
                        dataDown = ((parseFloat(dataM[0]))*1000000000 + 1)/1000000000
                        deviationLower = '0.000000001'
                        dataUp = ''
                        deviationUpper = ''
                        deviationLower = Number(deviationLower).toFixed(9);
                    }

                }
                if(dataM[1]||dataM[1]==0){
                    let noud2 = parseFloat(dataM[1])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue = dataM[1]
                        deviationUpper = - '0.000000001'
                        dataUp = ((parseFloat(dataM[1]))*1000000000 - 1)/1000000000
                        dataDown = ''
                        deviationLower = ''
                        deviationUpper = Number(deviationUpper).toFixed(9);
                    }
                }
            } else if (data.indexOf('>') !== -1) {
                let dataM = data.split('>')
                if(dataM[0]||dataM[0]==0){
                    let noud2 = parseFloat(dataM[0])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue =  dataM[0]
                        deviationUpper = - 0.000000001
                        dataUp =  ((parseFloat(dataM[0]))*1000000000 - 1)/1000000000
                        dataDown = ''
                        deviationLower = ''
                        deviationUpper = Number(deviationUpper).toFixed(9);
                    }
                }
                if(dataM[1]||dataM[1]==0){
                    let noud2 = parseFloat(dataM[1])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue = dataM[1]
                        deviationLower = 0.000000001
                        dataDown =  ((parseFloat(dataM[1]))*1000000000 + 1)/1000000000
                        deviationUpper = ''
                        dataUp = ''
                        deviationLower = Number(deviationLower).toFixed(9);
                    }
                }
            } else if (data.indexOf('≥') !== -1) {
                let dataM = data.split('≥')
                if(dataM[0]||dataM[0]==0){
                    let noud2 = parseFloat(dataM[0])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue = dataM[0]
                        deviationUpper = 0
                        dataUp = dataM[0]
                        dataDown = ''
                        deviationLower = ''
                    }
                }
                if(dataM[1]||dataM[1]==0){
                    let noud2 = parseFloat(dataM[1])
                    if (isNaN(noud2) === false && noud2 !== Infinity && noud2 !== -Infinity) {
                        nominalValue = dataM[1]
                        deviationLower = 0
                        dataDown = dataM[1]
                        deviationUpper = ''
                        dataUp = ''
                    }
                }
            }
        }
    } else {
        if (data || data == 0) {
            dataUp = dataDown = data
        }
    }

    if (dataUp && dataDown) {
        if (dataUp == dataDown) {
            nominalValue = dataDown
            deviationUpper = 0
            deviationLower = 0
        }
        if (dataUp < dataDown) {
            let temp = dataUp
            dataDown = dataUp
            dataUp = temp
        }
    }
    return {
        dataUp,
        dataDown,
        deviationUpper,
        deviationLower,
        nominalValue
    }
}
