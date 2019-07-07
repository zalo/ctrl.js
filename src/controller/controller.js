var CreateCtrlJsController = function () {
  this.time = new THREE.Clock();
  this.lastTimeRendered = 0.0;
  this.viewDirty = true;
  this.moveArrowButtons = false;
  this.useJoystick = null;

  this.currentTouches = {};

  this.init = function () {
    this.parentNode = document.currentScript.parentNode;

    // Initialize new ctrl.js controller connection
    this.ctrljs = new CreateCtrlJsControllerConnection(this.updateView);

    // Set up the Renderer
    this.curCanvas = document.createElement('canvas');
    this.curCanvas.style = "position:fixed; top:0px; left:0px; bottom:0px; right:0px; z-index: 1;";
    //curCanvas.id = canvasId;
    this.parentNode.insertBefore(this.curCanvas, document.currentScript.nextSibling);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.curCanvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.setSize();
    window.addEventListener('resize', this.setSize, false);
    window.addEventListener('orientationchange', this.setSize, false);

    // Set up the scene camera
    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 2000);
    this.camera.position.set(0, -10, 30);
    this.camera.lookAt(0, -1, 0);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);//0xa0a0a0
    //this.scene.fog = new THREE.Fog(0x000000, 200, 600);//0xa0a0a0
    this.light = new THREE.HemisphereLight(0xffffff, 0x444444);
    this.light.position.set(100, 100, 0);
    this.scene.add(this.light);

    //Create the controller object
    this.controllerBody = this.createWhiteSphere(null, 0,0,0, 1,0.45,0.1, 16, 0xffffff);
    this.fontLoader = new THREE.FontLoader();
    this.fontLoader.load( '/src/controller/optimer_bold.typeface.json', (font) => {
      this.font = font;
      this.buttons = [];
      this.A      = this.createWhiteSphere(this.buttons, 18, -3, 3.0, 0.15, 0.15, 0.05, 8, 0x0000ff, "A");
      this.B      = this.createWhiteSphere(this.buttons,  8, -7, 3.0, 0.15, 0.15, 0.05, 8, 0x00ff00, "B");
      this.Start  = this.createWhiteSphere(this.buttons,  0  ,  5, 3.0, 0.1,   0.1, 0.05, 8, 0xff0000, "START", 10);
      // Name the buttons so they can properly give off events later
      this.A.btnName = "A"; this.B.btnName = "B"; this.Start.btnName = "Start"; 

      this.toggleDPad();
    } );

    // Handle Touch Events
    this.raycaster = new THREE.Raycaster();
    this.tempRay = new THREE.Vector2();
    this.touchEvent = null;
    this.previousPressed = [];
    this.curCanvas.addEventListener( 'touchstart',       this.onTouchStart,  false );
    this.curCanvas.addEventListener( 'touchmove',        this.onTouchUpdate, false );
    this.curCanvas.addEventListener( 'touchforcechange', this.onTouchUpdate, false );
    this.curCanvas.addEventListener( 'touchcancel',      this.onTouchEnd,    false );
    this.curCanvas.addEventListener( 'touchend',         this.onTouchEnd,    false );
    this.curCanvas.addEventListener( 'gesturechange',    this.onTouchEnd,    false );
  }

  this.toggleDPad = function(){
    // Clean-up old directional input if applicable
    if(this.useJoystick !== null){
      if (this.useJoystick) {
        this.scene.remove(this.joystick);
        //this.buttons.remove(this.joystick);
        this.buttons.splice(this.buttons.indexOf(this.joystick), 1);
        this.joystick = null;
        this.useJoystick = false;
      } else {
        this.scene.remove(this.Up);    this.buttons.splice(this.buttons.indexOf(this.Up), 1);//this.buttons.remove(this.Up);
        this.scene.remove(this.Down);  this.buttons.splice(this.buttons.indexOf(this.Down), 1);//this.buttons.remove(this.Down);
        this.scene.remove(this.Left);  this.buttons.splice(this.buttons.indexOf(this.Left), 1);//this.buttons.remove(this.Left);
        this.scene.remove(this.Right); this.buttons.splice(this.buttons.indexOf(this.Right), 1);//this.buttons.remove(this.Right);
        this.useJoystick = true;
      }
    } else { this.useJoystick = true; }
    if(this.useJoystick){
      this.joystick = new THREE.Group();
      this.joystick.position.set( -11, -4, 2.5 );
      this.joystick.add(this.createWhiteSphere(null,  0, 0, 5.0,  0.125, 0.125, 0.05,  8, 0x777777));
      this.joystick.add(this.createWhiteSphere(null,  0, 0, 2.5,  0.02, 0.02, 0.14,  8, 0x777777));
      this.buttons.push(this.joystick);
      this.scene.add(this.joystick);
      this.Up = {btnName: "Up"}; this.Down = {btnName: "Down"}; this.Left = {btnName: "Left"}; this.Right = {btnName: "Right"};
    } else {
      this.joystick = null;
      this.Up     = this.createWhiteSphere(this.buttons, -12 ,  2, 3.0, 0.1, 0.1, 0.05, 8, 0x888888, "/\\");
      this.Down   = this.createWhiteSphere(this.buttons, -12 , -8, 3.0, 0.1, 0.1, 0.05, 8, 0x888888, "v");
      this.Left   = this.createWhiteSphere(this.buttons, -17 , -3, 3.0, 0.1, 0.1, 0.05, 8, 0x888888, "<");
      this.Right  = this.createWhiteSphere(this.buttons, -7  , -3, 3.0, 0.1, 0.1, 0.05, 8, 0x888888, ">");
      this.Up.btnName = "Up"; this.Down.btnName = "Down"; this.Left.btnName = "Left"; this.Right.btnName = "Right";
    }
    this.viewDirty = true;
    this.frameNumber = 0;
  }

  // Handle resizing
  this.setSize = function(){
    setTimeout(()=>{
      this.parentWidth  = window.innerWidth;//this.parentNode.getBoundingClientRect().width;
      this.parentHeight = window.innerHeight;//this.parentNode.getBoundingClientRect().height;
      this.renderer.setSize(this.parentWidth, this.parentHeight);
      this.camera.aspect = this.parentWidth / this.parentHeight;
      this.camera.fov = 90 / this.camera.aspect;
      this.camera.updateProjectionMatrix();
      this.viewDirty = true;
    }, 200);
  }.bind(this);

  // Define a shorthand for creating the primitive of the controller...
  this.createWhiteSphere = function(buttonList, px,py,pz, sx,sy,sz, quality, color, text="", textSize = 30){
    let material = new THREE.MeshPhongMaterial({ color: color });
    let ellipsoid = new THREE.Mesh(new THREE.SphereBufferGeometry(30, quality, quality), material);
    ellipsoid.position.set(px, py, pz);
    ellipsoid.scale.set(sx, sy, sz);
    ellipsoid.castShadow = true;

    if(this.font){
      ellipsoid.textGeometry = new THREE.TextGeometry( text, {
        font: this.font, size: textSize, height: 1, curveSegments: 4, bevelEnabled: true, 
        bevelThickness: 10, bevelSize: 1, bevelOffset: 0, bevelSegments: 2
      } );
      ellipsoid.textMesh = new THREE.Mesh(ellipsoid.textGeometry, material);
      ellipsoid.add(ellipsoid.textMesh);
      ellipsoid.textMesh.position.set(-25 + (textSize*0.5), -12, 30);
    }

    if(buttonList){ buttonList.push(ellipsoid); }
    this.scene.add(ellipsoid);
    return ellipsoid;
  }

  // Graft startX and startY into the existing events!
  this.onTouchStart = function(event){
    for(let i = 0; i < event.changedTouches.length; i++){
      for(let j = 0; j < event.touches.length; j++){
        if(event.changedTouches[i].identifier === event.touches[j].identifier){
          event.touches[j].startX = event.changedTouches[i].clientX;
          event.touches[j].startY = event.changedTouches[i].clientY;
        }
      }
    }
    if(this.touchEvent){
      for(let i = 0; i < event.touches.length; i++){
        for(let j = 0; j < this.touchEvent.touches.length; j++){
          if(event.touches[i].identifier === this.touchEvent.touches[j].identifier){
            event.touches[i].startX = this.touchEvent.touches[j].startX;
            event.touches[i].startY = this.touchEvent.touches[j].startY;
          }
        }
      }
    }
    this.touchEvent = event;
    event.preventDefault();
    event.stopPropagation();
    this.ctrljs.playerNameElement.blur(); // Possible fix for android browser bug...
    this.viewDirty = true;
    this.frameNumber = 0; // Forces an instant refresh
    this.handleTouches();
  }.bind(this);
  this.onTouchUpdate = function(event){
    for(let i = 0; i < event.touches.length; i++){
      for(let j = 0; j < this.touchEvent.touches.length; j++){
        if(event.touches[i].identifier === this.touchEvent.touches[j].identifier){
          event.touches[i].startX = this.touchEvent.touches[j].startX;
          event.touches[i].startY = this.touchEvent.touches[j].startY;
        }
      }
    }
    this.touchEvent = event;
    event.preventDefault();
    event.stopPropagation();
    this.viewDirty = true;
    if(this.useJoystick) { this.frameNumber = 0; } // Forces an instant refresh
    this.handleTouches();
  }.bind(this);
  this.onTouchEnd = function(event){
    if(event.touches){
      for(let i = 0; i < event.touches.length; i++){
        for(let j = 0; j < this.touchEvent.touches.length; j++){
          if(event.touches[i].identifier === this.touchEvent.touches[j].identifier){
            event.touches[i].startX = this.touchEvent.touches[j].startX;
            event.touches[i].startY = this.touchEvent.touches[j].startY;
          }
        }
      }
      this.touchEvent = event;
    }
    event.preventDefault();
    event.stopPropagation();
    this.viewDirty = true;
    // Must wait one whole frame before sending release events!
    // This is critical as some applications won't recognize events
    // received on the same frame...
    if(this.frameNumber != 0) {
      this.handleTouches();
      this.frameNumber = 0; // Forces an instant refresh
    } else {
      setTimeout(()=>{
        this.handleTouches();
        this.frameNumber = 0;
      }, 16);
    }
  }.bind(this);

  // Run this with every touch event, updates the touch logic on demand
  this.handleTouches = function(){
    // Clear Highlighting
    for(emitting of this.previousPressed){
      if(typeof emitting.material !== 'undefined'){
        emitting.material.emissive.setHex( 0x000000 );
        emitting.material.emissiveIntensity = 1;
      }
    }
    if(this.joystick !== null){ this.joystick.quaternion.setFromEuler(new THREE.Euler()); }
    this.currentPressed = [];
    
    // Highlight objects currently being touched
    if(this.touchEvent){
      for(let touchID = 0; touchID < this.touchEvent.touches.length; touchID++){
        let touch = this.touchEvent.touches[touchID];

        // Raycast against all the buttons!
        this.raycaster.setFromCamera( this.touchToRay(touch.startX, touch.startY), this.camera );
        intersections = this.raycaster.intersectObjects( [this.controllerBody] );//this.buttons );
        for(let i = 0; i < intersections.length; i++){
          let minDist = 1000.0; let closestButton = 0;
          for(let j = 0; j < this.buttons.length; j++){
            let distToThisButton = intersections[i].point.clone().sub(this.buttons[j].position).lengthSq();
            if(distToThisButton < minDist){ minDist = distToThisButton; closestButton = j; }
          }

          if(typeof this.buttons[closestButton].material !== 'undefined') {
            // Handle the button pressing logic
            this.buttons[closestButton].material.emissive.setHex( 0xffffff );
            this.buttons[closestButton].material.emissiveIntensity = touch.force >= 1.0 ? -0.25 : touch.force * -0.25;
            this.handlePress(this.buttons[closestButton]);
          } else {
            // Handle the joystick logic
            let movement = new THREE.Vector2((touch.clientX - touch.startX), (touch.clientY - touch.startY)).multiplyScalar(0.01).clampLength(0,0.5);
            this.buttons[closestButton].quaternion.setFromEuler(new THREE.Euler(movement.y, movement.x, 0));

            movement.divideScalar(0.5); let sensitivity = 0.7; // 0-1 Value for what it takes to trigger that axis...
            if(movement.dot(new THREE.Vector2( 1, 0)) > (1.0-sensitivity)) { this.handlePress(this.Right); }
            if(movement.dot(new THREE.Vector2(-1, 0)) > (1.0-sensitivity)) { this.handlePress(this.Left);  }
            if(movement.dot(new THREE.Vector2( 0,-1)) > (1.0-sensitivity)) { this.handlePress(this.Up);    }
            if(movement.dot(new THREE.Vector2( 0, 1)) > (1.0-sensitivity)) { this.handlePress(this.Down);  }
          }
        }
      }
    }
    // Send release events if pressed last time, but not this time...
    for(let i = 0; i < this.previousPressed.length; i++){
      if(!this.currentPressed.includes(this.previousPressed[i])){
        this.ctrljs.sendRelease(this.previousPressed[i].btnName);
        try { navigator.vibrate([50]); } catch (e) { }
      }
    }
    this.previousPressed = this.currentPressed;
  }
  this.touchToRay = function(x,y){
    this.tempRay.set(( x / window.innerWidth  ) * 2 - 1, 
                    -( y / window.innerHeight ) * 2 + 1);
    return this.tempRay;
  }
  this.handlePress = function(button){
    if(!this.previousPressed.includes(button)){
      this.ctrljs.sendPress(button.btnName);
      try { navigator.vibrate([25]); } catch (e) { }
    }
    this.currentPressed.push(button);
  }

  this.frameNumber = 0;
  this.updateView = function(){ this.viewDirty = true; }
  this.animate = function animatethis() {
    requestAnimationFrame(() => this.animate());
    // Set up a lazy render loop where it only renders if it's been interacted with in the last second
    // And even then, only every third frame to preserve the battery-life of the phone
    if (this.viewDirty) { this.lastTimeRendered = this.time.getElapsedTime(); this.viewDirty = false; }
    if (this.time.getElapsedTime() - this.lastTimeRendered < 0.2 && this.frameNumber % 2 === 0) {
      this.scene.background = this.ctrljs.disconnected ? new THREE.Color(0xff0000) : new THREE.Color(0x000000);
      this.renderer.render(this.scene, this.camera); 
    }
    this.frameNumber += 1;
  };

  this.init();
  this.animate();
}

var controller = new CreateCtrlJsController();