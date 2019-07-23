// The default keymappings...
// TODO: Store these per-player and in localStorage!
var keyMappings = [{
  Up:    {key: "w",     code: "KeyW",      keyCode: 87, which: 87},
  Left:  {key: "a",     code: "KeyA",      keyCode: 65, which: 65},
  Down:  {key: "s",     code: "KeyS",      keyCode: 83, which: 83},
  Right: {key: "d",     code: "KeyD",      keyCode: 68, which: 68},
  A:     {key: " ",     code: "Space",     keyCode: 32, which: 32},
  B:     {key: "Shift", code: "ShiftLeft", keyCode: 16, which: 16},
  Start: {key: "Enter", code: "Enter",     keyCode: 13, which: 13}
},{
  Up:    {key: "w",     code: "KeyW",      keyCode: 87, which: 87},
  Left:  {key: "a",     code: "KeyA",      keyCode: 65, which: 65},
  Down:  {key: "s",     code: "KeyS",      keyCode: 83, which: 83},
  Right: {key: "d",     code: "KeyD",      keyCode: 68, which: 68},
  A:     {key: " ",     code: "Space",     keyCode: 32, which: 32},
  B:     {key: "Shift", code: "ShiftLeft", keyCode: 16, which: 16},
  Start: {key: "Enter", code: "Enter",     keyCode: 13, which: 13}
},{
  Up:    {key: "w",     code: "KeyW",      keyCode: 87, which: 87},
  Left:  {key: "a",     code: "KeyA",      keyCode: 65, which: 65},
  Down:  {key: "s",     code: "KeyS",      keyCode: 83, which: 83},
  Right: {key: "d",     code: "KeyD",      keyCode: 68, which: 68},
  A:     {key: " ",     code: "Space",     keyCode: 32, which: 32},
  B:     {key: "Shift", code: "ShiftLeft", keyCode: 16, which: 16},
  Start: {key: "Enter", code: "Enter",     keyCode: 13, which: 13}
},{
  Up:    {key: "w",     code: "KeyW",      keyCode: 87, which: 87},
  Left:  {key: "a",     code: "KeyA",      keyCode: 65, which: 65},
  Down:  {key: "s",     code: "KeyS",      keyCode: 83, which: 83},
  Right: {key: "d",     code: "KeyD",      keyCode: 68, which: 68},
  A:     {key: " ",     code: "Space",     keyCode: 32, which: 32},
  B:     {key: "Shift", code: "ShiftLeft", keyCode: 16, which: 16},
  Start: {key: "Enter", code: "Enter",     keyCode: 13, which: 13}
},{
  Up:    {key: "w",     code: "KeyW",      keyCode: 87, which: 87},
  Left:  {key: "a",     code: "KeyA",      keyCode: 65, which: 65},
  Down:  {key: "s",     code: "KeyS",      keyCode: 83, which: 83},
  Right: {key: "d",     code: "KeyD",      keyCode: 68, which: 68},
  A:     {key: " ",     code: "Space",     keyCode: 32, which: 32},
  B:     {key: "Shift", code: "ShiftLeft", keyCode: 16, which: 16},
  Start: {key: "Enter", code: "Enter",     keyCode: 13, which: 13}
}];

// Load Keymappings from the window.localStorage if possible
var ctrlJSControlsPath = 'ctrljsControls-' + window.location.host + window.location.pathname;
var siteKeymappings = window.localStorage.getItem(ctrlJSControlsPath) || keyMappings;

