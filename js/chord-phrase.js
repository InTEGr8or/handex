const TEST_AREA = document.getElementById('testArea');
const lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
const chordified = document.getElementById('chordified');
const timer = document.getElementById('timer');
const phrase = document.getElementById('phrase');
const panagrams = document.getElementById('panagrams');
const chordImageHolder = document.getElementById('chord-image-holder');
const wholePhraseChords = document.getElementById("wholePhraseChords");
const testMode = document.getElementById("testMode");
const testModeLabel = document.getElementById("testModeLabel");
const svgCharacter = document.getElementById("svgCharacter");
const errorCount = document.getElementById("errorCount");

var timerValue = 0;
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
    if(testMode.checked) {
        localStorage.setItem("testMode", "true");
    } else {
        localStorage.setItem("testMode", "false");
    }

}

var chordify = function() {
    chordified.innerHTML = '';
    // NOTE: Not needed anymore since we load a clone into the wholePhraseChords div.
    allChordsList.hidden = true;
    var phraseVal = phrase.value;
    if(phraseVal.trim().length == 0) {
        return;
    }
    console.log("phrase:", phraseVal);
    const phraseEncoded = btoa(phraseVal);
    console.log("phraseEncoded:", phraseEncoded);
    fetch(lambdaUrl, {
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
        wholePhraseChords.innerHTML = '';
        const isTestMode = testMode.checked;
        chordRows.forEach(function(row, i) {
            const rowDiv = document.createElement('div');
            const rowStrokesId = row.strokes.replaceAll(", ","␣").replaceAll(" ","");
            const foundChord = document.querySelector(`#${rowStrokesId}`);
            // Load the clone in Chord order into the wholePhraseChords div.
            if(foundChord) {
                const inChord = foundChord.cloneNode(true);
                inChord.setAttribute("name", row.char);
                inChord.hidden = false;
                Array.from(inChord.children)
                    .filter(x => x.nodeName == "IMG")
                    .forEach(x => {
                        x.setAttribute("loading", "eager");
                        x.hidden = isTestMode;
                    });
                wholePhraseChords.appendChild(inChord); 
            }
            document.querySelector(`#${rowStrokesId} img`)?.setAttribute("loading", "eager");
            // document.querySelector(`#${rowStrokesId}`).hidden = false;
            rowDiv.id = i;
            rowDiv.setAttribute("name", row.char);
            const charSpan = document.createElement('span');
            charSpan.innerHTML = row.char;
            rowDiv.appendChild(charSpan);
            rowDiv.appendChild(document.createTextNode(row.strokes));
            chordified.appendChild(rowDiv);
        });
        setNext();
        setTimerSvg('start');
        TEST_AREA.focus();
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
        .from(wholePhraseChords.children)
        .forEach((chord, i) => {
            chord.classList.remove("next");
        }
    );
    if (nextIndex > wholePhraseChords.children.length - 1) return;
    const next = wholePhraseChords.children[nextIndex];
    next.classList.add("next");
    // If we're in test mode and the last character typed doesn't match the next, expose the svg.
    Array.from(next.childNodes)
        .filter(x => x.nodeName == "IMG")
        .forEach(x => {
            x.width = 180;
            chordImageHolder.replaceChildren(x.cloneNode(true));
            
        });
    document.getElementById("svgCharacter").innerHTML = next.getAttribute("name").replace("Space", "▁");
    document.getElementById("svgCharacter").hidden = false;
    return next;
};
var listAllChords = () => {
    document.getElementById('allChordsList').hidden = false;
    // highlight Vim navigation keys
    Array.from(document.querySelectorAll("#allChordsList div span"))
        .filter(x=>"asdfgjkl;/0$^m\"web".includes(x.innerText))
        .forEach(x=>x.style.color = "blue");
};
var comparePhrase = () => {
    const sourcePhrase = document.getElementById("phrase").value.split('');
    const testPhrase = TEST_AREA.value.split('');
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
    const next = setNext();
    if(next){
        next.classList.remove("error");

    }
    // TODO: de-overlap this and comparePhrase
    if(TEST_AREA.value.trim().length == 0) {
        // stop timer
        TEST_AREA.style.border = "";
        clearInterval(timerHandle);
        timerHandle = null;
        timer.innerHTML = (0).toFixed(1);
        timerValue = 0;
        setTimerSvg('start');
        return;
    }
    if(TEST_AREA.value == phrase.value.trim().substring(0, TEST_AREA.value.length)) {
        TEST_AREA.style.border = "";
    }
    else{
        // Alert mismatched text with red border.
        TEST_AREA.style.border = "4px solid red";
        document.querySelector("#chord-image-holder img").hidden = false;
        next.classList.add("error");
        errorCount.innerText = parseInt(errorCount.innerText) + 1;
    }
    if(TEST_AREA.value.trim() == phrase.value.trim()) {
        // stop timer
        clearInterval(timerHandle);
        setTimerSvg('stop');
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
            TEST_AREA.disabled = false;
            errorCount.innerText = 0;
            break;
        case 'stop':
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
            TEST_AREA.disabled = true;
            break;
        case 'pause':
            statusSvg.innerHTML = '<use href="#pause" transform="scale(2,2)" ></use>';
            break;
        default:
            statusSvg.innerHTML = '<use href="#stop" transform="scale(2,2)" ></use>';
    }
};
var runTimer = function() {
    timerValue++;
    timer.innerHTML = (timerValue / 10).toFixed(1);
};
const resetChordify = () => {
    phrase.value = '';
    wholePhraseChords.innerHTML = '';
    allChordsList.hidden = true;
    TEST_AREA.value = '';
    TEST_AREA.disabled = false;
};
var resetChordifiedCompletion = function() {
    Array.from(wholePhraseChords.children).forEach(function(chord) {
        chord.classList.remove("error");
        // element.setAttribute("class", "outstanding");
    })
    TEST_AREA.style.border = "";
    setNext();
    setTimerSvg('start');
    TEST_AREA.focus();
};
var startTimer = function() {
    if(!timerHandle) {
        timerHandle = setInterval(runTimer, 100);
        setTimerSvg('pause');
    }
};
var timerCancel = function() {
    TEST_AREA.value = '';
    clearInterval(timerHandle);
    timerHandle = null;
    timer.innerHTML = (0).toFixed(1);
    timerValue = 0;
    resetChordifiedCompletion();
}
var clearChords = function() {
    document.getElementById('searchChords').value = '';
    // listAllChords();
}

phrase.addEventListener('change', chordify);
TEST_AREA.addEventListener('input', testTimer);
panagrams.addEventListener('click', function(e) {
    phrase.value = e.target.innerHTML;
    chordify();
});
document.getElementById('timerCancel')
    .addEventListener('click', timerCancel);
document.getElementById('listAllChords')
    .addEventListener('click', listAllChords);

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('testMode').checked = localStorage.getItem('testMode') == 'true';
    // const allChords = fetch('/js/chords.json')
    //     .then(response => {
    //         return response.json();
    //     })
    //     .then(data => {
    //         allChords = data;
    //     });
});
// document.getElementById('clearChordsButton')
//     .addEventListener('click', clearChords);
document.getElementById('resetChordify')
    .addEventListener('click', resetChordify);
document.getElementById('testMode')
    .addEventListener('change', testModeChange);