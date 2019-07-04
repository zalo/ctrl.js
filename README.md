# ctrl.js

A bookmarklet for using phones as impromptu controllers in browser-based "local" multiplayer games.

Save this bookmarklet to your browser:
```
javascript:{var s=document.createElement("script");s.src="https://zalo.github.io/ctrl.js/bookmarklet.js",document.body.appendChild(s);};void(0);
```

## How it works

When you activate the bookmarklet, it adds a QR Code to your current page, which can be scanned with your smartphone's camera app (the default camera app on iOS and Google Lens on Android (touch the bubble)).

Visiting the page on that QR code brings your phone to a page which will form a P2P connection with the bookmarklet.  This connection routes button presses from your phone to the webpage, and injects them as `KeyboardEvent`s.  Anything on the page _that is subscribed to `KeyboardEvent`s_ will receive button-press events as if they had come from your keyboard.

The current default button mapping is:
 - Up    -> `w`
 - Left  -> `a`
 - Down  -> `s`
 - Right -> `d`
 - A     -> `Space`
 - B     -> `Shift`


## Testing

[Debug Test](https://zalo.github.io/ctrl.js/testServer.html) - Scan the marker with your phone's camera app to test connectivity and receipt of events.


## Credits

Based on [peer.js](https://peerjs.com/) and [qrcode.js](https://github.com/davidshimjs/qrcodejs).