// Define the Injectable Ctrl.js Viewport
var ctrlJsServer = function () {
  this.init = function(){
    // The Connection Objects Keyed by the Peer IDs
    this.connections = {};
    // This Instance's PeerID
    this.peerId = null;

    // Initialize ourselves as a Peer using an RTCConfiguration object
    // Please do not use these turn servers; they are not made for high bandwidth!
    this.peer = new Peer({
      config: {
        iceServers: [{
          urls: "stun:stun.l.google.com:19302"
        }, {
          username: "RZyygb9oUYQFuiNJ62O1gr61l_qbtLeiyH6driGchkplknMYoj2q2loF_33bLqk9AAAAAF0c60R6YWxv",
          credential: "44ba5ddc-9dbb-11e9-997a-a695319b0c25",
          urls: [
            "turn:ws-turn2.xirsys.com:80?transport=udp",
            "turn:ws-turn2.xirsys.com:3478?transport=udp",
            "turn:ws-turn2.xirsys.com:80?transport=tcp",
            "turn:ws-turn2.xirsys.com:3478?transport=tcp",
            "turns:ws-turn2.xirsys.com:443?transport=tcp",
            "turns:ws-turn2.xirsys.com:5349?transport=tcp"
          ]
        }]
      }
    });

    // Upon connection, begin initializing Network-related callbacks
    this.peer.on('open', function(id) {
      this.peerId = id;
      console.log('My peer ID is: ' + this.peerId);
      this.createStatusView();

      // Scan for iframes to inject keyboard events into...
      this.listOfIFrames = document.getElementsByTagName("iframe");
      this.ignoreIFrames = false;
      for(let i = 0; i < this.listOfIFrames.length; i++){
        try { this.listOfIFrames[i].contentWindow.document;
        } catch(err) { this.listOfIFrames[i].problematic = true; this.ignoreIFrames = true; }
      }
      if(this.ignoreIFrames) { this.addIFrameWarningDiv(); }

      this.peer.on('connection', function(connection) {
        connection.on('open', function() {
          this.connections[connection.peer] = connection;
          console.log('I have seen that: ' + connection.peer + " has successfully connected!");
          connection.buttonStates = {};
          this.updatePlayerNumbers(false);
          this.addPlayerDiv(connection);
          this.updatePlayerNumbers(true);
        }.bind(this));
        connection.on('data', function(data) {
          if("pingTime" in data){ connection.send(data); }
          if("playerName" in data){
             connection.playerName = data.playerName; 
             this.updatePlayerDiv(connection, true);
          }
          if("btn" in data) {
             connection.buttonStates[data.btn] = data.state;
             this.spoofKeyboardEvent(connection, data.btn, data.state);
             this.updatePlayerDiv(connection, false);
          }

          // Append this packet to the debug history if it exists...
          let history = document.getElementById("ctrlJsEvents");
          if(history){ history.innerText = JSON.stringify(data); }// + "\n" + history.innerText; }

          if("connected" in data) {
            if(!data.connected){
              if(history){ history.innerText = "Received Disconnect Event from Client...\n" + history.innerText; }
              console.log("Received Disconnect Event from Client...");
              connection.close();
            }
          }
        }.bind(this));
        connection.on('close', function() {
          console.log(connection.peer + " has left...");
          this.statusView.players.removeChild(connection.playerDiv);
          delete this.connections[connection.peer];
          this.updatePlayerNumbers(true);
        }.bind(this));
        connection.on('error', function(err) { console.error(err); });
      }.bind(this));
    }.bind(this));
    this.peer.on('error', function(err) { console.error(err); });

    // Create the Miniature Viewport in the corner of the page
    this.createStatusView = function(){
      // Create the StatusView div using spiffy APIs
      this.statusView = document.createElement("div");
      this.statusView.id = "statusView";
      this.statusView.style = "position:fixed; bottom:0px; right:0px; color:#000000; border: 1px solid black; background:white; z-index: 10002;";
      this.statusView.innerText = "Players";

      // Add the Player's Container
      this.statusView.players = document.createElement("div");
      this.statusView.players.id = "statusViewPlayers";
      this.statusView.players.style = "border: 1px solid black;";
      this.statusView.insertAdjacentElement("beforeend", this.statusView.players);

      // Add the QR Code (with padding so it will scan!)
      let qrCodeLink = "http://ctrljs.xyz?i=" + this.peerId;
      this.statusView.qrContainer = document.createElement("div");
      this.statusView.qrContainer.id = "qrcodeContainer";
      this.statusView.qrContainer.style = "padding:10px";
      this.statusView.qrCode = new QRCode(this.statusView.qrContainer, qrCodeLink);

      // Wrap it in a link for an alternate mode of sharing the connection link
      this.statusView.qrContainerContainer = document.createElement("a");
      this.statusView.qrContainerContainer.href = qrCodeLink;
      this.statusView.qrContainerContainer.target = "_blank";
      this.statusView.qrContainerContainer.insertAdjacentElement("beforeend", this.statusView.qrContainer);

      // Add the QR Code to the status view!
      this.statusView.insertAdjacentElement("beforeend", this.statusView.qrContainerContainer);

      // Add the status view to the page!
      document.body.insertAdjacentElement("beforeend", this.statusView);
    }

    // Create the Player Status (with Keyboard Maps)
    this.addPlayerDiv = function(connection) {
      connection.playerDiv = document.createElement("div");
      connection.playerDiv.id = connection.peer+"'s Player Status";

      connection.playerDiv.settings = document.createElement("div");
      connection.playerDiv.settings.style = "display: none;";
      connection.playerDiv.settings.open = false;
      connection.playerDiv.label = document.createElement("label");
      connection.playerDiv.label.style = "position: relative; padding:2px; display: block; background-image: linear-gradient(white, gray); border: 1px solid black;text-shadow: 0px 0px 2px slategrey;";
      connection.playerDiv.label.innerHTML = '<font style="color:#00cc00;font-weight:bold;font-size:1.25em;">P' + (connection.playerNum+1) + '</font>' + ' - NewPlayer';
      connection.playerDiv.label.settings = connection.playerDiv.settings;
      connection.playerDiv.label.onclick = function() {
        this.settings.open = !this.settings.open;
        this.settings.style = this.settings.open ? "display: block;" : "display: none;";
      }

      connection.playerDiv.settings.content = document.createElement("div");
      connection.playerDiv.settings.content.style = "background: white;width: auto; display: block; padding:2px;";
      connection.playerDiv.settings.content.innerHTML = "Keybindings";
      connection.playerDiv.settings.content.buttons = [];

      // Create the List of Keys to Map
      Object.getOwnPropertyNames(siteKeymappings[connection.playerNum]).forEach(function(buttonName) {
        let listItem = document.createElement("li"); listItem.innerText = buttonName+": ";
        let button = document.createElement("button"); button.innerText = siteKeymappings[connection.playerNum][buttonName].code;
        button.name = buttonName; button.connection = connection;
        listItem.insertAdjacentElement("beforeend", button);
        connection.playerDiv.settings.content.insertAdjacentElement("beforeend", listItem);

        // Define the Button's Keyboard Binding Callback
        button.keyDownFunction = function(event){
          siteKeymappings[this.connection.playerNum][this.name] = event;
          this.innerText = siteKeymappings[this.connection.playerNum][this.name].code;
          window.localStorage.setItem(ctrlJSControlsPath, siteKeymappings);
          document.removeEventListener("keydown", this.keyDownFunction);
        }.bind(button);
        button.onclick = function() {
          this.innerText = "Waiting for keypress...";
          document.addEventListener('keydown', button.keyDownFunction, false);
        }
        connection.playerDiv.settings.content.buttons.push(button);
      }.bind(this));
      connection.playerDiv.settings.insertAdjacentElement("beforeend", connection.playerDiv.settings.content);

      connection.playerDiv.insertAdjacentElement("beforeend", connection.playerDiv.label);
      connection.playerDiv.insertAdjacentElement("beforeend", connection.playerDiv.settings);
      this.statusView.players.insertAdjacentElement("beforeend", connection.playerDiv);
    }

    // Update the Player Status
    this.updatePlayerDiv = function(connection, updateText) {
      if(typeof(connection.playerDiv) !== 'undefined'){
        // This is "expensive" and can trigger layouts!
        connection.playerDiv.label.style = "position: relative; padding:2px; display: block; background-image: linear-gradient(white, gray); border: 1px solid black;text-shadow: 0px 0px 2px slategrey;";
        Object.getOwnPropertyNames(connection.buttonStates).forEach(function(btn) {
          if(connection.buttonStates[btn]) {
            connection.playerDiv.label.style = "position: relative; padding:2px; display: block; background-image: linear-gradient(gray, white); border: 1px solid black;text-shadow: 0px 0px 2px slategrey;";
          }
        }.bind(this));
        if(updateText){
          connection.playerDiv.label.innerHTML = '<font style="color:#00cc00;font-weight:bold;font-size:1.25em">P' + (connection.playerNum+1) + '</font>' + ' - ' + connection.playerName;
          for(let i = 0; i < connection.playerDiv.settings.content.buttons.length; i++){
            connection.playerDiv.settings.content.buttons[i].innerText = siteKeymappings[connection.playerNum][connection.playerDiv.settings.content.buttons[i].name].code;
          }
        }
      }
    }

    // Handle injecting the keyboard events into the page...
    this.spoofKeyboardEvent = function(connection, button, state) {
      let mapping = siteKeymappings[connection.playerNum][button];
      let keyOptions = { key: mapping.key, code: mapping.code, keyCode: mapping.keyCode, bubbles: true, cancelable: false };

      if(state){
        document.body.dispatchEvent(new KeyboardEvent("keydown",  keyOptions));
        document.body.dispatchEvent(new KeyboardEvent("keypress", keyOptions));
        for(let i = 0; i < this.listOfIFrames.length; i++){
          try {
            this.listOfIFrames[i].contentWindow.document.body.dispatchEvent(new KeyboardEvent("keydown",  keyOptions));
            this.listOfIFrames[i].contentWindow.document.body.dispatchEvent(new KeyboardEvent("keypress",  keyOptions));
          } catch(err) {
             if(!this.ignoreIFrames){ this.listOfIFrames[i].problematic = true; this.addIFrameWarningDiv(); this.ignoreIFrames = true; }
             this.listOfIFrames[i].contentWindow.postMessage(new KeyboardEvent("keydown",  keyOptions), "*");
             this.listOfIFrames[i].contentWindow.postMessage(new KeyboardEvent("keypress",  keyOptions), "*");
          }
        }
        if(window.deskgap){ window.deskgap.messageUI.send("keydown", keyOptions); }
      } else {
        document.body.dispatchEvent(new KeyboardEvent("keyup", keyOptions));
        for(let i = 0; i < this.listOfIFrames.length; i++){
          try {
            this.listOfIFrames[i].contentWindow.document.body.dispatchEvent(new KeyboardEvent("keyup",  keyOptions));
          } catch(err) {
            if(!this.ignoreIFrames){ this.listOfIFrames[i].problematic = true; this.addIFrameWarningDiv(); this.ignoreIFrames = true; }
            this.listOfIFrames[i].contentWindow.postMessage(new KeyboardEvent("keyup",  keyOptions), "*");
          }
        }
        if(window.deskgap){ window.deskgap.messageUI.send("keyup", keyOptions); }
      }
    }

    // Give the user an out when they hit the Cross-Origin IFrame Issue
    this.addIFrameWarningDiv = function() {
      this.statusView.iframeWarning = document.createElement("div");
      this.statusView.iframeWarning.id = "StatusIFrameWarning";
      this.statusView.iframeWarning.style = "border: 1px solid red;font-size:1.15em;font-weight:bold;";
      this.statusView.iframeWarning.innerHTML = "<p>Can't send keyboard inputs into IFrame.</p>"+
        '<p>Press <a href='+ "\"javascript:document.getElementById('statusView').removeChild(document.getElementById('StatusIFrameWarning'));\">Okay</a> to Ignore</p>"+
        "<p> or Open the IFrame Directly:</p>";
      for(let i = 0; i < this.listOfIFrames.length; i++){
        if(this.listOfIFrames[i].problematic){
          this.statusView.iframeWarning.innerHTML += "<p><a href="+this.listOfIFrames[i].src+">"+this.listOfIFrames[i].id+"</a></p>";
        }
      }
      this.statusView.insertAdjacentElement("afterbegin", this.statusView.iframeWarning);
    }
    this.hideWarning = function(){ this.statusView.removeChild(this.statusView.iframeWarning); }

    // The number of players have changed, so send updates to all of the connected clients.
    this.updatePlayerNumbers = function(updateDiv) {
      let i = 0; 
      Object.getOwnPropertyNames(this.connections).forEach(function(peerID) {
        this.connections[peerID].playerNum = i;
        this.connections[peerID].send({playerNum: i});
        if(updateDiv){ this.updatePlayerDiv(this.connections[peerID], true); }
        i+=1; 
      }.bind(this));
    }

    // Rescan for iframes that have been added since the bookmarklet was loaded
    this.iframeScanner = setInterval(function(){
      this.listOfIFrames = document.getElementsByTagName("iframe");
    }.bind(this), 5000);

    // Clean up the connections before the page exits
    window.addEventListener("beforeunload", function() {
      Object.getOwnPropertyNames(this.connections).forEach(function(peerID) {
        this.connections[peerID].send({connected: false});
        //this.connections[peerID].close();
      }.bind(this));
      //if(this.peer !== null){ this.peer.close(); }
    });
  }

  this.init();
}

// Initialize the server view on a delay
setTimeout(function() {
  var ctrlJs = new ctrlJsServer();
}.bind(this), 200);
