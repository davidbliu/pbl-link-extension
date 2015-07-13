


// var root_url = "http://localhost:3000/"
var root_url = 'http://testing.berkeley-pbl.com/'

function activateToggles(){
	$('#add-toggle').click(function(){
		$('#add-container').toggle();
	});
	$('#create-directory-toggle').click(function(){
		$('#create-directory-container').toggle();
	});
	$('#search-toggle').click(function(){
		$('#search-container').toggle();
	});
}

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

function activateSearch(){
	$('#search-input').keypress(function(e) {
	    if(e.which == 13) {
	       pullSearchData();
	    }
	});
}
function pullSearchData(){
	search_term = $('#search-input').val();
	$('#message').html('<h3>Searching for '+search_term+'</h3>');
	params = "search_term="+encodeURIComponent(search_term);
	url = root_url + 'chrome/search' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	that = $(this);
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		var results = JSON.parse(text);
		var resultsDiv = document.createElement('div');
		for(var i=0 ;i<results.length;i++){
			var searchResult = document.createElement('div');
			var searchLink = document.createElement('a');
			$(searchLink).text("pbl.link/" + results[i].attributes.key);
			$(searchLink).attr('href', 'http://pbl.link/'+results[i].attributes.key);
			$(searchLink).attr('target', '_blank');
			$(searchLink).attr('title', results[i].attributes.description);
			$(searchResult).append(searchLink);
			// console.log(results[i].key);
			// console.log(results[i]);
			// console.log(results[i].get('key'));
			console.log(searchResult)
			$(resultsDiv).append(searchResult);
		}
		console.log(results)
		$('#search-results').html(resultsDiv);
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Error: search failed</h3>');
	};
	xhr.send();
}
function activateSaveButton(){
$("#save").click(function(){
	$('#message').html('<h3>Saving link...</h3>');
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
		activateUndoButton();
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Error: unable to save link</h3>');
	};
	xhr.send();
});
}
function activateUndoButton(){
	$('#undo-btn').click(function(){
		console.log('undo button has been clicked');
		$('#message').html('<h3>Undoing...</h3>');
		key = $('#key-input').val();
		params = "key="+key;
		url = root_url + 'chrome/undo_create_go_link' + '?' + params
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
			$('#message').html('<h3>Error: unable to undo create action</h3>');
		};
		xhr.send();
	});
}
function lookupURL(){
	$('#message').html('<h3>Looking up URL...</h3>');
	url = $('#url-input').val();
	params = "url="+encodeURIComponent(url);
	url = root_url + 'chrome/lookup_url' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	that = $(this);
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		$('#message').html(text);
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Failed to lookup URL</h3>');
	};
	xhr.send();
}
function activateCreateDirectoryButton(){
$('#create-directory-btn').click(function(){
	$('#message').html('<h3>Creating your directory...</h3>');
	directory = $('#create-directory-input').val();
	params = "directory="+encodeURIComponent(directory);
	url = root_url + 'chrome/create_directory' + '?' + params
	var xhr = createCORSRequest('POST', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		$('#message').html(text);
		pullDirectoryDropdown();
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#message').html('<h3>Error: failed to create directory</h3>');
	};
	xhr.send();
});
}
//pull directory folder structure container
function pullDirectoryDropdown(){
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
}

$(document).ready(function(){
//get current tab url
chrome.tabs.getSelected(null,function(tab) {
    	$('#url-input').val(tab.url);
    	lookupURL();
});

pullDirectoryDropdown();
activateToggles();
activateSearch();
activateSaveButton();
activateCreateDirectoryButton();
activateUndoButton();


});
