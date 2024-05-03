"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCam = void 0;
class WebCam {
    constructor() {
        this.toggleVideo = (setOn) => {
            var _a;
            if (setOn) {
                navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment'
                    }
                }).then(stream => preview.srcObject = stream);
                APP.videoSection.appendChild(APP.chordSection);
            }
            else {
                document.querySelector("div.content").appendChild(APP.chordSection);
                (_a = preview === null || preview === void 0 ? void 0 : preview.srcObject) === null || _a === void 0 ? void 0 : _a.getTracks().forEach(track => track.stop());
                preview.srcObject = null;
            }
            document.getElementById("video-section").hidden = !setOn;
            APP.phrase.classList.toggle('phrase-over-video', setOn);
            APP.chordSection.classList.toggle('chord-section-over-video', setOn);
        };
    }
}
exports.WebCam = WebCam;
function changeFacingMode(facingMode) {
    if (preview.srcObject) {
        preview.srcObject.getTracks().forEach(track => track.stop());
        preview.srcObject = null;
    }
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: facingMode
        }
    }).then(stream => preview.srcObject = stream);
}
function changeDdevice(deviceId) {
    if (preview.srcObject) {
        preview.srcObject.getTracks().forEach(track => track.stop());
        preview.srcObject = null;
    }
    navigator.mediaDevices.getUserMedia({
        video: {
            deviceId: deviceId
        }
    }).then(stream => preview.srcObject = stream);
}
function initializeVideo() {
    if (!APP.videoMode.checked)
        return;
    navigator.mediaDevices
        .getUserMedia({
        video: { facingMode: 'environment' }
    })
        .then(stream => {
        preview.srcObject = stream;
        navigator.mediaDevices
            .enumerateDevices()
            .then(devices => {
            devices
                .filter(device => device.kind === 'videoinput')
                .forEach(device => {
                let btn = document.createElement('button');
                btn.textContent = device.label;
                btn.dataset.deviceId = device.deviceId;
                btn.onclick = function () {
                    changeDdevice(this.dataset.deviceId);
                };
                btnDeviceIdContainer.appendChild(btn);
            });
            // res.textContent = JSON.stringify(devices, null, 2);
        });
    });
}
//# sourceMappingURL=web-cam.js.map