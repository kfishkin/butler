/**
 * @fileoverview Content script that runs, non-persistently,
 * on Quora pages. Presently it does one thing - when it
 * receives a message of type 'Butler Popup', it reads the
 * reply text to 1-click stick as a reply to comments,
 * And then populates all comments with a 1-click icon that,
 * when clicked, sticks that text in as a reply.
 */


// default reply text.
var replyText = 'Thanks for the input. Did you want this to be an answer, instead of a comment?';

/**
 * listens for events coming from the popup.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('got request of ' + request + ', type = ' + request.type);
  if ('Butler Popup' == request.type) {
      console.log('got popup msg, txt = ' + request.replyText);
      replyText = request.replyText;
      // find all comments, add the butler button
      // after all that don't already have it...
      var comments = $("div.threaded_comment");
      var timestamps = comments.find("span.timestamp[butler!='butler']");
      timestamps.after(btn);
      timestamps.attr('butler', 'butler');
      $('img.butler_button').first().focus();
  }
  return true;
});

// find the URL of the butler button image.
// the advantage of doing it this way is that you don't
// need to know the extension id.
// Thank you Stack Overflow:
// http://stackoverflow.com/questions/3559781/google-chrome-extensions-cant-load-local-images-with-css
var imgURL = chrome.extension.getURL('images/butler_small.jpg');
var btn = $('<img>')
  .addClass('butler_button')
  .attr('src', imgURL)
  .text('Butler')
  .attr('title', replyText);

/**
 * click handler for the butler button
 */
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
  var timer = window.setInterval(function() {
    var contentBox = cmt.find('div.content');
    if (contentBox && contentBox.length > 0) {
      window.clearInterval(timer);
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
        alert("Your Butler comment wasn't able to be sent. Sorry!"); // force an alert here so that user isn't confused about what happened.
        window.clearInterval(timer);
      }
    }, INTERVAL_IN_MS);
});