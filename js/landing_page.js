var root_url = 'http://testing.berkeley-pbl.com/'
// var root_url = 'http://localhost:3000/'



function navigate(url) {
    // chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    // chrome.tabs.update(tabs[0].id, {url: url});
    // });
    chrome.windows.create({url: url, type:'popup',height: 500, width:700});
  }


function hitLandingPage(){
	chrome.tabs.getSelected(null,function(tab) {
    	url = tab.url
    	navigate(root_url + 'go/landing_page?url=' + encodeURIComponent(url));
	});
}

$('#landing-page-btn').click(function(){
	navigate(root_url + 'go/sharing_center');
});

$('#explore-page-btn').click(function(){
	navigate(root_url + 'go');
});

$('#add-page-btn').click(function(){
    chrome.tabs.getSelected(null,function(tab) {
        url = tab.url;
        key = tab.title;
        navigate(root_url + 'go/add_landing_page?url='+encodeURIComponent(url) + '&key='+encodeURIComponent(key));
    });
    
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

function showSpinner(){
    $('#loading-spinner').show();
}
function hideSpinner(){
    $('#loading-spinner').hide();
}

function lookupURL(url){
    params = "url="+encodeURIComponent(url);
    url = root_url + 'chrome/lookup' + '?' + params
    var xhr = createCORSRequest('GET', url);
    that = $(this);
    showSpinner();
    xhr.onload = function() {
        hideSpinner();
        var text = xhr.responseText;
        constructLookupList(JSON.parse(text));
    };
    xhr.onerror = function() {
        console.log('failed');
    };
    xhr.send();
}

function constructLookupList(results){
    if(results.length == 0){
        $('#lookup-container').append('<p class = "text-muted smalltext">This URL has not been made into a PBL Link yet</p>');
    }
    results_list = document.createElement('ul');
    $(results_list).addClass('list-group');
    for(var i=0;i<results.length;i++){
        li = document.createElement('li');
        $(li).text(results[i]);
        $(li).addClass('list-group-item');
        $(li).addClass('lookup-match');
        $(results_list).append(li);
    }
    $('#lookup-container').append(results_list);
    activateCopyLinkToClipboard();
}

function copyToClipboard( text ){
    var copyDiv = document.createElement('div');

    copyDiv.contentEditable = true;
    $(copyDiv).insertBefore($('#lookup-container'));
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    $(copyDiv).remove();
}
function activateCopyLinkToClipboard(){
    $('.lookup-match').click(function(){
        $(this).fadeOut(100).fadeIn(100);
        copyToClipboard($(this).text());
    })
}

function activateRegisterPushLink(){
    $('#register-push-link').click(function(){
        var bgPage = chrome.extension.getBackgroundPage();
        bgPage.registerForPush();
    });
}
activateRegisterPushLink();

chrome.tabs.getSelected(null,function(tab) {
        lookupURL(tab.url);
});


$('#add-input').keypress(function(e){
    if(e.which == 13) {
        key = $(this).val();
        chrome.tabs.getSelected(null,function(tab) {
            url = encodeURIComponent(tab.url);
            navigate(root_url + 'go/quick_add?url='+url+'&key='+key);
        });
        
    }
});