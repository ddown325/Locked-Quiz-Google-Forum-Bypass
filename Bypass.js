(async function () {
var func = function () {
try {
if (!newWindow || !newWindow.chrome || !newWindow.chrome.runtime || typeof newWindow.chrome.runtime.sendMessage !== 'function') {
console.log("Waiting for newWindow or chrome.runtime.sendMessage to be ready...");
setTimeout(func, 100);
return;
}

const oldSendMessage = newWindow.chrome.runtime.sendMessage;
const BlacklistedEvents = ['mozvisibilitychange', 'webkitvisibilitychange', 'msvisibilitychange', 'visibilitychange', 'pagehide'];

const oldAddEventListener = newWindow.document.addEventListener;
const kAssessmentAssistantExtensionId = "gndmhdcefbhlchkhipcnnbkcmicncehk";

function MatchExtensionId(ExtensionId) {
return ExtensionId === kAssessmentAssistantExtensionId;
}

var fakeIsLocked = true;

function InterceptCommand(Payload, Callback) {
console.log("Intercepted", Payload, Callback);
switch (Payload.command) {
case "isLocked":
Callback({ locked: fakeIsLocked });
return true;
case "lock":
fakeIsLocked = true;
Callback({ locked: fakeIsLocked });
return true;
case "unlock":
fakeIsLocked = false;
Callback({ locked: fakeIsLocked });
return true;
}
return false;
}

if (!newWindow.__forms_unlocker_patched) {
newWindow.chrome.runtime.sendMessage = function () {
const ExtensionId = (arguments)[0];
const Payload = (arguments)[1];
const Callback = (arguments)[2];

if (MatchExtensionId(ExtensionId)) {
const Intercepted = InterceptCommand(Payload, Callback);
if (Intercepted) { return null; }
}
console.warn("Not intercepting", ExtensionId, Payload, Callback);

return oldSendMessage(ExtensionId, Payload, function () {
if (newWindow.chrome.runtime.lastError) {
newWindow.alert(`Google Forms Unlocker, please report this to the GitHub https://github.com/xNasuni/google-forms-unlocker/issues \nUnhandled error: ${JSON.stringify(newWindow.chrome.runtime.lastError)}`);
return;
}
Callback.apply(this, arguments);
});
};

Object.defineProperty(newWindow.document, 'hidden', {
value: false,
writable: false
});
Object.defineProperty(newWindow.document, 'visibilityState', {
value: "visible",
writable: false
});
Object.defineProperty(newWindow.document, 'webkitVisibilityState', {
value: "visible",
writable: false
});
Object.defineProperty(newWindow.document, 'mozVisibilityState', {
value: "visible",
writable: false
});
Object.defineProperty(newWindow.document, 'msVisibilityState', {
value: "visible",
writable: false
});

newWindow.document.addEventListener = function () {
const EventType = (arguments)[0];
const Method = (arguments)[1];
const Options = (arguments)[2];

if (BlacklistedEvents.indexOf(EventType) !== -1) {
console.log(`type ${EventType} blocked from being registered with`, Method);
return;
}

return oldAddEventListener.apply(this, arguments);
};

newWindow.__forms_unlocker_patched = true;
console.log("Forms unlocker patch applied.");
}

return;
} catch (e) {
console.warn("Error in func:", e);
setTimeout(func, 100);
}
};

var currentUrl = location.href;
var newWindow = window.open(currentUrl, "_blank");

setTimeout(func, 500);

})();
