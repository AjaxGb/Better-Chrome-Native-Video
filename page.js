"use strict";

const videoClass = "chrome-better-HTML5-video",
      directVideoClass = "DIRECT-chrome-better-HTML5-video",
      ignoreVideoClass = "IGNORE-chrome-better-HTML5-video";

let toggleChecked, toggleEnabled, observer, dirVideo, settings = {
	firstClick:    "focus",
	dblFullScreen: true,
	clickDelay:    0.3,
	skipNormal:    5,
	skipShift:     10,
	skipCtrl:      1,
};

const shortcutFuncs = {
	toggleCaptions: function(v){
		const validTracks = [];
		for(let i = 0; i < v.textTracks.length; ++i){
			const tt = v.textTracks[i];
			if(tt.mode === "showing"){
				tt.mode = "disabled";
				if(v.textTracks.addEventListener){
					// If text track event listeners are supported
					// (they are on the most recent Chrome), add
					// a marker to remember the old track. Use a
					// listener to delete it if a different track
					// is selected.
					v.cbhtml5vsLastCaptionTrack = tt.label;
					function cleanup(e){
						for(let i = 0; i < v.textTracks.length; ++i){
							const ott = v.textTracks[i];
							if(ott.mode === "showing"){
								delete v.cbhtml5vsLastCaptionTrack;
								v.textTracks.removeEventListener("change", cleanup);
								return;
							}
						}
					}
					v.textTracks.addEventListener("change", cleanup);
				}
				return;
			}else if(tt.mode !== "hidden"){
				validTracks.push(tt);
			}
		}
		// If we got here, none of the tracks were selected.
		if(validTracks.length === 0){
			return true; // Do not prevent default if no UI activated
		}
		// Find the best one and select it.
		validTracks.sort(function(a, b){
			
			if(v.cbhtml5vsLastCaptionTrack){
				const lastLabel = v.cbhtml5vsLastCaptionTrack;
				
				if(a.label === lastLabel && b.label !== lastLabel){
					return -1;
				}else if(b.label === lastLabel && a.label !== lastLabel){
					return 1;
				}
			}
			
			const aLang = a.language.toLowerCase(),
			      bLang = b.language.toLowerCase(),
			      navLang = navigator.language.toLowerCase();
			
			if(aLang === navLang && bLang !== navLang){
				return -1;
			}else if(bLang === navLang && aLang !== navLang){
				return 1;
			}
			
			const aPre = aLang.split("-")[0],
			      bPre = bLang.split("-")[0],
			      navPre = navLang.split("-")[0];
			
			if(aPre === navPre && bPre !== navPre){
				return -1;
			}else if(bPre === navPre && aPre !== navPre){
				return 1;
			}
			
			return 0;
		})[0].mode = "showing";
	},
	
	togglePlay: function(v){
		if(v.paused)
			v.play();
		else
			v.pause();
	},

	toStart: function(v){
		v.currentTime = 0;
	},

	toEnd: function(v){
		v.currentTime = v.duration;
	},

	skipLeft: function(v,key,shift,ctrl){
		if(shift)
			v.currentTime -= settings.skipShift;
		else if(ctrl)
			v.currentTime -= settings.skipCtrl;
		else
			v.currentTime -= settings.skipNormal;
	},

	skipRight: function(v,key,shift,ctrl){
		if(shift)
			v.currentTime += settings.skipShift;
		else if(ctrl)
			v.currentTime += settings.skipCtrl;
		else
			v.currentTime += settings.skipNormal;
	},

	increaseVol: function(v){
		if(v.volume <= 0.9) v.volume += 0.1;
		else v.volume = 1;
	},

	decreaseVol: function(v){
		if(v.volume >= 0.1) v.volume -= 0.1;
		else v.volume = 0;
	},

	toggleMute: function(v){
		v.muted = !v.muted;
	},

	toggleFS: function(v){
		if(document.webkitFullscreenElement)
			document.webkitExitFullscreen();
		else
			v.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	},

	reloadVideo: function(v){
		const currTime = v.currentTime;
		v.load();
		v.currentTime = currTime;
	},

	slowOrPrevFrame: function(v,key,shift){
		if(shift) // Less-Than
			v.playbackRate -= 0.25;
		else // Comma
			v.currentTime -= 1/60;
	},

	fastOrNextFrame: function(v,key,shift){
		if(shift) // Greater-Than
			v.playbackRate += 0.25;
		else // Period
			v.currentTime += 1/60;
	},

	normalSpeed: function(v,key,shift){
		if(shift) // ?
			v.playbackRate = v.defaultPlaybackRate;
	},

	toPercentage: function(v,key){
		v.currentTime = v.duration * (key - 48) / 10.0;
	},
};

