const { app, BrowserWindow, BrowserView, ipcMain, Notification, session, globalShortcut,Menu, MenuItem  } = require('electron');
const path = require('path')

let mainWindow;
let view1;
let view2;
let innerHeight;
let innerWidth;
let currentURL;

const NOTIFICATION_TITLE = 'DDD'
const NOTIFICATION_BODY = 'New Message From ----'


function createWindow() {

    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize

    innerHeight = height
    innerWidth = width

    mainWindow = new BrowserWindow({
        width,
        height,
        title: 'DDD',
        fullscreenable:false,
        webPreferences: {
            webviewTag: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        icon: path.join(__dirname, './build/icon.png')
    });

    mainWindow.loadFile('index.html')
    mainWindow.setResizable(false)
    mainWindow.on('closed', function () {
        mainWindow = null;
    })
    // mainWindow.on('enter-html-full-screen', function () {
    //     if (mainWindow.isFullScreen()) {
    //       setTimeout(function() {
    //         mainWindow.setFullScreen(false)
    //         mainWindow.maximize()
    //       }, 2000)
    //     }
    //   })
    view2 = new BrowserView();
    mainWindow.addBrowserView(view2);

    view2.setBounds({ x: 0, y: 0, width, height: height -50 })
    view2.webContents.loadURL('http://localhost:3000/')

}
// app.commandLine.appendSwitch('enable-speech-dispatcher');
app.on('ready', () => {
    globalShortcut.register('CommandOrControl+R', ()=>{
        mainWindow.reload()
    });
    
    createWindow()
    // setInterval(() => {
    //     new Notification({
    //         title: NOTIFICATION_TITLE,
    //         body: NOTIFICATION_BODY
    //       }).show()
    // }, 5000);
   
    ipcMain.on('socket-data', (event, data) => {
        if (currentURL === data.url) {
            currentURL = null
            delete view1
            view1.setBounds({ x: 0, y: 0, width: 0, height: innerHeight - 50 });
            view2.setBounds({ x: 0, y: 0, width: innerWidth, height: innerHeight - 50 });

        } else {
            if (!view1) view1 = new BrowserView();

            mainWindow.addBrowserView(view1);
            view1.setBounds({ x: 0, y: 0, width: 350, height: innerHeight - 50 });
            view1.webContents.loadURL(data.url);
            currentURL = data.url
            view2.setBounds({ x: 350, y: 0, width: innerWidth - 350, height: innerHeight - 50 });
        }
    })

    ipcMain.on('socket-connect', (event, title) => {
        console.log('socket connected')
    })
});



app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
// app.on('enter-full-screen', (event) => {
//     event.preventDefault();
//   });
app.whenReady().then(() => {
    const existingMenu = Menu.getApplicationMenu();
    if (existingMenu) {
      existingMenu.append(new MenuItem({
        label: 'Tools',
        submenu: [{
          role: 'Clear_Cache',
          label:'Clear Cache',
          accelerator: process.platform === 'darwin' ? 'Cmd+I' : 'Alt+I',
          click: () => {
              session.defaultSession.clearCache().then(() => {
                  console.log('Cache cleared.');
              })
            }
        },
        {
        role: 'Hard_Refresh',
        label:'Hard Refresh',
        accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I',
        click: () => {
            session.defaultSession.clearCache().then(() => {
                console.log('Cache cleared.');
            });

            session.defaultSession.clearStorageData().then(() => {
                console.log('Storage data cleared.');
            })
            mainWindow.reload()
        }

        }]
    }));
    Menu.setApplicationMenu(existingMenu);
} 
})