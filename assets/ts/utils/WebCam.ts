
export interface IWebCam {
    toggleVideo(setOn: boolean): void;
}

export class WebCam {
    private isVideo: boolean = false;
    private facingMode: string = 'user';
    private preview: HTMLVideoElement;
    constructor(videoElement: HTMLVideoElement, isVideo: boolean = false) {
        this.isVideo = isVideo;
        this.preview = videoElement;
        this.preview.autoplay = true;
        this.preview.muted = true;
        this.preview.setAttribute('playsinline', '');
        this.preview.setAttribute('webkit-playsinline', '');
        this.preview.setAttribute('x5-playsinline', '');
    }

    toggleVideo = (setOn: boolean) => {
        if (setOn) {
            navigator.mediaDevices
            .getUserMedia({
                video: {
                    facingMode: 'environment'
                }
            })
            .then(
                stream => this.preview.srcObject = stream
            );
        }
        else {
            // document.querySelector("div.content").appendChild(APP.chordSection);
            console.log("this.preview.srcObject:", this.preview.srcObject);
            if (this.preview.srcObject) {
                const tracks = (this.preview.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
                this.preview.srcObject = null;
            }
            this.preview.srcObject = null;
        }
        this.preview.hidden = !setOn;
        // APP.phrase.classList.toggle('phrase-over-video', setOn);
        // APP.chordSection.classList.toggle('chord-section-over-video', setOn);
    }
}
