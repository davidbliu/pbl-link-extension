
var email = 'none'
chrome.identity.getProfileUserInfo(function(userInfo) {
 /* Use userInfo.email, or better (for privacy) userInfo.id
    They will be empty if user is not signed in in Chrome */
    email = userInfo.email;
});

var url = '';
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

  function resetDefaultSuggestion() {
    chrome.omnibox.setDefaultSuggestion({
    description: 'go: Search PBL Links for %s'
    });
  }
  resetDefaultSuggestion();

  function navigate(url) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: url});
    });
  }

  chrome.omnibox.onInputEntered.addListener(function(text) {
    if(text.indexOf('add:') != -1){
      key = text.split('add:')[1].trim();
      chrome.tabs.getSelected(null,function(tab) {
            url = tab.url;
            var description = prompt("Saving your key: " + key + " with the URL: " + url + ". Would you like to add a description?", "no description");
            if (description!=null)
            {
              params = "key="+encodeURIComponent(key)+"&url="+encodeURIComponent(url)+'&email='+encodeURIComponent(email)+ "&description="+description
              post_url = root_url + 'chrome/create_go_link' + '?' + params  
              var xhr = createCORSRequest('POST', post_url); 
              if (!xhr) {
                console.log('unable to send CORS request');
                return;
              }
              xhr.onload = function() {
                alert('successfully saved link');
              };
              xhr.onerror = function() {
                alert('unable to save link');
              };
              xhr.send();

            }
            
      });

    }
    else{
      navigate("http://pbl.link/" + text);
    }
  });


