let arr = [
    {id: 8, name: '测试8', pid: 0},
    {id: 9, name: '测试9', pid: 8},
    {id: 2, name: '测试2', pid: 1},
    {id: 3, name: '测试3', pid: 1},
    {id: 6, name: '测试6', pid: 2},
    {id: 4, name: '测试4', pid: 3},
    {id: 1, name: '测试1', pid: 0},
    {id: 7, name: '测试7', pid: 3},
    {id: 5, name: '测试5', pid: 4},
]


function arrayToTree(items) {
    const result = [];   // 存放结果集
    const itemMap = {};  //
    // 先转成map存储
    for (const item of items) {
        itemMap[item.id] = {...item, children: []}
    }
    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        const treeItem =  itemMap[id];
        if (pid === 0) {
            result.push(treeItem);
        } else {
            if (!itemMap[pid]) {
                itemMap[pid] = {
                    children: [],
                }
            }
            itemMap[pid].children.push(treeItem)
        }
    }
    return result;
}

// const nn = arrayToTree(arr)
// console.log(JSON.stringify(nn))

//第一步选取根结点
const getData = JSON.parse(JSON.stringify(arr.filter(v => !arr.some((item) => item.id === v.pid))))
let length = getData.length
function returnData(result, pid){
    arr.filter( val=>{
        if(val.pid!=result.pid) {
            if (pid == val.pid) {
                if (!result.children) {
                    result.children = []
                }
                result.children.push(val)
                returnData(val, val.id)
            }
        }
    })
}

getData.filter(item=>{
    // returnData(item,item.id)
})

// console.log(JSON.stringify(getData))
for (const item of arr) {
    // console.log(item)
    const pid = item.pid;
    if (pid === 0) {
        // console.log(pid)
    }else{

    }
}

function arrayToTree1(items) {
    const result = [];   // 存放结果集
    const itemMap = {};  //
    for (const item of items) {
        const id = item.id;
        const pid = item.pid;
        if (!itemMap[id]) {
            itemMap[id] = {
                children: [],
            }
        }

        itemMap[id] = {
            ...item,
            children: itemMap[id]['children']
        }

        const treeItem =  itemMap[id];

        if (pid === 0) {
            result.push(treeItem);
        } else {
            if (!itemMap[pid]) {
                itemMap[pid] = {
                    children: [],
                }
            }
            itemMap[pid].children.push(treeItem)
        }

    }
    return result;
}
const arrayToTree1D = arrayToTree1(arr)

console.log(JSON.stringify(arrayToTree1D))


