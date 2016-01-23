/**
 * @fileoverview Description of this file.
 */
//alert('hello from background.js, location = ' + window.location);
//alert('imgUrl = ' + imgURL);
/*
var views = chrome.extension.getViews({type: "popup"});
for (var i = 0; i < views.length; i++) {
  var elt = views[i].document.getElementById('reply_text');
  alert('i = ' + i + ', elt = ' + elt);
}
*/

// put the butler decoration button after the Quora logo
var decorateButton = $('<button>')
  .addClass('butler_button')
  .text('Decorate')
  .attr('title', 'put the butler on comments');
// put it after the last 'expanded span' at top -
// this is things like 'Answer', 'Notifications', etc.
$('span.expanded').last().append(decorateButton);

decorateButton.click(function(evt) {
  var comments = $("div.threaded_comment");
  var timestamps = comments.find("span.timestamp[butler!='butler']");
  timestamps.after(btn);
  timestamps.attr('butler','butler');
  evt.stopPropagation();
});

//var btn = $('<button>').addClass('butler_button').text('Butler').attr('title', 'do it');
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
      contentBox.text('Thanks for the input. Did you want this to be an answer, instead of a comment?');
      var cancelLink = cmt.find('div.reply_submit_button_wrapper').children('span').children('a');
      var replyLink = cmt.find('div.reply_submit_button_wrapper').children('a.submit_button');
      console.log('replyLink = ' + replyLink.html());
      console.log('cancelLink = ' + cancelLink.html());
      //replyLink.trigger('click');
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

