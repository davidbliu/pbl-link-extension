


var root_url = 'http://testing.berkeley-pbl.com/';
var notification_hash = {};
// var root_url = 'http://localhost:3000/'

var email = 'none';
chrome.identity.getProfileUserInfo(function(userInfo) {
  // Use userInfo.email, or better (for privacy) userInfo.id
    // They will be empty if user is not signed in in Chrome 
    email = userInfo.email;
});

function receiver(message) {
  var opt = {
    type: "basic",
    title: "PBL Links Notifier",
    message: message,
    iconUrl: "pbl-logo-circle.png"
  }
  chrome.notifications.create('my_notification', opt);
}

function createPushNotification(notification){
  // console.log("creating push notification");
  if(notification.type != null && notification.type == 'links'){
    // console.log('printing notification details');
    // console.log(notification.message);
    // console.log(notification.timestamp);
    // console.log(notification.key);
    items = [{ title: "Message", message: notification.message},
              { title: "Sent From", message: notification.sender},
              { title: "Timestamp", message: notification.timestamp},
              { title: "Links", message: notification.key}];


    links = notification.key.split(',');
    for(var i=0;i<links.length;i++){
      links[i] = root_url + links[i].trim() + '/go'
    }
    notification_hash[notification.id] = links;

    console.log('here');
    var opt = {
      type: "list",
      title: notification.title,
      message: notification.message,
      iconUrl: "pbl-logo-circle.png",
      items: items
    }

    // var notif = new Notification(
    //   notification.title, {
    //   type:'list',
    //   icon: 'pbl-logo-circle.png',
    //   body:notification.message,
    // });
    
    var notif = chrome.notifications.create(notification.id, opt);
    // console.log(notification.id);
    // console.log('that was the id');
    
    // console.log(links);
    // console.log('thos were the links received');
    // // var link = root_url + notification.key + '/go'
    // chrome.notifications.onButtonClicked.addListener(function(){
    //   for(var i=0;i<links.length;i++){
    //     window.open(links[i]);
    //   }
    // });
    // notif.onclick = function () {
    //   for(var i=0;i<links.length;i++){
    //     window.open(links[i]);
    //   }
    // };
   }   
}

chrome.notifications.onClicked.addListener(function (data){
  links = notification_hash[data];
  for(var i=0;i<links.length;i++){
        window.open(links[i]);
      }
  delete notification_hash[data];

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
            if(key == ""){
              key = tab.title;
            }
            navigate(root_url + "/go/add_landing_page?key="+encodeURIComponent(key)+"&url="+encodeURIComponent(url));
            
      });

    }
    else{
      // navigate("http://pbl.link/" + text);
      navigate(root_url+text+'/go');
    }
  });


//register for push notificaitons
function registerCallback(registrationId) {
  if (chrome.runtime.lastError) {
    // When the registration fails, handle the error and retry the
    // registration later.
    console.log('registration failed, will try again later');
    return;
  }
  console.log('the registration id was');
  console.log(registrationId);
  chrome.storage.local.set({registered: true});
  chrome.storage.local.set({'registrationId': registrationId});
  sendRegistrationId(registrationId);

}

function sendRegistrationId(registrationId) {
  // Send the registration token to your application server
  // in a secure way.
  //send registration token and email
  console.log('email is '+email);
  params = 'email='+email+'&registration_id='+registrationId;
  post_url = root_url + 'chrome/register_notification_client' + '?' + params  
  var xhr = createCORSRequest('POST', post_url); 
  if (!xhr) {
    console.log('unable to send CORS request');
    return;
  }
  xhr.onload = function() {
    alert('successfully registered for notifications');
  };
  xhr.onerror = function() {
    alert('unable to register for notifications');
  };
  xhr.send();
}

function registerForPush(){
  console.log('trying to register with gcm');
  var senderIds = ["448301113255"];
  chrome.gcm.register(senderIds, registerCallback);

}

// chrome.storage.local.set({registered: false});
chrome.runtime.onStartup.addListener(function() {
// chrome.tabs.onHighlighted.addListener(function(){
  chrome.storage.local.get("registered", function(result) {
    // If already registered, bail out.
    if (result["registered"])
      return;

    // Up to 100 senders are allowed.
    registerForPush();
    // chrome.gcm.register(senderIds, registerCallback);
  });
});


chrome.gcm.onMessage.addListener(function(message) {
  console.log('received notification here asfasflkj');
  console.log(message['data']);
  createPushNotification(message['data']);
});

