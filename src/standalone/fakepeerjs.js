// Fake Peerjs Peer Constructor - Communicates with the real one through Deskgap
var Peer = function (iceConfig) {
  // Quick and dirty eventemitter
  this.events = {};
  this.on = function(eventName, eventFunc){
    if(eventName in this.events){
      this.events[eventName].push(eventFunc);
    }else{
      this.events[eventName] = [eventFunc];
    }
  }
  this.emit = function(eventName, context, arg){
    for(let i = 0; i < this.events[eventName].length; i++){
      if(arg){
        context.events[eventName][i].call(context, arg);
      }else{
        context.events[eventName][i].call(context);
      }
    }
  }
  
  // Fake Peer Constructor
  this.messageUI = window.deskgap.messageUI;
  this.messageUI.send('peerConstructor', iceConfig);
  this.messageUI.on('peerOpen',  function (e, message) { this.emit("open",  this, message); });
  this.messageUI.on('peerError', function (e, message) { this.emit("error", this, message); });

  // Handle Fake Connections
  this.connections = {};
  this.FakeConnection = function (parent, id) {
    this.parent = parent;
    this.peer = id;
    this.events = {};
    this.on = function(eventName, eventFunc){
      if(eventName in this.events){
        this.events[eventName].push(eventFunc);
      }else{
        this.events[eventName] = [eventFunc];
      }
    }
    this.close = function(){ parent.send('connectionClose', { peer:this.peer }); }
    this.send = function(data){ parent.send('connectionData', { peer:this.peer, data:data }); }
  }

  // Create fake connection internally and store it in a dictionary
  this.messageUI.on('peerConnection', function (e, message) {
    let fakeConnection = new this.FakeConnection(this, message.peer);
    this.connections[message.peer] = fakeConnection;
    this.emit("connection", this, this.connections[message.peer]);
  });
  this.messageUI.on('connectionOpen',  function (e, message) { this.emit("open",  this.connections[message.peer]); });
  this.messageUI.on('connectionClose', function (e, message) { this.emit("close", this.connections[message.peer]); });
  this.messageUI.on('connectionData',  function (e, message) { this.emit("data",  this.connections[message.peer], message.data);  });
  this.messageUI.on('connectionError', function (e, message) { this.emit("error", this.connections[message.peer], message.error); });
}
