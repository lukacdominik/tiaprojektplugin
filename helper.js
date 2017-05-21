function setBadge(text) {
	if (typeof text === 'number') {
		text = '' + text
	}
	if (text === '0') {
		text = ''
	}
	chrome.browserAction.setBadgeBackgroundColor({color: '#000'})
	chrome.browserAction.setBadgeText({text})
}

function parseDuration(str) {
	if (typeof str !== 'string' || str.length === 0 || str[0] !== 'P') {
		return '??:??'
	}
	var rest = str.slice(1)
	var [days, rest] = rest.split('D')
	if (typeof rest === 'undefined') {
		rest = days
		days = 0
	}
	if (rest[0] === 'T') {
		rest = rest.slice(1)
	}
	var [hours, rest] = rest.split('H')
	if (typeof rest === 'undefined') {
		rest = hours
		hours = 0
	}
	var [minutes, rest] = rest.split('M')
	if (typeof rest === 'undefined') {
		rest = minutes
		minutes = 0
	}
	var seconds = rest.split('S')[0]
	return (
		// note - days, hours, minutes and seconds are strings, not numbers
		(days > 1 ? `${days} days ` : days === 1 ? '1 day ' : '')
		+ (hours > 0 ? `${hours}:` : '')
		+ (minutes >= 10 ? `${minutes}:` : `0${minutes}:`)
		+ (seconds >= 10 ? `${seconds}` : `0${seconds}`)
	)
}
