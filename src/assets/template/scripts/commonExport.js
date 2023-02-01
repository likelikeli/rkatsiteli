let workbook2blob=(workbook)=> {
    let wopts = {
        bookType: "xlsx",
        bookSST: false,
        type: "binary"
    };
    let wbout = XLSX.write(workbook, wopts);
    let s2ab=(s)=> {
        let buf = new ArrayBuffer(s.length);
        let view = new Uint8Array(buf);
        for (let i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
    }
    let blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
    return blob;
}
let openDownloadDialog=(blob, fileName)=> {
    if (typeof blob == "object" && blob instanceof Blob) {
        blob = URL.createObjectURL(blob); // 创建blob地址
    }
    let aLink = document.createElement("a");
    aLink.href = blob;
    aLink.download = fileName || "";
    let event;
    if (window.MouseEvent) event = new MouseEvent("click");
    else {
        event = document.createEvent("MouseEvents");
        event.initMouseEvent( "click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null );
    }
    aLink.dispatchEvent(event);
}
let downloadXlsxFile=(dataSources)=>{
    let sheet2 = XLSX.utils.json_to_sheet(dataSources);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet2, "sheet1");
    let workbookBlob = workbook2blob(wb);
    let dasts=new Date()
    let getFullYear=dasts.getFullYear()
    let getMonth=dasts.getMonth()
    if(getMonth<10){
        getMonth='0'+(getMonth+1)
    }
    let getDate=dasts.getDate()
    if(getDate<10){
        getDate='0'+getDate
    }
    let getHours=dasts.getHours()
    if(getHours<10){
        getHours='0'+getHours
    }
    let getMinutes=dasts.getMinutes()
    if(getMinutes<10){
        getMinutes='0'+getMinutes
    }
    let getSeconds=dasts.getSeconds()
    if(getSeconds<10){
        getSeconds='0'+getSeconds
    }
    openDownloadDialog(workbookBlob, '数据文件_'+getFullYear+getMonth+getDate+getHours+getMinutes+getSeconds+'.xlsx')
}
let saveJSON=(data, filename) => {
    if (!data) {
        alert("保存的数据为空");
        return;
    }
    if (!filename) filename = "json.json";
    if (typeof data === "object") {
        data = JSON.stringify(data, undefined, 4);
    }
    let blob = new Blob([data], { type: "text/json" }),
        e = document.createEvent("MouseEvents"),
        a = document.createElement("a");
    a.download = filename;
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");
    e.initMouseEvent(
        "click",
        true,
        false,
        window,// 指向window对象
        0, // 事件的鼠标点击数量
        0, // 事件的屏幕的x坐标
        0,
        0, // 事件的客户端x坐标
        0,
        false, // 事件发生时 control 键是否被按下
        false, // 事件发生时 alt 键是否被按下
        false, // 事件发生时 shift 键是否被按下
        false, // 事件发生时 meta 键是否被按下
        0, // 鼠标按键值
        null
    );
    a.dispatchEvent(e);
}
