
//
// from AutoPatchWork http://code.google.com/p/autopatchwork/
// MIT licence 
// 
function createHTML(str){
	var html = str.replace(/<script(?:[ \t\r\n][^>]*)?>[\S\s]*?<\/script[ \t\r\n]*>|<\/?(?:i?frame|html|script|object)(?:[ \t\r\n][^<>]*)?>/gi, ' ');
	var htmlDoc = document.implementation.createHTMLDocument ?
		document.implementation.createHTMLDocument('HTMLParser') :
		document.implementation.createDocument(null, 'html', null);
	var range = document.createRange();
	range.selectNodeContents(document.documentElement);
	htmlDoc.documentElement.appendChild(range.createContextualFragment(html));
	return htmlDoc;
}

//
// tableau
// Copyright(c) 2009 ku ku0522a*gmail.com
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// MochKit Async wrappers.
function get(u) {
	var req = new XMLHttpRequest();
	req.open("GET", u, true);
	return sendXMLHttpRequest(req);
	//
}
function post(u, params) {
	var req = new XMLHttpRequest();
	req.open("POST", u, true);
	req.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
	var content = params && MochiKit.Base.queryString(params);
	return sendXMLHttpRequest(req, content);
}

// html utils
function findForm(doc, id) {
	for ( var i = 0; i < doc.forms.length; i++ ) {
		var f = doc.forms[i];
		if ( f.getAttribute("id") == id )
			return f;
	}
	return null;
}
function getFormQuery(f) {
	var params = {};
	var key = function (e)  { return e.getAttribute("name") || e.getAttribute("id")}
	for ( var k in f.elements )  {
		var e = f.elements[k];
		if ( e instanceof HTMLInputElement ) {
			params[key(e)] = e.getAttribute("value") || "";
		} else if ( e instanceof HTMLTextAreaElement ) {
			params[key(e)] = e.innerHTML;
		} else if ( e instanceof HTMLSelectElement ) {
			var option = e.options[e.selectedIndex];
			params[key(e)] = option.getAttribute("value") || option.innerHTML
		}
	}
	return params;
}

function createRequestFromForm( doc, id ) {
	var f = findForm(doc, id)
	return {
		method: f.getAttribute("method") || "GET",
		enctype: f.getAttribute("enctype") || "application/x-www-form-urlencoded",
		action: f.getAttribute("action"),
		params: getFormQuery(f)
	}
}

var Tableau = {
	share: function (ps) {
		Tumblr.share(ps);
	}
};

var Tumblr = {
	private: false,
	share: function (ps) {
		var self = this;
		var u = "http://www.tumblr.com/new/" + ps.type + "/";
		get(u).addCallback( function (req) {
			var doc = createHTML(req.responseText);
			var request = createRequestFromForm(doc, "edit_post");

			var q = request.params;
			delete q.preview_post;
			delete q.allow_answers;

			if ( Tumblr.private )
				q['post[state]'] = 'private';

			self.paramFilter[ps.type].apply(self, [q, ps]);

			return post(u, q)
		} ).addErrback( function (e) {
			console.log(e)
		} );

	},
	paramFilter: {
		link: function (q, ps) {
			q['post[one]'] = ps.page;
			q['post[two]'] = ps.pageUrl;
			//post[three] description
		},
		quote: function (q, ps) {
			q['post[one]'] = ps.body;
			q['post[two]'] = '<a href="' + ps.pageUrl + '">' + ps.page+ '</a>'
		},
		photo: function (q, ps) {
			q.photo_src = ps.itemUrl;
			q['post[two]'] = '<a href="' + ps.pageUrl + '">' + ps.page+ '</a>'
		}
	}
}

