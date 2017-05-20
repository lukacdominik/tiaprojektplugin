var storage = chrome.storage.local

function commit(tabId, data, timestampDelta) {
	console.info(`[${tabId}] COMMITTING: ${Math.round(timestampDelta/1000)} sec. of ${data.url}`)
}

function upsertTabData(tabId, newTabData) {
	storage.get({
		tabs: {},
	}, function(items) {
		var tabs = Object.assign({}, items.tabs)
		if (tabs[tabId]) {
			if (tabs[tabId].url === newTabData.url) {
				console.log('changing tab data to the same url - skipping')
				return
			}
			if (newTabData.timestamp < tabs[tabId].timestamp) {
				console.warn('changing tab data outdated - skipping')
				return
			}
			var dt = newTabData.timestamp - tabs[tabId].timestamp
			if (dt >= 1) { // TODO minimal scrobble time should be about 30 seconds maybe
				commit(tabId, tabs[tabId], dt)
			}
		} else {
			tabs[tabId] = {}
		}
		for (var prop in newTabData) {
			tabs[tabId][prop] = newTabData[prop]
		}
		storage.set({tabs})
		setBadge(Object.keys(tabs).length)
	})
}

function deleteTabData(tabId) {
	storage.get({
		tabs: {},
	}, function(items) {
		var tabs = {}
		for (var prop in items.tabs) {
			if (prop == tabId) {
				commit(tabId, items.tabs[prop], (new Date()).getTime() - items.tabs[prop].timestamp)
			}
			else {
				tabs[prop] = items.tabs[prop]
			}
		}
		storage.set({tabs})
		setBadge(Object.keys(tabs).length)
	})
}


chrome.runtime.onInstalled.addListener(function() {
	storage.clear()
})


chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	console.log('[' + details.tabId + '] ' + 'STARTING TO TRACK: ' + details.url)
	
	var urlParts = details.url.split('?')
	if (urlParts.length < 2) {
		console.log('no url query parts identified')
		return
	}
	
	var videoId = urlParts[1].split('&').reduce(function (acc, query) {
		var [key, val] = query.split('=')
		return key === 'v' ? val : acc
	}, null)
	if (videoId === null) {
		console.log('no video id in url query')
		return
	}
	
	fetch(
		'https://www.googleapis.com/youtube/v3/videos'
		+ '?id=' + videoId
		+ '&part=' + ['snippet', 'contentDetails'].join('%2C')
		+ '&key=AIzaSyBMUAEw4dJiuMvjqTo3_9FVy7-2SnoFnAM'
	).then(function(resp) {
		return resp.json()
	}).then(function(data) {
		// console.log(data.items.length > 0 && data.items[0])
		if (data.items.length === 0) {
			console.log('Video does not exist.')
			return
		}
		var data = {
			url: details.url.split('?')[0] + '?v=' + videoId,
			timestamp: details.timeStamp,
			channel: data.items[0].snippet.channelTitle,
			title: data.items[0].snippet.title,
			duration: data.items[0].contentDetails.duration,
			readableDuration: parseDuration(data.items[0].contentDetails.duration),
		}
		upsertTabData(details.tabId, data)
		console.log({title: data.title})
	})
}, {
	url: [{
		hostSuffix: '.youtube.com',
	}]
})


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log((sender.tab ? '[' + sender.tab.id + '] ' : '[extension] ') + JSON.stringify(msg, null, 1))
	if (msg.from === 'contentscript') {
		if (msg.subject === 'playing') {
		} else if (msg.subject === 'paused') {
		} else if (msg.subject === 'unload') {
			console.warn('[' + sender.tab.id + '] END - window unload')
		} else {
			console.error('unhandled message')
		}
	} else if (msg.from === 'popup') {
		if (msg.subject === 'getPlayingNowData') {
			storage.get({
				tabs: {},
			}, function(items) {
				sendResponse({
					tabs: items.tabs,
				})
			})
			return true // needed for asynchronous use of sendResponse
		} else {
			console.error('unknown message subject')
		}
	} else {
		console.error('unknown message sender')
	}
})


chrome.runtime.onSuspend.addListener(function(/*probably something here?*/) {
})

chrome.tabs.onRemoved.addListener(function(tabId/*, removeInfo*/) {
	deleteTabData(tabId)
})
