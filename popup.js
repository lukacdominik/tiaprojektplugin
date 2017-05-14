function getCurrentTabUrl(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };
  // https://developer.chrome.com/extensions/tabs#method-query
  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url; // See https://developer.chrome.com/extensions/tabs#type-Tab
    console.assert(typeof url == 'string', 'tab.url should be a string. This property is only present if the extension\'s manifest includes the "tabs" permission.');
    callback(url);
  });
}

function renderURL(statusText) {
  document.getElementById('url').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(url) {
    // Put the image URL in Google search.
    renderURL(url);
  });
});
