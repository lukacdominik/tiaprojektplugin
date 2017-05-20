// window.addEventListener('unload', function(e) {
// 	chrome.runtime.sendMessage({
// 		from: 'contentscript',
// 		subject: 'unload',
// 	})
// 	// We have ca. 1 sec to do this, experiments showed
// })

function onGetContentData(sendResponse) {
	var videoElems = document.getElementsByTagName('video')
	var channelElems = document.getElementsByClassName('yt-user-info')
	var channelLinkElems = channelElems.length > 0 && channelElems[0].getElementsByTagName('a')
	var titleElem = document.getElementById('eow-title')

	var videoElem = videoElems.length > 0 && videoElems[0]
	var channel = channelLinkElems.length > 0 && channelLinkElems[0].innerText
	var title = titleElem !== null && titleElem.innerText

	// Audio / Video events API
	// https://www.w3schools.com/tags/ref_av_dom.asp
	// TODO this probably overwrites something
	// if (videoElem) {
	// 	videoElem.onplaying = function() {
	// 		chrome.runtime.sendMessage({
	// 			from: 'contentscript',
	// 			subject: 'playing',
	// 		})
	// 	}
	// 	videoElem.onpause = function() {
	// 		chrome.runtime.sendMessage({
	// 			from: 'contentscript',
	// 			subject: 'paused',
	// 		})
	// 	}
	// }
	sendResponse({
		video: videoElem && {
			duration: videoElem.duration || '??:??',
			playing: !videoElem.paused,
		},
		channel: channel || 'Couldn\'t load channel name',
		title: title || 'Couldn\'t load video title',
	})
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log((sender.tab ? '[' + sender.tab.id + '] ' : '[extension] ') + JSON.stringify(msg, null, 1))
	if (msg.from === 'eventpage') {
		if (msg.subject === 'getContentData') {
			onGetContentData(sendResponse)
		} else {
			console.error('unknown message subject')
		}
	} else {
		console.error('unknown message sender')
	}
})
