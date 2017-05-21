// window.addEventListener('unload', function(e) {
// 	chrome.runtime.sendMessage({
// 		from: 'contentscript',
// 		subject: 'unload',
// 	})
// 	// We have ca. 1 sec to do this, experiments showed
// })

// var videoElems = document.getElementsByTagName('video')
// var channelElems = document.getElementsByClassName('yt-user-info')
// var channelLinkElems = channelElems.length > 0 && channelElems[0].getElementsByTagName('a')
// var titleElem = document.getElementById('eow-title')

// var videoElem = videoElems.length > 0 && videoElems[0]
// var channel = channelLinkElems.length > 0 && channelLinkElems[0].innerText
// var title = titleElem !== null && titleElem.innerText

// Audio / Video events API
// https://www.w3schools.com/tags/ref_av_dom.asp
// if (videoElem) {
// 	videoElem.addEventListener('playing', function() {
// 		chrome.runtime.sendMessage({
// 			from: 'contentscript',
// 			subject: 'playing',
// 		})
// 	})
// 	videoElem.addEventListener('pause', function() {
// 		chrome.runtime.sendMessage({
// 			from: 'contentscript',
// 			subject: 'paused',
// 		})
// 	})
// }
