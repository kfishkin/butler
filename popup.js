/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function renderStatus(where, msg) {
  console.log('renderStatus(' + where + ':' + msg);
}

document.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('invoke_butler');
  button.addEventListener('click', function() {
    console.log('you clicked the button');
    var txt = document.getElementById('reply_text').value;
    console.log('txt = ' + txt);
    /*
     * There are many ways to talk to the content script
     * documented on the web, most of which don't work.
     * The one that works I found at
     * https://developer.chrome.com/extensions/tabs#method-sendMessage,
     * as the doc says that you have to use tabs.sendMessage,
     * not runtime.sendMessage, to talk to an extension
     */
    chrome.tabs.query( { active: true}, function (tabs) {
      for (var i = 0; i < tabs.length; i++) {
        var tab = tabs[i];
        console.log('tab.id = ' + tab.id);
        chrome.tabs.sendMessage(tab.id,
          { type: "Butler Popup", replyText : txt},
          {},
          function(response) {
            console.log('sendMessage, response = ' + response);
            if (!response) {
              console.log('runtime err = ' + chrome.runtime.lastError);
              console.log('runtime err.msg = '
                + chrome.runtime.lastError.message);
            }
          });
      }
    });
  });
});
