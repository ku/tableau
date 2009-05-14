/*
 * tableau
 * Copyright (c) 2009 ku http://ido.nu/kuma/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var Tableau = {
	installGesture: function (callbackFunction) {
		var buttonPressed = false;
		var start = null;
		var last = null;

		var left, right, up, down;
		var dx = 0;
		var dy = 0;
		var threshold = 25;
		var done;

	function gestureStatusChanged() {
		if ( (left && right) && (  up && down ) ) {
			if ( !done ) {
				callbackFunction(buttonPressed);
				done = true;
			}
		//	var d  = document.getElementById("me");
		//	d.style.background = "red";
		}
	}

		document.addEventListener ( 'mouseup', function (e) {
			buttonPressed = null;
		} , true);
		document.addEventListener ( 'mousedown', function (e) {
			dx = dy = 0;
			left =  right =  up =  down = false;
			last = start = { x: e.clientX,  y: e.clientY};
			buttonPressed = e;
			done = false;
		}, true );
		

		var f = function (e) {
				var x = (e.clientX - last.x > 0 ) ? 1: -1;
				var d = e.clientX - start.x;

				if ( x != dx || Math.abs(d) > threshold ) {
					start.x = e.clientX;
					if ( Math.abs(d) > threshold ) {
						if ( dx > 0 ) {
							right = true;
						} else {
							left = true;
						}
						gestureStatusChanged();
					}
				}

				var y = (e.clientY - last.y > 0 ) ? 1: -1;
				var d = e.clientY - start.y;
				if ( y != dy || Math.abs(d) > threshold ) {
					start.y = e.clientY;
					if ( Math.abs(d) > threshold ) {
						if ( dy > 0 ) {
							down = true;
						} else {
							up = true;
						}
						gestureStatusChanged();
					}
				}
			dy = y;


			last = { x: e.clientX,  y: e.clientY};
			dx = x;

		}

		document.addEventListener ( 'mousemove', function (e) {
			if ( buttonPressed && !done )
				f(e);
		}, true );

	}
}

Tableau.installGesture( function (e) {
	if (e.target ) {
		var image;
		if ( e.target instanceof HTMLImageElement ) {
			image  = e.target;
		} else {
			var images = e.target.getElementsByTagName('img');
			 image = images[0];
		}

		if ( !image )
			return;

		// avoid to dupe hack.
		var uri = image.src;
		var hash = uri.replace(/\W/g, '');
		var shared = document.body.getAttribute(hash);
		if ( shared )
			return;
	
	
		var title = document.title + "";
		document.body.setAttribute(hash, 1);
		chrome.extension.connect().postMessage({
			command: 'share',
			uri: uri,
			caption: title.link(document.location.href)
	 } );
	}
} );


