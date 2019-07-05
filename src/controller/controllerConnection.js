var CreateCtrlJsControllerConnection = function () {
  this.keypressStates = {};
  this.playerNumber = -1;
  this.playerName = localStorage.getItem('ctrljsPlayerName');
  this.playerNameElement = document.getElementById("PlayerName");
  this.playerNameElement.value = this.playerName;
  this.connected = false;

  // Read the connecting ID from the URL
  this.searchParams = new URLSearchParams(window.location.search);
  if (this.searchParams.has("id")) {
    // Initialize ourselves as a Peer
    this.myID = null;
    this.peer = new Peer({
      config: {
        iceServers: [{
          urls: [ "stun:stun.l.google.com:19302", "stun:ws-turn2.xirsys.com" ]
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
    this.peer.on('open', (id) => {
      this.myID = id;
      console.log('My peer ID is: ' + this.myID);
    });
    this.peer.on('error', (err) =>  { console.error(err); });
    this.conn = this.peer.connect(this.searchParams.get("id"));

    this.conn.on('open', () => {
      document.getElementById("Status").innerText = "Connected!";
      // Receive messages
      this.conn.on('data', (data) =>  {
        if("playerNum" in data){ this.playerNumber = data.playerNum; }
        if("pingTime" in data){
          let pingMsg = "Player " + (this.playerNumber+1) + " - Ping: " + Math.round(performance.now() - data.pingTime) +"ms";
          document.getElementById("Status").innerText = pingMsg;
        }else{
          console.log('Received', data);
        }
      });
      this.setPlayerName();
      this.connected = true;
      this.pingLoop = this.measurePingPeriodically();
    });
    this.conn.on('close', () => {
      document.getElementById("Status").innerText = "Disconnected; perhaps the server shut down?!";
      console.log("Disconnected; perhaps the server shut down?");
      this.connected = false;
      clearInterval(this.pingLoop);
    });
  }

  // Send commands on valid button presses and releases
  this.sendPress = function (button)  {
    if (this.connected && (!button in this.keypressStates || !this.keypressStates[button])) {
      this.keypressStates[button] = true;
      if(this.conn != null){ this.conn.send({ state: 1, btn: button}); }
    }
  }
  this.sendRelease = function (button){
    if (this.connected && (!button in this.keypressStates || this.keypressStates[button])) {
      this.keypressStates[button] = false;
      if(this.conn != null){ this.conn.send({ state: 0, btn: button}); }
    }
  }

  // Update the Ping Measurement once every so often
  this.measurePingPeriodically = function (){
    return setInterval(()=>{
      if(this.conn != null){ this.conn.send({ pingTime: performance.now() }); }
    }, 2500);
  }

  // Read from the "Name" Textfield and set the player's name...
  this.setPlayerName = function (){
    this.playerName = this.playerNameElement.value;
    localStorage.setItem('ctrljsPlayerName', this.playerName);
    if(this.conn != null){ this.conn.send({ playerName: this.playerName }); }
  }

  // Handle leaving the window gracefully
  // Clean up connection; This appears to be a futile gesture...
  window.addEventListener("beforeunload", function() {
    if(this.conn !== null){ this.conn.close(); }
    if(this.peer !== null){ this.peer.close(); }
  });
}