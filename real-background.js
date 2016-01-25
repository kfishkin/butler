/*
  This file is responsible for ensuring pageAction only shows up on 
  Quora.com websites. 
*/

chrome.tabs.onUpdated.addListener(function(id, info, tab){
  if (tab.url.indexOf("quora.com")!== -1){
    chrome.pageAction.show(tab.id);
    //chrome.tabs.executeScript(null, {"file": "path/to/extension.js"});
  }
});

chrome.pageAction.onClicked.addListener(function(tab) {
    chrome.pageAction.show(tab.id);
});