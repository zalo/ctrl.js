// Add this as your bookmarklet:
// javascript:{var s=document.createElement("script");s.src="https://zalo.github.io/ctrl.js/bookmarklet.js",document.body.appendChild(s);};void(0);

// Execute on a delay in-case the body hasn't been constructed yet...
setTimeout(()=>{
  // Don't initialize the bookmarklet again if there's already a StatusView
  let existingStatusView = document.getElementById("statusView");
  if(typeof(existingStatusView) === 'undefined' || existingStatusView === null){
    var i, s, ss = ['https://zalo.github.io/ctrl.js/peerjs.min.js', 'https://zalo.github.io/ctrl.js/qrcode.min.js', 'https://zalo.github.io/ctrl.js/injector.js'];
    //var i, s, ss = ['peerjs.min.js', 'qrcode.min.js', 'Injector.js']; // The local testing version...
    for (i = 0; i != ss.length; i++) {
      s = document.createElement('script');
      s.src = ss[i];
      document.body.appendChild(s);
    }
  }
}, 100);
