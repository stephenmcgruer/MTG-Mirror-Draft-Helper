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

"use strict";

var toggleVisibility = function() {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  		chrome.tabs.sendMessage(tabs[0].id, {'type': 'toggleVisibility'},
  			function(response) {
    			if (response.result && response.result === 'success') {
    				var button = document.getElementById('toggleVisibilityButton');
    				if (button.textContent === 'Hide Hints') {
						button.textContent = 'Show Hints';
    				} else {
						button.textContent = 'Hide Hints';
    				}
    			}
  			}
  		);
	});
};

var loadHandler = function() {
	// Determine the current visibility status.
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {'type': 'visibilityStatus'},
			function(response) {
				console.log(response);
				if (response.status) {
					var button = document.getElementById('toggleVisibilityButton');
					if (response.status === 'visible') {
						button.textContent = 'Hide Hints';
					} else {
						button.textContent = 'Show Hints';
					}
				}
			}
		);
	});
	var button = document.getElementById('toggleVisibilityButton');
	button.addEventListener('click', toggleVisibility);
};

window.addEventListener('load', loadHandler);
