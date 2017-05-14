var storage = chrome.storage.local

function setBadge(text) {
	chrome.browserAction.setBadgeBackgroundColor({color: '#000'})
	chrome.browserAction.setBadgeText({text})
}


chrome.runtime.onInstalled.addListener(function() {
	storage.clear()
})

chrome.runtime.onSuspend.addListener(function() {
	// TODO this code should be made to be not needed
	storage.get(null, function(items) {
		if (!items.tabs || items.tabs.length === 0) {
			setBadge('')
			return
		}
		setBadge('' + Object.keys(items.tabs).length)
	})
})

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
	console.log('[' + details.tabId + '] ' + 'eventpage: onHistoryStateUpdated - ' + details.url)
	storage.get({
		tabs: {},
	}, function(items) {
		var tabs = Object.assign({}, items.tabs)
		if (tabs[details.tabId]) {
			// do something here probably, otherwise we lose data
			console.log(details.tabId, details.timeStamp - tabs[details.tabId].timeStamp)
		}
		tabs[details.tabId] = {
			url: details.url,
			timeStamp: details.timeStamp,
		}
		storage.set({tabs})
		setBadge('' + Object.keys(tabs).length)
	})
}, {
	url: [{
		hostSuffix: '.youtube.com',
		pathPrefix: '/watch',
	}]
})

chrome.runtime.onMessage.addListener(function(msg, sender) {
	console.log('[' + sender.tab.id + '] ' + JSON.stringify(msg, null, 1))
	if (msg.from === 'contentscript') {
		if (msg.subject === 'start') {
			if (!msg.data.video) {
				console.warn('NO VIDEO ON CONTENT SCRIPT START')
			}
		} else if (msg.subject === 'playing') {
		} else if (msg.subject === 'paused') {
		} else if (msg.subject === 'end') {
			console.warn('[' + sender.tab.id + '] END - window unload')
		}
	}
})



chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
})
