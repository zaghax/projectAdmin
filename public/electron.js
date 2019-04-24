const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')

const path = require('path');
const url = require('url');
const isDev = require('electron-is-dev');
const os = require('os');

const {
    OPEN_PLAYER_WINDOW,
    CLOSE_PLAYER_WINDOW,
    PLAYER_WINDOW_CLOSED,
    PLAY_VIDEO,
    PAUSE_VIDEO,
    STOP_VIDEO,
    LOAD_VIDEO,
    TRIGGER_NEXT_VIDEO,
    SET_PROGRESS_BAR_STATUS,
    SEEK_TO,
    PLAYER_READY
} = require('../src/utils/constants');

let mainWindow;
let playerWindow;

function createWindow() {
    BrowserWindow.addDevToolsExtension(
        path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/3.6.0_0')
    ); 
    BrowserWindow.addDevToolsExtension(
        path.join(os.homedir(), '/Library/Application Support/Google/Chrome/Default/Extensions/lmhkpmbekcpmknklioeibfkpmmfibljd/2.17.0_0')
    ); 
    mainWindow = new BrowserWindow({
        width: 900,
        height: 680,
        title: 'Administrator'
    });
    mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
    mainWindow.on('closed', () => mainWindow = null);
}

function createPlayerWindow () {
    playerWindow = new BrowserWindow({
        width: 640, 
        height: 390, 
        focusable: true,
        alwaysOnTop: true,
        title: 'Player'
    });
    playerWindow.loadURL(isDev ? 'http://localhost:3000/player' : `file://${path.join(__dirname, '../build/index.html/player')}`);
    playerWindow.on('closed', () => {
        playerWindow = null;
        mainWindow.send(PLAYER_WINDOW_CLOSED);
    });
}

ipcMain.on(OPEN_PLAYER_WINDOW, () => {
    createPlayerWindow();
});

ipcMain.on(CLOSE_PLAYER_WINDOW, () => {
    playerWindow.close();
});

ipcMain.on(PLAY_VIDEO, () => {
    playerWindow.send(PLAY_VIDEO);
});

ipcMain.on(PAUSE_VIDEO, () => {
    playerWindow.send(PAUSE_VIDEO);
});

ipcMain.on(STOP_VIDEO, () => {
    playerWindow.send(STOP_VIDEO);
});

ipcMain.on(LOAD_VIDEO, (event, arg) => {
    playerWindow.send(LOAD_VIDEO, arg);
});

ipcMain.on(TRIGGER_NEXT_VIDEO, () => {
    mainWindow.send(TRIGGER_NEXT_VIDEO);
});

ipcMain.on(SET_PROGRESS_BAR_STATUS, (event, videoStatus, videoDuration) => {
    mainWindow.send(SET_PROGRESS_BAR_STATUS, videoStatus, videoDuration);
});

ipcMain.on(SEEK_TO, (event, seekTime) => {
    playerWindow.send(SEEK_TO, seekTime);
});

ipcMain.on(PLAYER_READY, () => {
    mainWindow.send(PLAYER_READY);
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});