
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
function showSpinner(){
	$('#loading-spinner').show();
}
function hideSpinner(){
	$('#loading-spinner').hide();
}
function activateSearch(){
	$('#search-input').keypress(function(e) {
	    if(e.which == 13) {
	       pullSearchData();
	    }
	});
}

function stripText(text){
	return text.toLowerCase().replace(/[^a-zA-Z0-9 -]/g, '').replace(/ /g,'-');
}
function labelAddActions(){
	$('#tags-input').keypress(function(e) {
	    if(e.which == 13) {
	       tag = $('#tags-input').val();
	       tag = stripText(tag);
	       $(this).val("");
	       htmlTag = document.createElement('div');
	       $(htmlTag).addClass('label');
	       $(htmlTag).addClass('label-default');
	       $(htmlTag).addClass('tag-label');
	       $(htmlTag).text(tag);
	       $(htmlTag).append('&nbsp;<a class = "label-remove-link" href = "javascript:void(0);">x</a>');
	       $('#tags-container').append(htmlTag);
	       removeLabelActions();
	    }
	});
}
function removeLabelActions(){
	$('.label-remove-link').click(function(){
		$(this).parent().remove();
	});
}


function copyToClipboard( text ){
    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);
}
function activateCopyLinkToClipboard(){
	$('.lookup-match').click(function(){
		$(this).fadeIn(100).fadeOut(100).fadeIn(100);
		copyToClipboard($(this).text());
	})
}
activateCopyLinkToClipboard();

function activateToggles(){
	$('#add-toggle').click(function(){
		$('#add-container').slideToggle("fast");
	});
	$('#create-directory-toggle').click(function(){
		$('#create-directory-container').slideToggle("fast");
	});
	$('#search-toggle').click(function(){
		$('#search-container').slideToggle("fast");
	});
	$('#favorite-toggle').click(function(){
		$('#favorite-links-container').slideToggle("fast");
	});
}


function pullSearchData(){
	search_term = $('#search-input').val();
	params = "search_term="+encodeURIComponent(search_term)+"&email="+email;
	url = root_url + 'chrome/search' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	that = $(this);
	showSpinner();
	// Response handlers.
	xhr.onload = function() {
		hideSpinner();
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
			$(resultsDiv).append(searchResult);
		}
		console.log(results)
		$('#search-results').html(resultsDiv);
		$('#search-results').prepend('<p>Displaying results for '+search_term+'</p>');
	};
	xhr.onerror = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html('<h3>Error: search failed</h3>');
	};
	xhr.send();
}
function activateSaveButton(email){
$("#save").click(function(){
	$('#message').html('<h3>Saving link...</h3>');
	key = $('#key-input').val();
	url = $('#url-input').val();
	description = $('#description-input').val();
	tags = [];
	$('.tag-label').each(function(){
		tags.push($(this).text().substring(0, $(this).text().length-2));
	});
	directory = $('#directory-input').val();
	directory = $('#directories-dropdown').find(":selected").attr('id');

	params = "key="+key+"&url="+encodeURIComponent(url)+"&description="+encodeURIComponent(description)+'&tags='+encodeURIComponent(tags.join(','))+'&email='+email;
	url = root_url + 'chrome/create_go_link' + '?' + params
	var xhr = createCORSRequest('POST', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	showSpinner();
	// Response handlers.
	xhr.onload = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html(text);
		activateUndoButton();
	};
	xhr.onerror = function() {
		hideSpinner();
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
		showSpinner();
		// Response handlers.
		xhr.onload = function() {
			hideSpinner();
			var text = xhr.responseText;
			$('#message').html(text);
		};
		xhr.onerror = function() {
			hideSpinner();
			var text = xhr.responseText;
			$('#message').html('<h3>Error: unable to undo create action</h3>');
		};
		xhr.send();
	});
}
function lookupURL(){
	$('#message').html('<h4>Looking up URL...</h4>');
	url = $('#url-input').val();
	params = "url="+encodeURIComponent(url);
	url = root_url + 'chrome/lookup_url' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	that = $(this);
	showSpinner();
	// Response handlers.
	xhr.onload = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html(text);
		activateCopyLinkToClipboard();
	};
	xhr.onerror = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html('<h4>Failed to lookup URL</h4>');
	};
	xhr.send();
}

function pullFavoriteLinks(email){
	url = root_url+'chrome/favorite_links'
	url += "?email="+email
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	// Response handlers.
	xhr.onload = function() {
		var text = xhr.responseText;
		$('#favorite-links-container').append(text);
	};
	xhr.onerror = function() {
		var text = xhr.responseText;
		$('#favorite-links-container').html('<p>Error: unable to retrieve favorite links</p>');
	};
	xhr.send();
}

// var root_url = "http://localhost:3000/"
var root_url = 'http://testing.berkeley-pbl.com/'
var tab_title = ''
//get current tab url
chrome.tabs.getSelected(null,function(tab) {
    	$('#url-input').val(tab.url);
    	lookupURL();
    	tab_title = tab.title;
    	//add title to the form
    	tab_title = tab_title.toLowerCase().replace(/[^a-zA-Z0-9 -]/g, '').replace(/ /g,'-').split('--')[0];//replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()?\''\""\|]/g,"")

    	$('#key-input').val(tab_title);
});

var email = '';
chrome.identity.getProfileUserInfo(function(userInfo) {
 /* Use userInfo.email, or better (for privacy) userInfo.id
    They will be empty if user is not signed in in Chrome */
    email = userInfo.email;
    $('#chrome-email-span').text(email);
    pullFavoriteLinks(email);
    activateSaveButton(email);
    //pull favorite links
});
activateToggles();
activateSearch();
labelAddActions();


