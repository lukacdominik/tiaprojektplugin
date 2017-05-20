function render(id, text) {
  document.getElementById(id).textContent = text
}

function addVideoToPlayingNowList(tabId, tab) {
  var div = document.createElement("div")
  var date = new Date(tab.timestamp)
  div.style.border = '1px solid black'
  div.innerText = `[${tabId}] ${date.toLocaleString()}:`
  var channelAndTitle = document.createElement("a")
  // channelAndTitle.onclick = function() {
  //   chrome.tabs.create({active: true, url: tab.url})
  // }
  channelAndTitle.href = tab.url
  channelAndTitle.target = '_newtab'
  channelAndTitle.innerText = `${tab.channel} --- ${tab.title}`
  div.appendChild(document.createElement("br"))
  div.appendChild(channelAndTitle)
  div.appendChild(document.createTextNode(` [${tab.readableDuration}]`))
  document.getElementById('playing-now').appendChild(div)
}

document.addEventListener('DOMContentLoaded', function() {
  chrome.runtime.sendMessage({
    from: 'popup',
    subject: 'getPlayingNowData',
  }, function(response) {
    if (typeof response === 'undefined') {
      return render('status', 'Error: ' + (chrome.runtime.lastError.message || 'An unspecified error occurred while requesting "playing now" data'))
    }
    for (var tabId in response.tabs) {
      if (response.tabs.hasOwnProperty(tabId)) {
        addVideoToPlayingNowList(tabId, response.tabs[tabId])
      }
    }
  })
})
