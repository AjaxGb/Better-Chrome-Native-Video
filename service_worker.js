const toggleContextID = "contextToggle";

let lastSendResponse;

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		type    : "checkbox",
		id      : toggleContextID,
		title   : chrome.i18n.getMessage("contextToggle"),
		contexts: ["video"]
	});
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if (info.menuItemId !== toggleContextID) return;
	if (lastSendResponse) {
		try {
			lastSendResponse({
				clicked    : true,
				ignoreVideo: info.checked
			});
		} catch (e) {
			// Errors occur when pages are closed or reloaded,
			// leaving the background script with an expired
			// sendResponse. No action needed.
		}
	}
	chrome.contextMenus.update(toggleContextID, {
		checked: info.checked
	});
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(lastSendResponse) try {
			lastSendResponse({clicked: false});
		} catch (e) {
			// Errors occur when pages are closed or reloaded,
			// leaving the background script with an expired
			// sendResponse. No action needed.
		}
		lastSendResponse = sendResponse;
		
		chrome.contextMenus.update(toggleContextID, {
			checked: request.toggleChecked,
			enabled: request.toggleEnabled
		});
		
		return true; // async sendResponse
	}
);
