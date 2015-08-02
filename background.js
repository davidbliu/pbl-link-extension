


chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    // chrome.tabs.executeScript(tabId, {file: "bundles.js"} );
    console.log('this is a background page');
    $('.link-row').each(function(){
      console.log('this is a link row');
    });
    console.log('there are this many link rowrs');
    $('.link-row').click(function(){
      alert('hi');
    });
});