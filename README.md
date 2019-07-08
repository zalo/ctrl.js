# [ctrl.js](https://ctrljs.xyz/)

A bookmarklet for using phones as impromptu controllers in browser-based "local" multiplayer games.

Save <a href="javascript:{var s=document.createElement('script');s.src='https://ctrljs.xyz/bookmarklet.js',document.body.appendChild(s);};void(0);">this bookmarklet</a> to your browser:
```
javascript:{var s=document.createElement("script");s.src="https://ctrljs.xyz/bookmarklet.js",document.body.appendChild(s);};void(0);
```

## How it works

When you activate the bookmarklet, it adds a QR Code to your current page, which can be scanned with your smartphone's camera app (the default camera app on iOS and Google Lens on Android (touch the bubble)).

Visiting the page on that QR code brings your phone to a page which will form a P2P connection with the bookmarklet.  This connection routes button presses from your phone to the webpage, and injects them as `KeyboardEvent`s.  Anything on the page _that is subscribed to `KeyboardEvent`s_ will receive button-press events as if they had come from your keyboard.

The current default button mapping is:
 - Up     -> `w`
 - Left   -> `a`
 - Down   -> `s`
 - Right  -> `d`
 - A      -> `Space`
 - B      -> `Shift`
 - Start  -> `Enter`

 These keymappings can be changed by clicking on the player's name above the QR Code.

## Help! Why doesn't the bookmarklet work on [specific site]?

The bookmarklet works on the majority of HTML5 apps.  There are two primary situations where it could fail:
 - The app is embedded within a cross-origin iframe.  ctrl.js can not inject events into cross-origin iframes because browsers prevent access as a security precaution. Usually, ctrl.js will suggest clicking into the iframe's source directly to bypass this issue.  However, if the iframe's source was set dynamically, ctrl.js cannot read its current location.  If you'd like your dynamically-sourced cross-origin iframe to support ctrl.js, you should implement receiving `KeyEvent`s through the [postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) (ctrl.js will send these).
 - The website's [Content Security Policy](https://github.blog/2013-04-19-content-security-policy/) prevents embedding scripts from bookmarklets.  This can be [disabled through your browser](https://chrome.google.com/webstore/detail/disable-content-security/ieelmcmcagommplceebfedjlakkhpden?hl=en), but it's not recommended for security.

Alternatively, you can try using [the standalone desktop application](https://github.com/zalo/ctrl.js/releases), which will create `KeyboardEvent`'s at the OS level.


## Credits

Based on [peer.js](https://peerjs.com/), [qrcode.js](https://github.com/davidshimjs/qrcodejs/), [three.js](https://threejs.org/), and [Skeleton.css](http://getskeleton.com/).
