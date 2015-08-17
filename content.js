/*
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
	"use strict";

	// Observes the card list selection node for changes.
	var observer = null;

	// Stores the headers we attach to the page.
	var headers = [];

	var headersVisible = true;

	var toggleHeaderVisibility = function() {
		for (var i = 0; i < headers.length; ++i) {
			var header = headers[i];
			if (header.style.visibility === 'hidden') {
				header.style.visibility = 'visible';
			} else {
				header.style.visibility = 'hidden';
			}
		}
		headersVisible = !headersVisible;
	};

	// Locates and returns the Start/Restart Draft button on the page.
	// If it cannot be found, returns null.
	var findStartRestartButton = function(root) {
		var buttons = root.getElementsByTagName('button');
		for (var i = 0; i < buttons.length; ++i) {
			var button = buttons[i];
			// Look for 'Start Draft' and 'Restart Draft'
			if (button.textContent.indexOf("tart Draft") >= 0) {
				return button;
			}
		}

		return null;
	};

	var findDraftCardsUl = function(root) {
		var divs = root.getElementsByClassName(
			"widget wmtg normalPanel ng-scope");
		for (var i = 0; i < divs.length; ++i) {
			var div = divs[i];
			if (div.attributes['ng-if'] && div.attributes['ng-if'].value.indexOf('vm.boosterCards.length > 0') >= 0) {
				var uls = div.getElementsByClassName("today-datas");
				if (uls.length !== 1) {
					console.log('Warning: too many ULs');
				}
				return uls[0];
			}
		}

		return null;
	};

	var populateDraftData = function() {
		// Clear any existing data.
		for (var i = 0; i < headers.length; ++i) {
			headers[i].remove();
		}
		headers.length = 0;

		var card_ul = findDraftCardsUl(document);
		if (card_ul === null) {
			return;
		}

		var card_imgs = card_ul.getElementsByTagName('img');
		for (i = 0; i < card_imgs.length; ++i) {
			var card_img = card_imgs[i];

			var card_value = card_data[card_img.alt.toLowerCase()];
			if (card_value === undefined) {
				card_value = '???';
			}

			// Create the text h2
			var h2 = document.createElement('h2');
			h2.textContent = card_value;
			h2.style.position = 'absolute';
			h2.style.left = '0';
			h2.style.top = '35%';
			h2.style.width = '100%';
			h2.style.color = 'white';
			h2.style.textShadow = '-1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;';
			h2.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
			h2.style.pointerEvents = 'none';
			if (!headersVisible) {
				h2.style.visibility = 'hidden';
			}

			// Put the h2 into the DOM.
			card_img.parentElement.appendChild(h2);

			headers.push(h2);
		}
	};

	var draftButtonClicked = function(event, attempts) {
		attempts = typeof attempts !== 'undefined' ? attempts : 0;
		if (attempts >= 5) {
			// This is only a warning since if the user sets up a draft
			// with 0 boosters, we will always fail.
			console.log('Warning: timed out waiting for card list element, ' +
				'draft-helper will not work');
			return;
		}
		// The very first time someone clicks the draft button, we must wait
		// for the card list element to be created.
		var card_ul = findDraftCardsUl(document);
		if (card_ul === null) {
			setTimeout(function() {
				draftButtonClicked(event, attempts + 1);
			}, 50);
			return;
		}

		// Populate the draft data.
		populateDraftData();

		// If we dont have one already, set up the observer.
		if (observer === null) {
			observer = new MutationObserver(function(mutations) {
				populateDraftData();
			});
			var config = {
				childList: true
			};
			observer.observe(card_ul, config);
		}
	};

	var main = function(attempts) {
		attempts = typeof attempts !== 'undefined' ? attempts : 0;
		if (attempts >= 10) {
			console.log(
				'Error: cannot find draft button, draft-helper will not work');
			return;
		}

		var button = findStartRestartButton(document);
		if (!button) {
			// Not created yet.
			setTimeout(function() {
				main(attempts + 1);
			}, 50);
			return;
		}

		console.log("Found button: " + button);

		button.addEventListener('click', draftButtonClicked);

		// Set up the keyboard controls.
		document.onkeypress = function(key_event) {
			if (key_event.keyCode == 104) {
				toggleHeaderVisibility();
			}
		};

		// Set up listener for visibility toggling.
		chrome.runtime.onMessage.addListener(
			function(request, sender, sendResponse) {
				if (request.type == 'toggleVisibility') {
					toggleHeaderVisibility();
					sendResponse({'result':'success'});
					return;
				} else if (request.type == 'visibilityStatus') {
					if (headersVisible) {
						sendResponse({'status': 'visible'});
					} else {
						sendResponse({'status': 'hidden'});
					}
				}

				sendResponse({'result':'failure'});
			}
		);
	};

	// Go!
	main();

})();
