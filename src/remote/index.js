const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const ipcMain = require('electron').ipcMain
const path = require('path')
const dialogs = require('electron-dialogs').main
const appMenu = require('./appMenu')
const __srcdir = path.resolve(__dirname, '..')
// 获取单实例锁
const gotTheLock = app.requestSingleInstanceLock();
// if (!gotTheLock) {
//     app.quit();
// }
app.disableHardwareAcceleration()
//注册一个伪协议
app.setAsDefaultProtocolClient("baiyu")
let mainWindow
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = '1'
const createWindow = () => {
    var electronScreen = electron.screen
    var size = electronScreen.getPrimaryDisplay().workAreaSize
    global.sharedObject = {
        args: process.argv[process.argv.length-1],
        process:process
    }
    let opt = {
      show: false,
      backgroundColor: '#282c34',
      width: size.width,
      height: size.height,
      darkTheme : true,
      center: true,
      minWidth: 800,
      minHeight: 660,
      webPreferences: {
          plugins: true,
          nodeIntegration: true,
          webSecurity: false,
          enableRemoteModule: true,
      }
    };
    if (process.platform === 'win32') {
      opt["icon"] = path.join(__srcdir,'/assets/icons/logo.ico')
    }
    mainWindow = new BrowserWindow(opt)

    mainWindow.loadFile('./src/renderer/layout.html')
    mainWindow.on('closed', function () {
        mainWindow = null
    })
    mainWindow.once('ready-to-show', () => {
      mainWindow.show()
    })
    appMenu()
    electron.globalShortcut.register("CmdOrCtrl+Shift+i", () => {
        mainWindow.webContents.toggleDevTools();
    })
}

dialogs(mainWindow, 'dialogs')

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (mainWindow === null) createWindow()
})

ipcMain.on('getCmd', (event, arg) => {
})

app.on('open-url', (event, argv) => {
    global.sharedObjects = {
        args:argv,
    }
});
app.on('second-instance', (event, argv) => {
    if(argv&&argv[0]){
        global.sharedObjects = {
            args:argv[argv.length-1],
        }
    }else{
        global.sharedObjects = {
            args:argv,
        }
    }
});
