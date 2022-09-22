/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// password breach checker

function checkPasswordBreach() {

const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
let currentRequest = false;

function hookPasswordFields() {
    // $("input:password").on("input", changeListener);
    $("[type=password]").on("input", changeListener);
}

function statusNeutral(target) {
    target.addClass("passwordBreachChecker")
    target.removeClass("passwordCheckerStatusPass passwordCheckerStatusFail");
}

function statusPass(target) {
    target.removeClass("passwordCheckerStatusFail");
    target.addClass("passwordCheckerStatusPass");
}

function statusFail(target) {
    target.removeClass("passwordCheckerStatusPass");
    target.addClass("passwordCheckerStatusFail");
}

function changeListener(event) {
    let pswdField = $(event.target),
        val = pswdField.val();
    if (!val) {
        statusNeutral(pswdField);
    } else {
        statusNeutral(pswdField);
        let sha = sha1(val).toUpperCase(),
            shaPrefix = sha.substring(0, 5),
            shaSuffix = sha.substring(5);
        if (currentRequest) currentRequest.abort();
        currentRequest = $.get(
            "https://api.pwnedpasswords.com/range/" + shaPrefix,
            "",
            (data, textStatus, jqXHR) => {
                currentRequest = false;
                if (textStatus !== "success") {
                    alert("Something went wrong with the Password Breach Checker. Please contact the developer with details.");
                    return;
                }
                let results = data.split("\n");
                if (results.filter(x => x.split(":")[0] == shaSuffix).length) {
                    statusFail(pswdField);
                } else {
                    statusPass(pswdField);
                }
            }
        );
    }
}

let observer = new MutationObserver((mutations, observer) => {
    // This function fires whenever the DOM changes.
    hookPasswordFields();
});

// define what element should be observed by the observer
// and what types of mutations trigger the callback
observer.observe(document, {
  subtree: true,
  childList: true
});

hookPasswordFields();

}

// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// password strength checker

const getState = () => {
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage(
			{cmd: "getState"},
			response => {
				if (response) {
					resolve(response.state)
				} else {
					reject(`Cannot resolve status`)
				}
			}
		)
	})
}

const checkPasswordStrength = p => {
	if (p.length >= 16 && (/(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{16,}/gu.test(p))) {
		return 'strong'
	} else if (p.length >= 8 && (/(?=.*\d)(?=.*[!@#$%^&*]{0,})(?=.*[a-z])(?=.*[A-Z]).{8,}/gu.test(p))) {
		return 'good'
	} else {
		return 'weak'
	}
}

const inputKeyUpEventHandler = async (i, c, b) => {
	
	// If password check is on...
	if (await getState() === true) {

		// ...and the input has not a null value
		if ((i.value && !i.hasAttribute('defaultValue')) || (i.value && i.hasAttribute('defaultValue') && (i.value !== i.defaultValue))) {
			const strength = checkPasswordStrength(i.value)
			const balloon_text = b.querySelector('.password-checker__balloon-text')
			let strengthText = ''
			
			c.style.visibility = 'visible'
			c.className = `password-checker__icon ${strength}`
			
			if (strength === 'strong') {
				strengthText = 'Strong password'
			} else if (strength === 'good') {
				strengthText = 'Good password'
			} else {
				strengthText = 'Password is too weak'
			}

			// Append a new text message to the balloon
			balloon_text.innerHTML = ''
			balloon_text.appendChild(document.createTextNode(strengthText))
		} else {
			c.style.visibility = 'hidden'
			b.style.display = 'none'
			c.className = `password-checker__icon`
		}
	}
}

const iconClickEventHandler = b => {
	if (window.getComputedStyle(b).display === 'none') {
		b.style.display = 'block'
	} else {
		b.style.display = 'none'
	}
}

const destroyContainers = () => {
	const containers = document.getElementsByClassName('password-checker')

	while (containers.length > 0) {
        containers[0].parentNode.removeChild(containers[0]);
    }
}

const constructContainers = () => {
	const inputs = document.getElementsByTagName("input")

	// For each input...
	for (let o = 0; o < inputs.length; o++) {

		// ...of `password` type
		if (inputs[o].type.toLowerCase() === "password") {
			const i = inputs[o]
			const ipos = i.getBoundingClientRect()
			const pc = document.createElement('div')
			const pc_icon = document.createElement('div')
			const pc_balloon = document.createElement('div')
			const pc_balloon_arrow = document.createElement('div')
			const pc_balloon_text = document.createElement('div')
			
			//// Create a container

			// Create an icon
			pc.className = `password-checker`
			pc_icon.className = `password-checker__icon`
			pc_icon.style.cssText = (`
				top: calc(3px + ${window.getComputedStyle(i).getPropertyValue('margin-top')}) !important;
				right: 3px !important;
				height: calc(${ipos.bottom}px - ${ipos.top}px - 6px) !important;
			`)
			i.parentNode.insertBefore(pc, i)
			pc.appendChild(pc_icon)

			// Create a balloon
			pc_balloon.className = 'password-checker__balloon'
			pc_balloon_arrow.className = 'password-checker__balloon-arrow'
			pc_balloon_text.className = 'password-checker__balloon-text'
			pc_balloon_arrow.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 3px) !important;
				right: -2px !important;
			`)
			pc_balloon_text.style.cssText = (`
				top: calc(${ipos.bottom}px - ${ipos.top}px + 13px) !important;
				right: -10px !important;
			`)
			pc_balloon.appendChild(pc_balloon_arrow)
			pc_balloon.appendChild(pc_balloon_text)
			pc.appendChild(pc_balloon)

			// Initial set up of the container -- in case the input has a not null value
			inputKeyUpEventHandler(i, pc_icon, pc_balloon)

			// Set up event handlers
			i.addEventListener('keyup', inputKeyUpEventHandler.bind(null, i, pc_icon, pc_balloon))
			pc_icon.addEventListener('click', iconClickEventHandler.bind(null, pc_balloon))
		}
	}
}

chrome.runtime.onMessage.addListener(
	(request, sender, sendResponse) => {
		if (request.cmd === 'setState') {
			if (request.state === true) {
				constructContainers()
			} else {
                console.log('tedghe in baato ka')
				destroyContainers()
			}
		}
	}
)
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// phising checker


function isMailToAvailable(){
    if(document.querySelectorAll('a[href^=mailto]').length<=0){
        return 'No mailto links found';
    } 	
    else{
        return 'Mailto links found';
    }
}
function isHTTP(){
    if(location.href.includes('https')) { 
        return 'Site data is encrypted';
    } else { 
        return 'Site data is not encrypted';
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//main function


window.onload = async () => {

	// If password check is on -- initialize containers
	if (await getState() === true) {
        msg = isMailToAvailable() + ', \n' + isHTTP()
        alert(msg)
        checkPasswordBreach()
		constructContainers()
	}

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
