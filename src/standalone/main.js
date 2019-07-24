const { app, BrowserWindow, /*MenuItem, Menu,*/ ipcMain/*, systemPreferences, dialog*/ } = require('deskgap'); // The OS Window Container
const robot = require("robotjs"); // The Input Spoofing System

// The Node.js Overrides enabling Websockets and WebRTC
WebSocket             = require('ws');
RTCPeerConnection     = require('wrtc').RTCPeerConnection;
RTCSessionDescription = require('wrtc').RTCSessionDescription;
RTCIceCandidate       = require('wrtc').RTCIceCandidate;

require('peerjs/lib/exports');
location = { protocol: 'http' };

// Part of the implementation of the node-peer-js system...
ipcMain.on('peerConstructor', (e, iceConfig) => {
    var currentPeer = new Peer(iceConfig);
    currentPeer.on("open",  (id)    => { e.sender.send('peerOpen',  id);    });
    currentPeer.on("error", (error) => { e.sender.send('peerError', error); });
    currentPeer.on("connection", (connection) => {
        connection.on("open",  () => { e.sender.send('connectionOpen',   { peer: connection.peer }); });
        connection.on("close", () => { e.sender.send('connectionClose',  { peer: connection.peer }); });
        connection.on("data",  (data)  => {
            data.peer = connection.peer; e.sender.send('connectionData',  data); 
        });
        connection.on("error", (error) => {
            error.peer = connection.peer; e.sender.send('connectionError', error); 
        });
        e.sender.send('peerConnection', { peer: connection.peer });
    });
});

// Apply keyevents from the UI
ipcMain.on('keydown', (e, keyEvent) => {
    let chrCode = keyEvent.keyCode - 48 * Math.floor(keyEvent.keyCode / 48);
    let chr = String.fromCharCode((96 <= keyEvent.keyCode) ? chrCode: keyEvent.keyCode);
    robot.keyToggle(chr.toLowerCase(), "down");
});
ipcMain.on('keyup', (e, keyEvent) => {
    let chrCode = keyEvent.keyCode - 48 * Math.floor(keyEvent.keyCode / 48);
    let chr = String.fromCharCode((96 <= keyEvent.keyCode) ? chrCode: keyEvent.keyCode);
    robot.keyToggle(chr.toLowerCase(), "up");
});

// Send an example message to the html window...
ipcMain.on('hello-to-node', (e, message) => {
    e.sender.send('hello-from-node', "Hello, " + message);
});

let mainWindow;

app.once('ready', () => {

    mainWindow = new BrowserWindow({
        show: false,
        width: 300, height: 600,
    }).once('ready-to-show', () => {
        mainWindow.show();

        // Speed up the mouse.
        robot.setMouseDelay(2);

        var twoPI = Math.PI * 2.0;
        var screenSize = robot.getScreenSize();
        var height = (screenSize.height / 2) - 10;
        var width = screenSize.width;

        for (var x = 0; x < width; x++) {
            let y = height * Math.sin((twoPI * x) / width) + height;
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
