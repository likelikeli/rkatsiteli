const electron = require("electron")
const app = electron.app
const path = require('path')

let windowOpt = {
  width: 800,
  height: 600,
  titleBarStyle: "hidden",
  show: false,
  darkTheme: true,
  autoHideMenuBar: true,
  backgroundColor: "#121315",
  webPreferences: {
    nodeIntegration: true,
    enableRemoteModule: true,
    webSecurity: false,
  }
}

const __srcdir = path.resolve(__dirname, '..')
if (process.platform === 'win32') {
  windowOpt["icon"] = path.join(__srcdir,'/assets/icons/logo.ico')
}

const template = [
  {
    label: "文件",
    submenu: [
      {
        label: "回到项目...",
        accelerator: "CommandOrControl+P",
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.loadFile("./src/renderer/index.html");
          }
        },
      },
      { type: "separator" },
      {
        label: "保存",
        accelerator: "CommandOrControl+S",
        click(item, focusedWindow) {
          if (focusedWindow) {
            focusedWindow.send("#save");
          }
        },
      },
      { type: "separator" },
    ],
  },
  {
    label: "编辑",
    submenu: [
    ],
  },
  {
    label: "视图",
    submenu: [
      { label: "无缩放", role: "resetzoom" },
      { label: "放大", role: "zoomin" },
      { label: "缩小", role: "zoomout" },
      { type: "separator" },
      { label: "进入/退出全屏", role: "togglefullscreen" },
      { type: "separator" },
      { label: "刷新", role: "reload" },
      { label: "强制刷新", role: "forcereload" },
      { type: "separator" },
      {
        role: 'toggleDevTools',
        label: '调试面板',
        accelerator: process.platform === 'darwin' ? 'Option+Cmd+I' : 'Ctrl+Shift+I'
      },
      {
        label: "提取模型代码",
        click() {
          let win = new electron.BrowserWindow(windowOpt);
          win.loadFile("./src/renderer/modelcode.html");
          win.on("closed", function () {
            win = null;
          });
          win.once('ready-to-show', () => {
            win.show()
          });
        }
      }
    ],
  },
  {
    label: "窗体",
    submenu: [
      { label: "最小", role: "minimize" },
      { label: "关闭", role: "close" },
    ],
  },
  {
    label: "帮助",
    submenu: [
      {
        label: "帮助文档",
        click() {
          electron.shell.openExternal(
            "https://github.com/ploverbay/vein/blob/master/README.md"
          );
        },
      },
      {
        label: "问题反馈",
        click() {
          electron.shell.openExternal(
            "https://github.com/ploverbay/vein/issues"
          );
        },
      },
      {
        label: "软件许可使用协议",
        click() {
          electron.shell.openExternal(
            "https://github.com/ploverbay/vein/blob/master/This%20Kindling%20Software%20License%20Agreement.md"
          );
        },
      },
    ],
  },
];

if (process.platform === "darwin") {
  template.unshift({
    label: app.name,
    submenu: [
      { label: "关于", role: "about" },
      { type: "separator" },
      { label: "服务", role: "services", submenu: [] },
      { type: "separator" },
      { label: "隐藏其他", role: "hideothers" },
      { label: "不隐藏", role: "unhide" },
      { type: "separator" },
      { label: "退出", role: "quit" },
    ],
  });

  // Edit menu
  template[2].submenu.push(
    { type: "separator" },
    {
      label: "语音",
      submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }],
    }
  );

  // Window menu
  template[5].submenu = [
    { label: "关闭", role: "close" },
    { label: "最小化", role: "minimize" },
    { type: "separator" },
    { label: "置顶最前", role: "front" },
  ];
}

const menu = electron.Menu.buildFromTemplate(template);
const BrowserWindow = electron.BrowserWindow;
module.exports = function appMenu() {
  electron.Menu.setApplicationMenu(menu);
};
