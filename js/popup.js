
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

// BUNDLES
function createTab(tab_url){
	chrome.tabs.create({
			url: tab_url
		});
}

function pullBundles(email){
	params = "email="+email
	url = root_url + 'chrome/my_bundles' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	showSpinner();
	// Response handlers.
	xhr.onload = function() {
		hideSpinner();
		var text = xhr.responseText;
		bundles = JSON.parse(text);
		console.log(bundles);
		$('#bundles-area').html('');
		bundle_hash = {};
		for(var i=0;i<bundles.length;i++){

			bundle = bundles[i];
			bundleLink = document.createElement('a');
			$(bundleLink).text(bundle.attributes['name']);
			// $(bundleLink).attr('id', bundle.attributes['urls'].join(','));
			bundle_hash[bundle.attributes['name']] = bundle.attributes['urls'];
			$(bundleLink).attr('class', 'bundle-link');

			bundleDiv = document.createElement('div');
			$(bundleDiv).append(bundleLink);
			$('#bundles-area').append(bundleDiv);
		}
		activateBundleLinks(bundle_hash);

		
	};
	xhr.onerror = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html('<h3>Error: unable to pull bundles</h3>');
	};
	xhr.send();
}
function toggleBundles(email){
	$("#bundles-toggle").click(function(){
		if ($( "#bundles-container" ).is( ":visible" )){
			$('#bundles-container').hide('fast');
		}
		else{
			$('#bundles-container').show('fast');
			pullBundles(email);
		}
	});
}
function activateBundleLinks(bundle_hash){
	$('.bundle-link').click(function(){
		showSpinner();
		// urls = $(this).attr('id').split(',');
		urls = bundle_hash[$(this).text()];
		for(var i=0;i<urls.length;i++){
			createTab(urls[i]);
		}
		hideSpinner();
	});
}

function createBundle(name, email, urls,titles){
	// send post request to create bundles
	params = "email="+email + "&urls="+encodeURIComponent(urls)+'&name='+name+"&titles="+encodeURIComponent(titles);
	url = root_url + 'chrome/create_bundle' + '?' + params
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
		$('#message').html('<h3>Error: unable to create bundle</h3>');
	};
	xhr.send();
}
function activateBundleInput(email){
	$('#bundle-input').keypress(function(e) {
	    if(e.which == 13) {
	    	bundle_name = $(this).val();
	    	$(this).val('');
	    	console.log(bundle_name);
	    	chrome.tabs.query({
			    lastFocusedWindow: true     // In the current window
			}, function(tabs) {
				urls = [];
				titles = [];
				for(var i=0;i<tabs.length;i++){
					urls.push(tabs[i].url);
					titles.push(tabs[i].title.replace(',', ''))
				}
				createBundle(bundle_name, email, urls,titles);
			});
	    }
	});
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


function copyToClipboard( text ){
    var copyDiv = document.createElement('div');

    copyDiv.contentEditable = true;
    // document.body.appendChild(copyDiv);
    $(copyDiv).insertBefore($('#message'));
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    // document.body.removeChild(copyDiv);
    $(copyDiv).remove();
}
function activateCopyLinkToClipboard(){
	$('.lookup-match').click(function(){
		$(this).fadeOut(100).fadeIn(100);
		copyToClipboard($(this).text());
	})
}
activateCopyLinkToClipboard();

function activateToggles(){
	$('#add-toggle').click(function(){
		$('#add-container').slideToggle("fast");
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
			console.log(results[i].attributes);
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
	desc = $('#description-input').val();
	description = desc.split('#')[0];
	splits = desc.split('#');
	tags = [];
	for(var i=1;i<splits.length;i++){
		tags.push(splits[i].trim());
	}


	params = "key="+encodeURIComponent(key)+"&url="+encodeURIComponent(url)+"&description="+encodeURIComponent(description)+'&tags='+encodeURIComponent(tags.join(','))+'&email='+email;
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
		activateCopyLinkToClipboard();
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
	$('.undo-btn').click(function(){
		console.log('undo button has been clicked');
		$('#message').html('<h3>Undoing...</h3>');
		// id = $('#key-input').val();
		id = $(this).attr('id');
		params = "id="+id;
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

function activateMostUsedToggle(email){
	$('#most-used-toggle').click(function(){
		if ($( "#most-used-container" ).is( ":visible" )){
			$('#most-used-container').hide('fast');
		}
		else{
			$('#most-used-container').show('fast');
			pullMostUsedLinks(email);
		}
	});
}
function pullMostUsedLinks(email){
	url = root_url+'chrome/most_used_links'
	url += "?email="+email
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	// Response handlers.
	$('#most-used-area').html('');
	showSpinner();
	xhr.onload = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#most-used-area').append(text);
	};
	xhr.onerror = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#most-used-area').html('<p>Error: unable to retrieve most used links</p>');
	};
	xhr.send();
}
function resolveChromeEmail(chromeEmail){
	params = "chrome_email="+encodeURIComponent(chromeEmail);
	url = root_url + 'chrome/resolve_chrome_email' + '?' + params
	var xhr = createCORSRequest('GET', url);
	if (!xhr) {
		$('#message').html('<h3>CORS not supported</h3>');
		return;
	}
	showSpinner();
	// Response handlers.
	xhr.onload = function() {
		hideSpinner();
		var email = xhr.responseText;
		$('#chrome-email-link').text(email);
	    activateSaveButton(email);
	    toggleBundles(email);
	    activateBundleInput(email);
	    activateMostUsedToggle(email);
	};
	xhr.onerror = function() {
		hideSpinner();
		var text = xhr.responseText;
		$('#message').html('<h4>Unable to lookup chrome email</h4>');
	};
	xhr.send();
}

/**
THIS SECTION CONTAINS THE BOTTOM STUFF
*/
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
    resolveChromeEmail(email);
    //pull favorite links
});
activateToggles();
// activateSearch();
labelAddActions();