const keyFuncs = {
	32 : shortcutFuncs.togglePlay,      // Space
	75 : shortcutFuncs.togglePlay,      // K
	35 : shortcutFuncs.toEnd,           // End
	48 : shortcutFuncs.toStart,         // 0
	36 : shortcutFuncs.toStart,         // Home
	37 : shortcutFuncs.skipLeft,        // Left arrow
	74 : shortcutFuncs.skipLeft,        // J
	39 : shortcutFuncs.skipRight,       // Right arrow
	76 : shortcutFuncs.skipRight,       // L
	38 : shortcutFuncs.increaseVol,     // Up arrow
	40 : shortcutFuncs.decreaseVol,     // Down arrow
	77 : shortcutFuncs.toggleMute,      // M
	70 : shortcutFuncs.toggleFS,        // F
	67 : shortcutFuncs.toggleCaptions,  // C
	82 : shortcutFuncs.reloadVideo,     // R
	188: shortcutFuncs.slowOrPrevFrame, // Comma or Less-Than
	190: shortcutFuncs.fastOrNextFrame, // Period or Greater-Than
	191: shortcutFuncs.normalSpeed,     // Forward slash or ?
	49 : shortcutFuncs.toPercentage,    // 1
	50 : shortcutFuncs.toPercentage,    // 2
	51 : shortcutFuncs.toPercentage,    // 3
	52 : shortcutFuncs.toPercentage,    // 4
	53 : shortcutFuncs.toPercentage,    // 5
	54 : shortcutFuncs.toPercentage,    // 6
	55 : shortcutFuncs.toPercentage,    // 7
	56 : shortcutFuncs.toPercentage,    // 8
	57 : shortcutFuncs.toPercentage,    // 9
};

function registerDirectVideo(v){
	unregisterAllVideos();
	if(dirVideo){
		unregisterDirectVideo(v !== dirVideo);
	}
	dirVideo = v;
	v.classList.add(directVideoClass);
}

function unregisterDirectVideo(reregister){
	dirVideo.classList.remove(directVideoClass);
	if(reregister && document.body.contains(dirVideo)){
		registerVideo(dirVideo);
		dirVideo.focus();
	}
	dirVideo = undefined;
}

function registerVideo(v){
	v.classList.add(videoClass);
}

function unregisterVideo(v){
	v.classList.remove(videoClass);
}

function registerAllValidVideos(vs){
	for(let i = 0; i < vs.length; ++i){
		if(vs[i].hasAttribute("controls")
		&&!vs[i].classList.contains(videoClass)
		&&!vs[i].classList.contains(ignoreVideoClass)){
			registerVideo(vs[i]);
		}
	}
}

function unregisterAllVideos(){
	const rv = document.getElementsByClassName(videoClass);
	for(let i = 0; i < rv.length; ++i){
		unregisterVideo(rv[i]);
	}
}

function handleClick(e){
	if(!dirVideo
	&& !(e.target.classList
	  && e.target.classList.contains(videoClass))){
		return true; // Do not prevent default
	}
	const v = dirVideo || e.target;
	if(settings.firstClick === "play" || dirVideo || document.activeElement === v){
		if(v.cbhtml5vsClickTimeout){
			clearTimeout(v.cbhtml5vsClickTimeout);
			delete v.cbhtml5vsClickTimeout;
		}
		if(settings.dblFullScreen && settings.clickDelay > 0){
			v.cbhtml5vsClickTimeout = setTimeout(function(){
				shortcutFuncs.togglePlay(v);
				delete v.cbhtml5vsClickTimeout;
			}, settings.clickDelay * 1000);
		}else{
			shortcutFuncs.togglePlay(v);
		}
	}
	v.focus();
	e.preventDefault();
	e.stopPropagation();
	return false
}

