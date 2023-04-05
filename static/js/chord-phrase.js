var testArea = document.getElementById('testArea');
const lambdaUrl = 'https://l7c5uk7cutnfql5j4iunvx4fuq0yjfbs.lambda-url.us-east-1.on.aws/';
var chordified = document.getElementById('chordified');
var timer = document.getElementById('timer');
var phrase = document.getElementById('phrase');
var panagrams = document.getElementById('panagrams');

var timerValue = 0;
var timerHandle = null;

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
    var chords = fetch(lambdaUrl, {
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
};
var resetHand = function() {
    document.querySelector("#thumb #me").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#thumb #mf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#thumb #pf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#index #me").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#index #mf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#index #pf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#middle #me").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#middle #mf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#middle #pf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#ring #me").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#ring #mf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#ring #pf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#pinky #me").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#pinky #mf").setAttribute("fill", "#ffb6b6ff");
    document.querySelector("#pinky #pf").setAttribute("fill", "#ffb6b6ff");
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
        const rate = (Math.round(((index + 1) / strokes.length) * 16) - 1).toString(16);
        switch(stroke[0]) {
            case "t":
                document.querySelector(`#thumb #${strokeAction}`).setAttribute("fill", `#0F0${rate}`);
                break;
            case "i":
                document.querySelector(`#index #${strokeAction}`).setAttribute("fill", `#0F0${rate}`);
                break;
            case "m":
                document.querySelector(`#middle #${strokeAction}`).setAttribute("fill", `#0F0${rate}`);
                break;
            case "r":
                document.querySelector(`#ring #${strokeAction}`).setAttribute("fill", `#0F0${rate}`);
                break;
            case "p":
                document.querySelector(`#pinky #${strokeAction}`).setAttribute("fill", `#0F0${rate}`);
                break;
        }
    })
};
var listAllChords = () => {
    const chordDiv = document.getElementById("allChords");
    allChords.forEach((chord, index) => {
        const lCase = chord.report.split("and")[0].trim();
        const uCase = chord.report.split("and")[1];
        const rowDiv = document.createElement("div");
        const handId = `hand${index}`;
        rowDiv.setAttribute("class", "row col-md-6");
        rowDiv.setAttribute("id", handId);
        const hand = `<img src="/images/svgs/${chord.strokes.replaceAll(", ","_")}.svg" width="100" class="hand" />`
        rowDiv.innerHTML = `<div class="next"><span>${lCase}</span>${chord.strokes}</div>${hand}`;
        chordDiv.appendChild(rowDiv);
    });
};
var testTimer = function(event) {
    // TODO: handle other than inputType == "insertText"
    if(event.inputType == "deleteContentBackward") {
        // TODO: handle backspace
        return;
    }
    if(testArea.value.trim().length == 0) {
        // stop timer
        clearInterval(timerHandle);
        timerHandle = null;
        timer.innerHTML = 0;
        timerValue = 0;
        return;
    }
    const curChar = chordified.getElementsByClassName('outstanding')[0];
    if(curChar && event.data == curChar.getAttribute("name").replace("Space", " ")){
        curChar.setAttribute("class", "completed");
    }
    setNext();
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
    timer.innerHTML = timerValue;
};
var resetChordifiedCompletion = function() {
    Array.from(chordified.getElementsByTagName('div')).forEach(function(element) {
        element.setAttribute("class", "outstanding");
    })
    setNext();
    testArea.focus();
};
var startTimer = function() {
    console.log("runTimer", timerValue);
    console.log("timerHandle:", timerHandle);
    if(!timerHandle) {
        timerHandle = setInterval(runTimer, 1000);
    }
};

document.getElementById('chordify')
    .addEventListener('click', chordify);
phrase.addEventListener('change', chordify);
testArea.addEventListener('input', testTimer);
panagrams.addEventListener('click', function(e) {
    phrase.value = e.target.innerHTML;
    chordify();
});
document.getElementById('timerCancel')
    .addEventListener('click', function() {
        testArea.value = '';
        clearInterval(timerHandle);
        timerHandle = null;
        timer.innerHTML = 0;
        timerValue = 0;
        resetChordifiedCompletion();
});
document.getElementById('listAllChords')
    .addEventListener('click', listAllChords);