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

/**
 * There are three ways a reply-able comment can come into being:
 * 1) The user goes to a new page. In that case, this code will be reloaded.
 * 2) The user is on a page with some. In that case, we can find them right
 * away.
 * 3) The user clicks to expand comments. In that case, we will monitor for
 * the comments to arrive.
 */
function onStartup() {
  // CASE 2: FIND THEM RIGHT AWAY:
  var comments = $("div.threaded_comment");
  var timestamps = comments.find("span.timestamp[butler!='butler']");
  timestamps.after(btn);
  timestamps.attr('butler', 'butler');

  // CASE 3: find when they expand.
  // One could do this via a MutationObserver, but this never seems to
  // catch the comments as they come in. My current hypothesis is that
  // they come in pre-attached to their ancestors, and so no event fires.
  // So instead, watch for a click on the button that expands comments,
  // and then poll.
  var commentLinks = $('a.comment_link');
  commentLinks.click(function(evt) {
    var aNode = $(evt.target);
    // go up to the Answer ActionBar:
    var commonParent = aNode.parents('div.Answer').first();
    // and find the 'threaded_comments' child of that...
    var threadedComments = commonParent.children('div.threaded_comments');
    // it appears that this gets triggered _before_ the apps onClick handler,
    // as the 'hidden' class name is there in the comments when the comments
    // _were_ hidden, not when they _are_.
    // So we need to wait for the comments to gradually come in, and
    // decorate them as they do. We don't know how many comments this will
    // be, since they can be a tree, not a list. Give up when we haven't seen
    // any new ones in some amount of time.....
    // one 'feature' of this code is that it works whether invoked before,
    // or after, the app brings in the comments...
    var numTries = 0;
    var numFruitlessTries = 0;
    var MAX_TOTAL_TRIES = 50;
    var MAX_FRUITLESS_TRIES = 10;
    var INTERVAL_IN_MS = 200;
    var timer = window.setInterval(function() {
      var timestamps = threadedComments.find("span.timestamp[butler!='butler']");
      if (!timestamps || timestamps.length == 0) {
        numFruitlessTries++;
        if (numFruitlessTries > MAX_FRUITLESS_TRIES) {
          window.clearInterval(timer);
        }
      } else {
        timestamps.after(btn);
        timestamps.attr('butler', 'butler');
      }
      numTries++;
      if (numTries > MAX_TOTAL_TRIES) {
        window.clearInterval(timer);
      }
    }, INTERVAL_IN_MS);
  });

};

onStartup();

/**
 * listens for events coming from the popup.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('got request of ' + request + ', type = ' + request.type);
  if ('Butler Popup' == request.type) {
      console.log('got popup msg, txt = ' + request.replyText);
      replyText = request.replyText;
      // all existing buttons need their tooltips changed:
      $('img.butler_button').attr('title', replyText);
  }
  return true;
});
