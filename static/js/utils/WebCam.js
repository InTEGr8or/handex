export class WebCam {
    constructor(videoElement, isVideo = false) {
        this.isVideo = false;
        this.facingMode = 'user';
        this.toggleVideo = (setOn) => {
            if (setOn) {
                navigator.mediaDevices
                    .getUserMedia({
                    video: {
                        facingMode: 'environment'
                    }
                })
                    .then(stream => this.preview.srcObject = stream);
            }
            else {
                // document.querySelector("div.content").appendChild(APP.chordSection);
                console.log("this.preview.srcObject:", this.preview.srcObject);
                if (this.preview.srcObject) {
                    const tracks = this.preview.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                    this.preview.srcObject = null;
                }
                this.preview.srcObject = null;
            }
            this.preview.hidden = !setOn;
            // APP.phrase.classList.toggle('phrase-over-video', setOn);
            // APP.chordSection.classList.toggle('chord-section-over-video', setOn);
        };
        this.isVideo = isVideo;
        this.preview = videoElement;
        this.preview.autoplay = true;
        this.preview.muted = true;
        this.preview.setAttribute('playsinline', '');
        this.preview.setAttribute('webkit-playsinline', '');
        this.preview.setAttribute('x5-playsinline', '');
    }
}
//# sourceMappingURL=WebCam.js.map