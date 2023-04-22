var testArea = document.getElementById('testArea');
const lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
var chordified = document.getElementById('chordified');
var timer = document.getElementById('timer');
var phrase = document.getElementById('phrase');
var panagrams = document.getElementById('panagrams');
var allChords = [];

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
var resetHand = function() {
    const fingers = ["thumb", "index", "middle", "ring", "pinky"];
    const actions = ["me", "mf", "pf"];
    fingers.forEach((finger) => {
        actions.forEach((action) => {
            document.querySelector(`#${finger} #${action}`).setAttribute("fill", "#ffb6b6ff");
            document.querySelector(`#${finger} #${action}`).setAttribute("stroke", "#000000");
            document.querySelector(`#${finger} #${action}`).setAttribute("stroke-width", "0.1px");
        });
    });
    document.querySelector(`#thumb`).setAttribute("fill", "url(#thumbGradient)");
};
var setNext = () => {
    resetHand();
    const outstanding = chordified.getElementsByClassName('outstanding');
    if(outstanding.length == 0) {
        return;
    };
    var next = outstanding[0];
    next.setAttribute("class", "outstanding next");
    const strokes = next.innerHTML.split("</span>")[1].split(",");
    strokes.forEach((stroke, index)=>{
        stroke = stroke.trim();
        const strokeAction = stroke.slice(1,3);
        const finger = fingers[`${stroke[0]}`];
        var segment = document.querySelector(`#${finger} #${strokeAction}`);
        if(index == 0) {
            segment.setAttribute("stroke", `#0F0F`);
            segment.setAttribute("stroke-width", `3px`);
        }
        else if(index == strokes.length -1 && strokes.length > 1){
            segment.setAttribute("stroke", `#000F`);
            segment.setAttribute("fill", `#0F0F`);
            segment.setAttribute("stroke-width", `2px`);
        }
        else{
            const rateDenominator = Math.max(1, strokes.length -2);
            const rate = (Math.round((Math.max(1, index) / rateDenominator) * 16) - 1).toString(16);
            segment.setAttribute("fill", `#0F0${rate}`);
        }
    })
};
var listAllChords = () => {
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
    if(testArea.value.trim() == phrase.value.trim().substring(0, testArea.value.trim().length)) {
        // Highlight testArea with orange if it doesn't match phrase so far.
        testArea.style.border = "";
    }
    else{
        testArea.style.border = "4px solid orange";
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
    console.log("runTimer", timerValue);
    console.log("timerHandle:", timerHandle);
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
    listAllChords();
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
    resetHand();
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