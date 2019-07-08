const { app, BrowserWindow, MenuItem, Menu, ipcMain, systemPreferences, dialog } = require('deskgap'); // The OS Window Container
const robot = require("robotjs"); // The Input Spoofing System

// Apply keyevents from the UI
ipcMain.on('keyEvent', (e, message) => {
    //e.sender.send('hello-from-node', "Hello, " + message);
    //robot.
});

// Send an example message to the html window...
ipcMain.on('hello-to-node', (e, message) => {
    e.sender.send('hello-from-node', "Hello, " + message);
});

let mainWindow;

app.once('ready', () => {

    mainWindow = new BrowserWindow({
        show: false,
        width: 800, height: 600,
    }).once('ready-to-show', () => {
        mainWindow.show();

        // Speed up the mouse.
        robot.setMouseDelay(2);

        var twoPI = Math.PI * 2.0;
        var screenSize = robot.getScreenSize();
        var height = (screenSize.height / 2) - 10;
        var width = screenSize.width;

        for (var x = 0; x < width; x++) {
            y = height * Math.sin((twoPI * x) / width) + height;
            robot.moveMouse(x, y);
        }
    });

    if (process.platform !== 'win32') {
        mainWindow.webView.setDevToolsEnabled(true);
    }

    for (const eventName of ['blur', 'focus']) {
        mainWindow.on(eventName, () => { mainWindow.webView.send('window-' + eventName) })
    }

    mainWindow.loadFile("app.html");

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
