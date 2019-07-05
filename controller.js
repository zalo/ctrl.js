var CreateCtrlJsController = function () {
  this.time = new THREE.Clock();
  this.lastTimeRendered = 0.0;
  this.viewDirty = true;

  this.currentTouches = {};

  this.init = function () {
    this.parentNode = document.currentScript.parentNode;

    // Initialize new ctrl.js controller connection
    this.ctrljs = new CreateCtrlJsControllerConnection();

    // Set up the Renderer
    this.curCanvas = document.createElement('canvas');
    this.curCanvas.style = "position:fixed; top:0px; left:0px;z-index: 1;";
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
    this.fontLoader.load( 'optimer_bold.typeface.json', (font) => {
      this.font = font;
      this.buttons = [];
      this.A      = this.createWhiteSphere(this.buttons, 17.5, -4, 3.0, 0.15,0.15,0.05, 8, 0x0000ff, "A");
      this.B      = this.createWhiteSphere(this.buttons,  7.5, -4, 3.0, 0.15,0.15,0.05, 8, 0x00ff00, "B");
      this.Start  = this.createWhiteSphere(this.buttons,  0  ,  5, 3.0, 0.1, 0.1, 0.05, 8, 0xff0000, "START", 10);
      this.Up     = this.createWhiteSphere(this.buttons, -12 ,  0, 3.0, 0.175, 0.1, 0.05, 8, 0x888888, "^");
      this.Down   = this.createWhiteSphere(this.buttons, -12 , -8, 3.0, 0.175, 0.1, 0.05, 8, 0x888888, "v");
      this.Left   = this.createWhiteSphere(this.buttons, -16 , -4, 3.0, 0.1, 0.175, 0.05, 8, 0x888888, "<");
      this.Right  = this.createWhiteSphere(this.buttons, -8  , -4, 3.0, 0.1, 0.175, 0.05, 8, 0x888888, ">");
      //this.Center = this.createWhiteSphere(this.buttons, -12 , -4, 2.2, 0.1,  0.1, 0.05, 8, 0x888888);

      // Name the buttons so they can properly give off events later
      this.A.btnName = "A"; this.B.btnName = "B"; this.Start.btnName = "Start"; this.Up.btnName = "Up";
      this.Down.btnName = "Down"; this.Left.btnName = "Left"; this.Right.btnName = "Right";
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
        font: this.font,
        size: textSize,
        height: 1,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 2
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
    this.viewDirty = true;
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
    this.handleTouches();
  }.bind(this);

  // Run this with every touch event, updates the touch logic on demand
  this.handleTouches = function(){
    // Clear Highlighting
    for(emitting of this.previousPressed){
      emitting.material.emissive.setHex( 0x000000 );
      emitting.material.emissiveIntensity = 1;
    }
    let currentPressed = [];
    
    // Highlight objects currently being touched
    if(this.touchEvent){
      for(let touchID = 0; touchID < this.touchEvent.touches.length; touchID++){
        let touch = this.touchEvent.touches[touchID];
    
        // First move the directional buttons (if applicable)
        // TODO: Just renormalize the next ray to start within the center of the buttons...
        this.raycaster.setFromCamera( this.touchToRay(touch.startX, touch.startY), this.camera );
        let intersections = this.raycaster.intersectObjects( [this.controllerBody] );//this.scene.children );
        if(intersections.length > 0 && intersections[0].object === this.controllerBody){
          if(intersections[0].point.x < -4.0){
            let curAverage   = this.Up.position.clone().add(this.Down.position).add(this.Left.position).add(this.Right.position).divideScalar(4.0);
            let displacement = intersections[0].point.sub(curAverage);

            this.Up.position.add(displacement);
            this.Down.position.add(displacement);
            this.Left.position.add(displacement);
            this.Right.position.add(displacement);
            //this.Center.position.add(displacement);
          }
        }

        // Raycast against all the buttons!
        this.raycaster.setFromCamera( this.touchToRay(touch.clientX, touch.clientY), this.camera );
        intersections = this.raycaster.intersectObjects( this.buttons );//this.buttons );
        for(let i = 0; i < intersections.length; i++){
          if(intersections[i].object === this.controllerBody) { continue; }
          intersections[i].object.material.emissive.setHex( 0xffffff );
          intersections[i].object.material.emissiveIntensity = touch.force * -1.0;

          // Send Press Event if new intersection...
          if(!this.previousPressed.includes(intersections[i].object)){
            this.ctrljs.sendPress(intersections[i].object.btnName);
          }
          currentPressed.push(intersections[i].object);
        }
      }
    }
    // Send release events if pressed last time, but not this time...
    for(let i = 0; i < this.previousPressed.length; i++){
      if(!currentPressed.includes(this.previousPressed[i])){
        this.ctrljs.sendRelease(this.previousPressed[i].btnName);
      }
    }
    this.previousPressed = currentPressed;
  }
  this.touchToRay = function(x,y){
    this.tempRay.set(( x / window.innerWidth  ) * 2 - 1, 
                    -( y / window.innerHeight ) * 2 + 1);
    return this.tempRay;
  }

  this.animate = function animatethis() {
    requestAnimationFrame(() => this.animate());
    //Set up a lazy render loop where it only renders if it's been interacted with in the last second
    if (this.viewDirty) { this.lastTimeRendered = this.time.getElapsedTime(); this.viewDirty = false; }
    if (this.time.getElapsedTime() - this.lastTimeRendered < 0.2) { this.renderer.render(this.scene, this.camera); }
  };

  this.init();
  this.animate();
}

var controller = new CreateCtrlJsController();