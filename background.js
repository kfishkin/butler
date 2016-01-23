/**
 * @fileoverview Description of this file.
 */
//alert('hello from background.js, location = ' + window.location);
//alert('imgUrl = ' + imgURL);


var replyText = 'Thanks for the input. Did you want this to be an answer, instead of a comment?';

// listening for an event / one-time requests
// coming from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('got request of ' + request + ', type = ' + request.type);
  if ('Butler Popup' == request.type) {
    console.log('got popup msg, txt = ' + request.replyText);
    replyText = request.replyText;
    var comments = $("div.threaded_comment");
    var timestamps = comments.find("span.timestamp[butler!='butler']");
    timestamps.after(btn);
    timestamps.attr('butler','butler');
  }
  return true;
});

// according to https://developer.chrome.com/extensions/content_scripts,
// a content script can't use chrome.extension.getViews :(
// so don't know how background can read popup html... TODO

// find the URL of the butler button.
// the advantage of doing it this way is that you don't
// need to know the extension id.
// Thank you Stack Overflow.
var imgURL = chrome.extension.getURL('images/butler_small.jpg');
var btn = $('<img>')
  .addClass('alfred')
  .attr('src',imgURL)
  .text('Butler')
  .attr('title', 'do it');

btn.click(function(evt) {
  var me = $(evt.target);
  var cmt = me.parents('div.threaded_comment').first();
  var replyBox = cmt.find('input.show_reply_box_link')
  replyBox.focus();
  // this will cause DOM re-writing. Wait for the input text
  // area to show up, give it up to MAX_TRIES tries
  var MAX_TRIES = 10;
  var INTERVAL_IN_MS = 100;
  var numTries = 0;
  var contentBox = null;
  var timer = window.setInterval(function() {
    contentBox = cmt.find('div.content');
    if (contentBox && contentBox.length > 0) {
      window.clearInterval(timer);
      if (!contentBox) {
        console.log('content box never showed, sorry');
        return;
      }
      // TODO: get this from the popup box.
      contentBox.text(replyText);
      var cancelLink = cmt.find('div.reply_submit_button_wrapper').children('span').children('a');
      var replyLink = cmt.find('div.reply_submit_button_wrapper').children('a.submit_button');
      console.log('replyLink = ' + replyLink.html());
      console.log('cancelLink = ' + cancelLink.html());
      //replyLink.trigger('click');
      // see if 'chrome.tabs.executeScript() will do it,
      // maybe otherwise sandboxing is screwing us...
      /*
      var eltId = cancelLink.attr('id');
      var script = 'document.getElementById(\''
        + eltId + '\').click()';
      console.log('script = [' + script + ']');
      chrome.tabs.executeScript({
        code: script
      });
      */

      window.setTimeout(function() {
        console.log('clicking cancel link, id = ' + cancelLink.attr('id'));
        cancelLink.focus();
        cancelLink.click();
        }, 2000);
    } else if (numTries < MAX_TRIES) {
      numTries++;
    } else {
      window.clearInterval(timer);
    }
  }, INTERVAL_IN_MS);
});

