var storage = chrome.storage.local
var API_URL = 'http://localhost:3000/api/'
var MINIMAL_DURATION_TO_COMMIT = 10

function commit(tabId, data, duration) {
	if (duration < MINIMAL_DURATION_TO_COMMIT) {
		console.log('cannot commit less than', MINIMAL_DURATION_TO_COMMIT, 'seconds')
		return
	}
	storage.get({token: null}, function(items) {
		if (!items.token) {
			console.error('cannot commit without token')
			return
		}
		console.info(`[${tabId}] COMMITTING: ${Math.round(duration)} sec. of ${data.url}`)
		fetch(
			API_URL + 'record/'
			+ '?token=' + encodeURIComponent(items.token)
			+ '&video_url=' + data.url
			+ '&duration=' + Math.round(duration)
			+ '&timestamp=' + Math.round(data.timestamp)
		).then(function(resp) {
			return resp.json()
		}).then(function(data) {
			if (data.status !== 200) {
				console.error('COMMIT ERROR:', data.error)
				return
			}
		})
	})
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
			commit(tabId, tabs[tabId], (newTabData.timestamp - tabs[tabId].timestamp) / 1000)
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
				commit(tabId, items.tabs[prop], ((new Date()).getTime() - items.tabs[prop].timestamp) / 1000)
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
	storage.get({token: null}, function(items) {
		if (items.token) {
			chrome.identity.removeCachedAuthToken({token: items.token})
		}
		storage.clear()
	})
})

chrome.tabs.onRemoved.addListener(function(tabId/*, removeInfo*/) {
	deleteTabData(tabId)
})

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	storage.get({token: null}, function(items) {
		if(!items.token) {
			return
		}
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
				url: 'https://www.youtube.com/watch?v=' + videoId,
				timestamp: details.timeStamp,
				channel: data.items[0].snippet.channelTitle,
				title: data.items[0].snippet.title,
				duration: data.items[0].contentDetails.duration,
				readableDuration: parseDuration(data.items[0].contentDetails.duration),
			}
			upsertTabData(details.tabId, data)
			console.log({title: data.title})
		})
	})
}, {
	url: [{
		hostSuffix: '.youtube.com',
	}]
})


chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log((sender.tab ? '[' + sender.tab.id + '] ' : '[extension] ') + JSON.stringify(msg, null, 1))
	if (msg.from === 'contentscript') {
		// if (msg.subject === 'playing') {
		// } else if (msg.subject === 'paused') {
		// } else if (msg.subject === 'unload') {
		// 	console.warn('[' + sender.tab.id + '] END - window unload')
		// } else {
		// 	console.error('unhandled message')
		// }
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
