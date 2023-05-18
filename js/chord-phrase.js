// var allChordsList = document.getElementById("allChordsList");
const APP = {};
APP.lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';

const spaceDisplayChar = "&#x2581;";
const tabDisplayChar = "&#x2B7E;";

var timerHandle = null;
const fingers = {t:"thumb",i:"index",m:"middle",r:"ring",p:"pinky"};

var Timer = function(timerState) {

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new or original interval, stop current interval
    this.reset = function(newT = t) {
        t = newT;
        return this.stop().start();
    }
};

const testModeChange = () => {
    // chordify();
    // Hide the chordified sub-divs.
    if(APP.testMode.checked) {
        localStorage.setItem("testMode", "true");
    } else {
        localStorage.setItem("testMode", "false");
    }
    chordify();
}

var chordify = function() {
    APP.chordified.innerHTML = '';
    var phraseVal = APP.phrase.value;
    if(phraseVal.trim().length == 0) {
        return;
    }
    console.log("APP.phrase:", phraseVal);
    const phraseEncoded = btoa(phraseVal);
    console.log("phraseEncoded:", phraseEncoded);
    fetch(APP.lambdaUrl, {
        method: 'POST',
        headers: {

        },
        body: JSON.stringify({
            phrase: phraseEncoded
        })
    })
    .then(function(response) {
        return response.json();
    })
    .then(function(chordList) {
        if(chordList.error) {
            console.log("chordList.error:", chordList.error);
            return;
        }
        const chordRows = chordList.json;
        // Add each row to the chordified element as a separate div with the first character of the row as the name.
        APP.wholePhraseChords.innerHTML = '';
        const isTestMode = APP.testMode.checked;
        chordRows.forEach(function(row, i) {
            const rowDiv = document.createElement('div');
            const rowStrokesId = row.strokes.replaceAll(", ","_").replaceAll(" ","");
            const foundChords = Array.from(allChordsList.children).filter(x=>{return x.id == rowStrokesId;});
            // Load the clone in Chord order into the wholePhraseChords div.
            if(foundChords.length > 0) {
                const inChord = foundChords[0].cloneNode(true);
                inChord.setAttribute("name", row.char);
                inChord.hidden = isTestMode;
                Array.from(inChord.children)
                    .filter(x => x.nodeName == "IMG")
                    .forEach(x => {
                        x.setAttribute("loading", "eager");
                        // x.hidden = isTestMode;
                    });
                APP.wholePhraseChords.appendChild(inChord); 
            }
            else{
                console.log("Missing chord:", rowStrokesId);
            }
            document.querySelector(`#${rowStrokesId} img`)?.setAttribute("loading", "eager");
            // document.querySelector(`#${rowStrokesId}`).hidden = false;
            rowDiv.id = i;
            rowDiv.setAttribute("name", row.char);
            const charSpan = document.createElement('span');
            charSpan.innerHTML = row.char;
            rowDiv.appendChild(charSpan);
            rowDiv.appendChild(document.createTextNode(row.strokes));
            APP.chordified.appendChild(rowDiv);
        });
        setNext();
        setTimerSvg('start');
        APP.testArea.focus();
    });
    timerCancel();
};
var setNext = () => {
    const nextIndex = comparePhrase();

    if(nextIndex < 0) {
        return;
    }
    // Remove the outstanding class from the previous chord.
    Array
        .from(APP.wholePhraseChords.children)
        .forEach((chord, i) => {
            chord.classList.remove("next");
        }
    );
    if (nextIndex > APP.wholePhraseChords.children.length - 1) return;
    const next = APP.wholePhraseChords.children[nextIndex];
    APP.nextChar = next.getAttribute("name").replace("Space", " ");
    next.classList.add("next");
    // If we're in test mode and the last character typed doesn't match the next, expose the svg.
    Array.from(next.childNodes)
        .filter(x => x.nodeName == "IMG")
        .forEach(x => {
            x.width = 140;
            charSvgClone = x.cloneNode(true);
            charSvgClone.hidden = APP.testMode.checked;
            APP.chordImageHolder.replaceChildren(charSvgClone);
            
        });
    APP.svgCharacter.innerHTML = next.getAttribute("name").replace("Space", spaceDisplayChar).replace("tab","↹");
    APP.svgCharacter.hidden = false;
    return next;
};
var listAllChords = () => {
    APP.allChordsList.hidden = false;
    // highlight Vim navigation keys
    Array.from(document.querySelectorAll("#allChordsList div span"))
        .filter(x=>"asdfgjkl;/0$^m\"web".includes(x.innerText))
        .forEach(x=>x.style.color = "blue");
};
var comparePhrase = () => {
    const sourcePhrase = APP.phrase.value.split('');
    const testPhrase = APP.testArea.value.split('');
    if(testPhrase.length == 0) {
        return 0;
    }
    if(testPhrase == sourcePhrase) {
        setTimerSvg('stop');
        return -1;
    }
    var result = 0;
    for(let i = 0; i < testPhrase.length; i++)  {
        if(testPhrase[i] !== sourcePhrase[i]) {
            return i;
        }
        result++;
    };
    return result;
};
var testTimer = function(event) {
    if(event.data == APP.nextChar) {
        APP.charTimer.push({
            char: event.data, 
            duration: ((APP.timerValue - APP.prevCharTime) / 100).toFixed(2), 
            time: (APP.timerValue / 100).toFixed(2)
        });
    }
    const next = setNext();
    if(next){
        next.classList.remove("error");
    }
    APP.prevCharTime = APP.timerValue;

    // TODO: de-overlap this and comparePhrase
    if(APP.testArea.value.trim().length == 0) {
        // stop timer
        APP.testArea.style.border = "";
        clearInterval(timerHandle);
        timerHandle = null;
        APP.timer.innerHTML = (0).toFixed(1);
        APP.timerValue = 0;
        setTimerSvg('start');
        return;
    }
    if(APP.testArea.value == APP.phrase.value.trim().substring(0, APP.testArea.value.length)) {
        APP.testArea.style.border = "";
    }
    else{
        // Alert mismatched text with red border.
        APP.testArea.style.border = "4px solid red";
        document.querySelector("#chord-image-holder img").hidden = false;
        next.classList.add("error");
        APP.errorCount.innerText = parseInt(APP.errorCount.innerText) + 1;
    }
    if(APP.testArea.value.trim() == APP.phrase.value.trim()) {
        // stop timer
        clearInterval(timerHandle);
        setTimerSvg('stop');
        let charTimeList = "";
        APP.charTimer.forEach(x => {
            charTimeList += `<li>${x.char.replace(' ', spaceDisplayChar)}: ${x.duration}</li>`;
        });
        APP.charTimes.innerHTML = charTimeList;
        localStorage.setItem(`charTimerSession_${(new Date).toISOString()}`, JSON.stringify(APP.charTimer));
        timerHandle = null;
        return;
    }
    startTimer();
}
const setTimerSvg = (status) => {
    const statusSvg = document.getElementById('timerSvg');
    switch(status) {
        case 'start':
            statusSvg.innerHTML = '<use href="#start" transform="scale(2,2)" ></use>';
            APP.testArea.disabled = false;
            APP.errorCount.innerText = 0;
            break;
        case 'stop':
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
            APP.testArea.disabled = true;
            break;
        case 'pause':
            statusSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
            break;
        default:
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
    }
};
var runTimer = function() {
    APP.timerValue++;
    APP.timer.innerHTML = (APP.timerValue / 100).toFixed(1);
};
const resetChordify = () => {
    APP.phrase.value = '';
    APP.wholePhraseChords.innerHTML = '';
    APP.allChordsList.hidden = true;
    APP.testArea.value = '';
    APP.testArea.disabled = false;
};
var resetChordifiedCompletion = function() {
    Array.from(APP.wholePhraseChords.children).forEach(function(chord) {
        chord.classList.remove("error");
        // element.setAttribute("class", "outstanding");
    })
    APP.testArea.style.border = "";
    setNext();
    setTimerSvg('start');
    APP.charTimer = [];
    APP.prevCharTime = 0;
    APP.charTimes.innerHTML = '';
    APP.testArea.focus();
};
var startTimer = function() {
    if(!timerHandle) {
        timerHandle = setInterval(runTimer, 10);
        setTimerSvg('pause');
    }
};
var timerCancel = function() {
    APP.testArea.value = '';
    clearInterval(timerHandle);
    timerHandle = null;
    APP.timer.innerHTML = (0).toFixed(1);
    APP.timerValue = 0;
    resetChordifiedCompletion();
}
var clearChords = function() {
    document.getElementById('searchChords').value = '';
    // listAllChords();
}

