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
  chrome.storage.local.get({
    token: null
  }, function(items) {
    if (!items.token) {
      document.getElementById('authorization').style.display = 'block'
    } else {
      document.getElementById('playing-now').style.display = 'block'
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
    }
  })

  document.getElementById('authorize').onclick = function() {
    var redirectUrl = chrome.identity.getRedirectURL()
    var authUrl = ("http://localhost:3000/api/authorize/"
      + "?client_id=2abbcda8-c07d-426e-be42-acd30ea65dad"
      + "&redirect_uri=" + encodeURIComponent(redirectUrl))
 
    chrome.identity.launchWebAuthFlow({url: authUrl, interactive: true}, function(responseUrl) {
      console.log('responseUrl:', responseUrl)
      if (!responseUrl) {
        return render('status', 'authorization canceled')
      }
      var [url, query] = responseUrl.split('?')
      if (!query) {
        return render('status', 'no token acquired')
      }
      query = query.split('&')
      var status = query.reduce(function(acc, queryPart) {
        var [key, val] = queryPart.split('=')
        if (key === 'cancel' && (!val || val === 'true')) {
          acc.cancel = true
          return acc
        }
        if (key === 'token' && val) {
          acc.token = decodeURIComponent(val)
          return acc
        }
      }, {
        cancel: false,
        token: null,
      })

      if (status.cancel) {
        return render('status', 'authorization canceled')
      }

      if (!status.token) {
        return render('status', 'no token acquired')
      }

      render('status', 'token: ' + status.token)
      chrome.storage.local.set({token: status.token})
      document.getElementById('authorization').style.display = 'none'
      document.getElementById('playing-now').style.display = 'block'
    })
  }
})
