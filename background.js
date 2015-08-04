


// chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
//     // chrome.tabs.executeScript(tabId, {file: "bundles.js"} );
//     console.log('this is a background page');
//     $('.link-row').each(function(){
//       console.log('this is a link row');
//     });
//     console.log('there are this many link rowrs');
//     $('.link-row').click(function(){
//       alert('hi');
//     });
// });

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
    navigate("http://pbl.link/" + text);
  });