document.addEventListener("DOMContentLoaded", () => {

    APP.testArea = document.getElementById('testArea');
    APP.chordified = document.getElementById('chordified');
    APP.timer = document.getElementById('timer');
    APP.prevCharTime = 0;
    APP.charTimer = [];
    APP.phrase = document.getElementById('phrase');
    APP.pangrams = document.getElementById('pangrams');
    APP.chordImageHolder = document.getElementById('chord-image-holder');
    APP.wholePhraseChords = document.getElementById("wholePhraseChords");
    APP.testMode = document.getElementById("testMode");
    // APP.testModeLabel = document.getElementById("testModeLabel");
    APP.svgCharacter = document.getElementById("svgCharacter");
    APP.errorCount = document.getElementById("errorCount");
    APP.charTimes = document.getElementById("charTimes");
    APP.nextChar = null;

    APP.timerValue = 0;

    APP.testArea.addEventListener('input', testTimer);
    APP.phrase.addEventListener('change', chordify);
    document.getElementById('testMode').checked = localStorage.getItem('testMode') == 'true';
    APP.pangrams.addEventListener('click', function(e) {
        APP.phrase.value = e.target.innerText;
        chordify();
    });
    document.getElementById('timerCancel')
        .addEventListener('click', timerCancel);
    document.getElementById('listAllChords')
        .addEventListener('click', listAllChords);
    document.getElementById('resetChordify')
        .addEventListener('click', resetChordify);
    document.getElementById('testMode')
        .addEventListener('change', testModeChange);

});