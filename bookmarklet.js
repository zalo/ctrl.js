// Add this as your bookmarklet:
// javascript:{var s=document.createElement("script");s.src="https://zalo.github.io/ctrl.js/bookmarklet.js",document.body.appendChild(s);};void(0);

// Execute on a delay in-case the body hasn't been constructed yet...
setTimeout(function() {
  // Don't initialize the bookmarklet again if there's already a StatusView
  var existingStatusView = document.getElementById("statusView");
  if(typeof(existingStatusView) === 'undefined' || existingStatusView === null){
    var i, s, ss = [
      'https://ctrljs.xyz/src/peerjs.min.js', 
      'https://ctrljs.xyz/src/bookmarklet/qrcode.min.js', 
      'https://ctrljs.xyz/src/bookmarklet/injector.js'];
    //var i, s, ss = ['/src/peerjs.min.js', '/src/bookmarklet/qrcode.min.js', '/src/bookmarklet/injector.js']; // The local testing version...
    for (i = 0; i != ss.length; i++) {
      s = document.createElement('script');
      s.src = ss[i];
      document.body.appendChild(s);
    }
  }
}, 100);
