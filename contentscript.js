var video = document.getElementsByTagName('video')

chrome.runtime.sendMessage({
	from: 'contentscript',
	subject: 'start',
	data: {
		video: video.length > 0 && {
			duration: video[0].duration
		}
	}
})

window.addEventListener('unload', function(e) {
	chrome.runtime.sendMessage({
		from: 'contentscript',
		subject: 'end',
	})
	// We have ca. 1 sec to do this, experiments showed
})

// Audio / Video events API
// https://www.w3schools.com/tags/ref_av_dom.asp
video[0].onplaying = function() {
	chrome.runtime.sendMessage({
		from: 'contentscript',
		subject: 'playing',
	})
}
video[0].onpause = function() {
	chrome.runtime.sendMessage({
		from: 'contentscript',
		subject: 'paused',
	})
}
