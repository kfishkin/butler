/**
 * Javascript for the Butler popup.
 * When the 'invoke_butler' button is pressed,
 * it reads the text to stuff into a reply from the
 * 'reply_text' text box, then sends a message
 * to the active tab. The script running in that window
 * will then receive this and do its thing.
 */
document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('invoke_butler');
    button.addEventListener('click', function() {
        var txt = document.getElementById('reply_text').value;
        /*
         * There are many ways to talk to the content script
         * documented on the web, most of which don't work.
         * The one that works I found at
         * https://developer.chrome.com/extensions/tabs#method-sendMessage,
         * as the doc says that you have to use tabs.sendMessage,
         * not runtime.sendMessage, to talk to an extension
         *
         * This code will send the message to the active tab,
         * which it assumes is the Quora tab.
         * TODO: send to Quora tab(s), not the active tab. 
         * Comment by Akshat: Added a string search for Quora in the URL. For stronger security, we could introduce 
         *                    a regex match for https*://*.quora.com, but having trouble finding the right regex. :(
         */
        chrome.tabs.query({
            active: true
        }, function(tabs) {
            // this is overly-general, there should never be
            // more than one...
            for (var i = 0; i < tabs.length; i++) {
                if (tabs[i].url.indexOf("quora.com") !== -1) { // only operates on a URL containing quora.com
                    var tab = tabs[i];
                    console.log('tab.id = ' + tab.id);
                    chrome.tabs.sendMessage(tab.id, {
                            type: "Butler Popup",
                            replyText: txt
                        }, {},
                        function(response) {
                            console.log('sendMessage, response = ' + response);
                            if (!response) {
                                console.log('runtime err = ' + chrome.runtime.lastError);
                                console.log('runtime err.msg = ' + chrome.runtime.lastError.message);
                            }
                        });
                }
            }
        });
    });
});