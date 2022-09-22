const generatePassword = len => {
	let password = ''
	let character = ''

	while (len > password.length) {
		if (password.indexOf(character = String.fromCharCode(Math.floor(Math.random() * 94) + 33), Math.floor(password.length / 94) * 94) < 0) {
			password += character
		}
	}

	return password
}

const passwordRegenerateClickHandler = () => {
	const generatorInput = document.getElementById('password-generator-input')
	const lengthInput = document.getElementById('password-length')
	const lengthText = document.getElementById('password-length-text')

	generatorInput.value = generatePassword(lengthInput.value)

	try {
		localStorage.setItem('password_length', JSON.stringify(lengthInput.value))
	} catch(e) {
		console.error(e)
	}

	lengthText.innerHTML = lengthInput.value
}

window.onload = () => {
	
	const checkSwitcher = document.getElementById('password-check')
	const lengthInput = document.getElementById('password-length')
	const regenerateButton = document.getElementById('password-regenerate')

	// Set initial switcher & password generator state
	try {
		checkSwitcher.checked = (n = JSON.parse(localStorage.getItem('password_checker'))) ? n : false
		lengthInput.value = (n = JSON.parse(localStorage.getItem('password_length'))) ? n : 16
	} catch(e) {
		checkSwitcher.checked = false
		lengthInput.value = 16
		console.error(e) 
	}

	// On switcher change -- save its state to local storage
	checkSwitcher.addEventListener('change', e => {
		const state = e.target.checked

		try {
			localStorage.setItem('password_checker', JSON.stringify(state))	
		} catch(e) {
			console.error(e)
		}

		chrome.tabs.query({currentWindow: true, active: true}, tabs => {
			chrome.tabs.sendMessage(tabs[0].id, { cmd: "setState", state });
		})
	})

	// Set up password generator
	passwordRegenerateClickHandler()

	// Set up event handlers
	regenerateButton.addEventListener('click', passwordRegenerateClickHandler.bind(null))
	lengthInput.addEventListener('input', passwordRegenerateClickHandler.bind(null))
}