function handleDblClick(e){
	if(!settings.dblFullScreen || (!dirVideo
	&& !(e.target.classList
	  && e.target.classList.contains(videoClass)))){
		return true; // Do not prevent default
	}
	const v = dirVideo || e.target;
	if(v.cbhtml5vsClickTimeout){
		clearTimeout(v.cbhtml5vsClickTimeout);
		delete v.cbhtml5vsClickTimeout;
	}
	shortcutFuncs.toggleFS(v);
	e.preventDefault();
	e.stopPropagation();
	return false
}

function handleKeyDown(e){
	if(!dirVideo
	&& !(e.target.classList
	  && e.target.classList.contains(videoClass))){
		return true; // Do not activate
	}
	if(e.altKey || e.metaKey){
		return true; // Do not activate
	}
	const func = keyFuncs[e.keyCode];
	if(func){
		if((func.length < 3 && e.shiftKey) ||
		   (func.length < 4 && e.ctrlKey)){
			return true; // Do not activate
		}
		func(dirVideo || e.target, e.keyCode, e.shiftKey, e.ctrlKey);
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleKeyOther(e){
	if(!dirVideo
	&& !(e.target.classList
	  && e.target.classList.contains(videoClass))){
		return true; // Do not prevent default
	}
	if(e.altKey || e.metaKey){
		return true; // Do not prevent default
	}
	const func = keyFuncs[e.keyCode];
	if(func){
		if((func.length < 3 && e.shiftKey) ||
		   (func.length < 4 && e.ctrlKey)){
			return true; // Do not prevent default
		}
		e.preventDefault();
		e.stopPropagation();
		return false;
	}
	return true; // Do not prevent default if no UI activated
}

function handleFullscreen(){
	if(document.webkitFullscreenElement
	&& document.webkitFullscreenElement.classList.contains(videoClass)){
		document.webkitFullscreenElement.focus();
	}
}

function onMessage(obj){
	settings = obj.updatedSettings || settings;
}

function updateContextTarget(e){
	if(e.target && e.target.tagName && e.target.tagName.toLowerCase() === "video"){
		const target  = e.target,
		      checked = target.classList.contains(ignoreVideoClass),
		      enabled = target.hasAttribute("controls");
		if(toggleChecked !== checked || toggleEnabled !== enabled){
			chrome.runtime.sendMessage({
				toggleChecked: checked,
				toggleEnabled: enabled
			}, function(response) {
				if(!response){
					console.log("Error while updating context menu:",
						chrome.runtime.lastError.message);
					return;
				}
				if(response.clicked){
					if(response.ignoreVideo){
						if(target.classList.contains(directVideoClass)){
							unregisterDirectVideo(false);
						}
						if(target.classList.contains(videoClass)){
							unregisterVideo(target);
						}
						target.classList.add(ignoreVideoClass);
					}else{
						target.classList.remove(ignoreVideoClass);
						if(target.hasAttribute("controls")){
							if(document.body.children.length === 1
							&& document.body.firstElementChild === target){
								registerDirectVideo(target);
							}else{
								registerVideo(target);
								target.focus();
							}
						}
					}
				}
			});
			toggleChecked = checked;
			toggleEnabled = enabled;
		}
	}
}

function handleMutationRecords(mrs){
	for(let i = 0; i < mrs.length; ++i){
		if(mrs[i].type === "attributes" && mrs[i].attributeName === "controls"){
			const t = mrs[i].target;
			if(!t.hasAttribute("controls")){
				if(t.classList.contains(directVideoClass)){
					unregisterDirectVideo(false);
				}else if(t.classList.contains(videoClass)){
					unregisterVideo(t);
				}
			}else if(t.tagName.toLowerCase() === "video"
			&&      !t.classList.contains(ignoreVideoClass)){
				if(document.body.children.length === 1
				&& document.body.firstElementChild === t){
					registerDirectVideo(t);
				}else{
					registerVideo(t);
					t.focus();
				}
			}
		}else if(mrs[i].type === "childList"){
			// Handle direct video access
			if(dirVideo && (document.body.children.length !== 1
			|| document.body.firstElementChild !== dirVideo)){
				unregisterDirectVideo(true);
			}
			if(document.body.children.length === 1
			&& document.body.firstElementChild.tagName.toLowerCase() === "video"
			&& document.body.firstElementChild.hasAttribute("controls")
			&&!document.body.firstElementChild.classList.contains(ignoreVideoClass)
			&&!document.body.firstElementChild.classList.contains(directVideoClass)){
				registerDirectVideo(document.body.firstElementChild);
			}else if(mrs[i].addedNodes){
				for(let j = 0; j < mrs[i].addedNodes.length; ++j){
					const an = mrs[i].addedNodes[j];
					if(an.tagName && an.tagName.toLowerCase() === "video"){
						if(an.hasAttribute("controls")
						&&!an.classList.contains(videoClass)
						&&!an.classList.contains(ignoreVideoClass)){
							registerVideo(an);
						}
					}else if(an.getElementsByTagName){
						registerAllValidVideos(an.getElementsByTagName("video"));
					}
				}
			}
			if(mrs[i].removedNodes){
				for(let j = 0; j < mrs[i].removedNodes.length; ++j){
					const rn = mrs[i].removedNodes[j];
					if(rn.classList){
						if(rn.classList.contains(videoClass)){
							unregisterVideo(rn);
						}else if(rn.classList.contains(directVideoClass)){
							unregisterDirectVideo(false);
						}
					}
				}
			}
		}
	}
}

function enableExtension(){
	chrome.storage.sync.get(settings, function(s){
		settings = s || settings;
		if (chrome.runtime.lastError) {
			console.log("Error while loading settings:",
				chrome.runtime.lastError.message);
		}
	});
	// useCapture: Handler fired while event is bubbling down instead of up
	document.addEventListener("webkitfullscreenchange", handleFullscreen, true);
	document.addEventListener("mouseover", updateContextTarget, true);
	document.addEventListener("mousedown", updateContextTarget, true);
	document.addEventListener("contextmenu", updateContextTarget, true);
	
	document.addEventListener("click", handleClick, true);
	document.addEventListener("dblclick", handleDblClick, true);
	document.addEventListener("keydown", handleKeyDown, true);
	document.addEventListener("keypress", handleKeyOther, true);
	document.addEventListener("keyup", handleKeyOther, true);
	
	chrome.runtime.onMessage.addListener(onMessage);
	
	if(document.body.children.length === 1 // Handle direct video access
	&& document.body.firstElementChild.tagName.toLowerCase() === "video"
	&& document.body.firstElementChild.hasAttribute("controls")
	&&!document.body.firstElementChild.classList.contains(ignoreVideoClass)){
		registerDirectVideo(document.body.firstElementChild);
	}else{
		registerAllValidVideos(document.getElementsByTagName("video"));
	}
	
	observer = observer || new MutationObserver(handleMutationRecords);
	observer.observe(document.documentElement, {
		childList: true,
		attributes: true,
		attributeFilter: ["controls"],
		subtree: true
	});
}

function disableExtension(){
	document.removeEventListener("webkitfullscreenchange", handleFullscreen, true);
	document.removeEventListener("mouseover", updateContextTarget, true);
	document.removeEventListener("mousedown", updateContextTarget, true);
	document.removeEventListener("contextmenu", updateContextTarget, true);
	
	document.removeEventListener("click", handleClick, true);
	document.removeEventListener("dblclick", handleDblClick, true);
	document.removeEventListener("keydown", handleKeyDown, true);
	document.removeEventListener("keypress", handleKeyOther, true);
	document.removeEventListener("keyup", handleKeyOther, true);
	
	chrome.runtime.onMessage.removeListener(onMessage);
	
	if(dirVideo) unregisterDirectVideo(false);
	unregisterAllVideos();
	
	if(observer) observer.disconnect();
}

if(document.readyState !== "loading")
	enableExtension();
else
	window.addEventListener("load", enableExtension);
