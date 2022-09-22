chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		if (request.cmd === 'getState') {
			let state = false

			try {
				state = (n = JSON.parse(localStorage.getItem('password_checker'))) ? n : false
			} catch(e) {
			}

			sendResponse({ state })
		}
	}
)
