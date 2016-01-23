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
    $('img.butler_button').first().focus();
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
  .addClass('butler_button')
  .attr('src',imgURL)
  .text('Butler')
  .attr('title', replyText);

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
      contentBox.text(replyText);
      var cancelLink = cmt.find('div.reply_submit_button_wrapper').children('span').children('a');
      var replyLink = cmt.find('div.reply_submit_button_wrapper').children('a.submit_button');
      // thanks to Stack Overflow:
      // http://stackoverflow.com/questions/17819344/triggering-a-click-event-from-content-script-chrome-extension:
      // 'jQuery's click trigger function does not trigger a non-jQuery DOM click listener (jsfiddle.net/k2W6M).'
      // so you do it by sending a raw event to the DOM element:
      replyLink.focus();
      replyLink.get(0).dispatchEvent(new MouseEvent("click"));
      cmt.focus();
    } else if (numTries < MAX_TRIES) {
      numTries++;
    } else {
      window.clearInterval(timer);
    }
  }, INTERVAL_IN_MS);
});

