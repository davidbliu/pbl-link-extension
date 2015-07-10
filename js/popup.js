$(document).ready(function(){
//get current tab url
chrome.tabs.getSelected(null,function(tab) {
    	$('#url-input').val(tab.url);
});


// Create the XHR object.
function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // XHR for Chrome/Firefox/Opera/Safari.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // XDomainRequest for IE.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // CORS not supported.
    xhr = null;
  }
  return xhr;
}

// var root_url = "http://localhost:3000/"
var root_url = 'http://testing.berkeley-pbl.com/'
$("#save").click(function(){
	$('#message').html('<h3>Saving link...</h3>');
	$('#message2').html('');
	key = $('#key-input').val();
	url = $('#url-input').val();
	description = $('#description-input').val();
	// directory = $('#directory-input').val();
	directory = $('#directories-dropdown').find(":selected").attr('id');

	params = "key="+key+"&url="+encodeURIComponent(url)+"&description="+encodeURIComponent(description)+"&directory="+encodeURIComponent(directory);
	url = root_url + 'chrome/create_go_link' + '?' + params
	var xhr = createCORSRequest('POST', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		$('#message').html(text);
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Error: unable to save link</h3>');
	};
	xhr.send();
});

$("#lookup").click(function(){
	$('#message').html('<h3>Looking up URL...</h3>');
	$('#message2').html('');
	url = $('#url-input').val();
	params = "url="+encodeURIComponent(url);
	url = root_url + 'chrome/lookup_url' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		$('#message').html(text);
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Error: lookup failed</h3>');
	};
	xhr.send();
});


//pull directory folder structure container
url = root_url+'chrome/directories_dropdown'
var xhr = createCORSRequest('GET', url);
if (!xhr) {
	$('#message').html('<h3>CORS not supported</h3>');
	return;
}
// Response handlers.
xhr.onload = function() {
	var text = xhr.responseText;
	$('#directory-input-container').html(text);
};
xhr.onerror = function() {
	var text = xhr.responseText;
	$('#message').html('<h3>Error: failed to load directories</h3>');
};
xhr.send();




});
