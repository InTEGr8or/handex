var testArea = document.getElementById('testArea');
const lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
var chordified = document.getElementById('chordified');
var timer = document.getElementById('timer');
var phrase = document.getElementById('phrase');
var panagrams = document.getElementById('panagrams');
var allChords = [];
const chordImageHolder = document.getElementById('chord-image-holder');

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
var chordify = function() {
    chordified.innerHTML = '';
    document.querySelectorAll("#allChords > div").forEach((div)=>{div.hidden = true;});
    var phrase = document.getElementById('phrase').value;
    if(phrase.trim().length == 0) {
        return;
    }
    console.log("phrase:", phrase);
    const phraseEncoded = btoa(phrase);
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
        chordRows.forEach(function(row, index) {
            const rowDiv = document.createElement('div');
            const rowStrokesId = row.strokes.replaceAll(", ","_").replaceAll(" ","");
            const inChord = document.querySelector(`#${rowStrokesId}`);
            if(inChord) {
                inChord.hidden = false;
                Array.from(inChord.children)
                    .filter(x => x.nodeName == "IMG")
                    .forEach(x => {x.setAttribute("loading", "eager")});
            }
            document.querySelector(`#${rowStrokesId} img`)?.setAttribute("loading", "eager");
            // document.querySelector(`#${rowStrokesId}`).hidden = false;
            rowDiv.id = index;
            rowDiv.setAttribute("name", row.char);
            rowDiv.setAttribute("class", "outstanding");
            const charSpan = document.createElement('span');
            charSpan.innerHTML = row.char;
            rowDiv.appendChild(charSpan);
            rowDiv.appendChild(document.createTextNode(row.strokes));
            chordified.appendChild(rowDiv);
        });
        setNext();
        testArea.focus();
    });
    timerCancel();
};
var setNext = () => {

    const outstanding = chordified.getElementsByClassName('outstanding');
    if(outstanding.length == 0) {
        return;
    };
    var next = outstanding[0];
    next.setAttribute("class", "outstanding next");
    const strokes = next.innerHTML.split("</span>")[1].split(",");
    const svgId = strokes.join("_").replaceAll(" ","");
    const svgImg = document.querySelector(`#${svgId} img`).cloneNode(true);
    svgImg.width = 180;
    // svgImg.setAttribute("loading", "eager");
    console.log("svgId:", svgId);
    console.log("svgImg:", svgImg);
    chordImageHolder.replaceChildren(svgImg);
};
var listAllChords = () => {
    // TODO: I don't think this has been updated to use the static chord list, but it still seems to work.
    const chordDiv = document.getElementById("allChords");
    chordDiv.innerHTML = "";
    const searchChords = document.getElementById("searchChords").value.toLowerCase();
    let foundChords = [];
    if(searchChords.length == 0) {
       foundChords = allChords;
    } else {
        foundChords = allChords.filter(chord =>{return chord.report.toLowerCase().indexOf(searchChords) > -1 || chord.strokes.toLowerCase().indexOf(searchChords) > -1 });
    }
    foundChords.forEach((chord, index) => {

        const lCase = chord.report.split("and")[0].trim();
        const uCase = chord.report.split("and")[1];
        const rowDiv = document.createElement("div");
        const handId = `hand${index}`;
        rowDiv.setAttribute("class", "row col-sm-3");
        rowDiv.setAttribute("id", handId);
        const chordStrokes = chord.strokes.replaceAll(", ","_")
        const hand = `<img src="/images/svgs/${chordStrokes}.svg" width="100" class="hand" />`
        rowDiv.innerHTML = `<div class="next"><span>${lCase}</span>${chord.strokes}</div>${hand}`;
        chordDiv.appendChild(rowDiv);
        if(uCase){
            const uRowDiv = document.createElement("div");
            uRowDiv.id = `hand${index}u`;
            uRowDiv.setAttribute("class", "row col-sm-3");
            const uHand = `<img src="/images/svgs/tmf_${chordStrokes}.svg" width="100" class="hand" />`
            uRowDiv.innerHTML = `<div class="next"><span>${uCase}</span>tmf, ${chord.strokes}</div>${uHand}`;
            chordDiv.appendChild(uRowDiv);
        }
    });

};
var comparePhrase = () => {
    const chordArray = Array.from(document.querySelectorAll("#chordified div"));
    const chordString = chordArray.map((chord)=>{return chord.getAttribute("name").replace("Space", " ");}).join("");
    const typedPhrase = document.getElementById("phrase").value.split('');
    typedPhrase.forEach((char, index) => {

    });
};
var testTimer = function(event) {
    // TODO: handle other than inputType == "insertText"
    // if(event.inputType == "deleteContentBackward") {
    //     // TODO: handle backspace
    //     return;
    // }
    if(testArea.value.trim().length == 0) {
        // stop timer
        testArea.style.border = "";
        clearInterval(timerHandle);
        timerHandle = null;
        timer.innerHTML = (0).toFixed(1);
        timerValue = 0;
        return;
    }
    const curChar = chordified.getElementsByClassName('outstanding')[0];
    if(curChar && event.data == curChar.getAttribute("name").replace("Space", " ")){
        curChar.setAttribute("class", "completed");
    }
    setNext();
    if(testArea.value == phrase.value.trim().substring(0, testArea.value.length)) {
        // Highlight testArea with orange if it doesn't match phrase so far.
        //TODO: handle backspace and full string rematching
        testArea.style.border = "";
    }
    else{
        testArea.style.border = "4px solid red";
    }
    if(testArea.value.trim() == phrase.value.trim()) {
        // stop timer
        clearInterval(timerHandle);
        timerHandle = null;
        return;
    }
    startTimer();
};
var runTimer = function() {
    timerValue++;
    timer.innerHTML = (timerValue / 10).toFixed(1);
};
var resetChordifiedCompletion = function() {
    Array.from(chordified.getElementsByTagName('div')).forEach(function(element) {
        element.setAttribute("class", "outstanding");
    })
    testArea.style.border = "";
    setNext();
    testArea.focus();
};
var startTimer = function() {
    if(!timerHandle) {
        timerHandle = setInterval(runTimer, 100);
    }
};
var timerCancel = function() {
        testArea.value = '';
        clearInterval(timerHandle);
        timerHandle = null;
        timer.innerHTML = (0).toFixed(1);
        timerValue = 0;
        resetChordifiedCompletion();
        setNext();
}
var clearChords = function() {
    document.getElementById('searchChords').value = '';
    // listAllChords();
}

document.getElementById('chordify')
    .addEventListener('click', chordify);
phrase.addEventListener('change', chordify);
testArea.addEventListener('input', testTimer);
panagrams.addEventListener('click', function(e) {
    phrase.value = e.target.innerHTML;
    chordify();
});
document.getElementById('timerCancel')
    .addEventListener('click', timerCancel);
document.getElementById('listAllChords')
    .addEventListener('click', listAllChords);

document.addEventListener("DOMContentLoaded", () => {
    allChords = fetch('/js/chords.json')
        .then(response => {
            return response.json();
        })
        .then(data => {
            allChords = data;
        });
});
document.getElementById('clearChordsButton')
    .addEventListener('click', clearChords);