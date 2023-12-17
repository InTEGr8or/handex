var svgNS = 'http://www.w3.org/2000/svg';
let rowsOfKeys;
var svg = document.getElementById("keyboardSVG");
const colWidth = 5.7;
const rowHeight = 11;
const colPadding = 0.5;
const rowPadding = colPadding;
let Keys = [];

class Key {
    constructor(qKey){
        // TODO: this is probably backwards. I should create the svg attributes from the Key.
        let key = qKey.children["keyRect"];
        this.x = key.getAttribute("x");
        this.y = key.getAttribute("y");
        this.width = key.getAttribute("width");
        this.height = key.getAttribute("height");
        this.id = qKey.children["keyChord"]?.textContent.replace("0x", "");
    }
}        

Keys.addKey = function(qKey){
    this.push(new Key(qKey));
}

Keys.getKey = function(id){
    return this.find((key) => key.id == id);
}

fetch("/js/qwerty-hid-map.json")
    .then(response => response.json())
    .then(json => {
        rowsOfKeys = json;
        renderKeys();
        // renderArrows();
    }
);

function setKeyDiv(key, x, y, width, appendTo=document.body){
    // TODO: This div version of the svg. WIll need to pick one or the other.
    var keyDiv = document.getElementById("keyTemplate").content.cloneNode(true).getElementById("keyDiv");
    keyDiv.style.left = x + "px";
    keyDiv.style.top = y + "px";
    keyDiv.style.width = width + "px";
    if(key.caps){
        keyDiv.children["keyCaps"].textContent = key.caps;
    } else {
        // keyDiv.children[0].children["keyCaps"].remove();
    }
    keyDiv.children["keyText"].textContent = key.key;
    if(key.chord){
        keyDiv.children["keyChord"].textContent = key.chord;
    } else {
        // keyDiv.children[0].children["keyChord"].remove();
    }
    appendTo.appendChild(keyDiv);
}

function setKeySvg(key, x, y, width, appendTo=svg){
    // Create the QWERTY keyboard from the json file.
    var qKey = document.getElementById("Qkey").cloneNode(true);
    qKey.setAttribute("id", key.chord);
    qKey.classList.add("chordKey");
    qKey.children["keyRect"].setAttribute("x", x);
    qKey.children["keyRect"].setAttribute("y", y);
    qKey.children["keyRect"].setAttribute("width", width);
    qKey.children["keyRect"].setAttribute("height", rowHeight);
    if(key.caps){
        qKey.children["keyCaps"].textContent = key.caps;
        qKey.children["keyCaps"].setAttribute("x", x + 1);
        qKey.children["keyCaps"].setAttribute("y", y + 2);
        qKey.children["keyText"].setAttribute("y", y + 4);
    } else {
        qKey.children["keyCaps"].remove();
        qKey.children["keyText"].setAttribute("y", y + 2);
    }
    qKey.children["keyText"].textContent = key.key;
    qKey.children["keyText"].setAttribute("x", x + 1);
    if(key.chord || key.chord === 0x0){
        let chordHex = key.chord.replace("0x", "");
        let chordImage = document.createElementNS(svgNS, "image");
        chordImage.setAttribute("href", `/images/svgs/${chordHex}.svg`);
        chordImage.setAttribute("x", x + 0.5);
        chordImage.setAttribute("y", y + 2);
        chordImage.setAttribute("width", colWidth - 1);
        chordImage.setAttribute("height", rowHeight - 1);
        qKey.appendChild(chordImage);
        qKey.children["keyChord"].textContent = `0x${chordHex}`;
        qKey.children["keyChord"].setAttribute("x", x + 0.5);
        qKey.children["keyChord"].setAttribute("y", y + rowHeight - 0.5);
        if(key.chord.toString(16).length == 1){
            qKey.children["keyRect"].style.fill = "#D0FFD0";
        }
        // TODO: Add chord-svg image url.
    } else {
        qKey.children["keyChord"].remove();
    }
    appendTo.appendChild(qKey);
    qKey.addEventListener("mouseover", function(){
        qKey.classList.add("chord-highlight");
        renderArrows(qKey);
    });
    qKey.addEventListener("mouseout", function(){
        Array.from(document.getElementsByClassName("chord-highlight")).forEach((highlightKey) => {
            highlightKey.classList.remove("chord-highlight");
        });
        Array.from(document.getElementsByClassName("chord-error")).forEach((errorKey) => {
            errorKey.classList.remove("chord-error");
        });
        let arrows = Array.from(document.getElementsByClassName("chordArrow"));
        arrows.forEach((arrow) => {
            svg.removeChild(arrow);
        });
    });
    Keys.addKey(qKey);
}

function renderKeys(){
    let y = 0;
    rowsOfKeys.forEach((row) => {
        let x = 0;
        row.forEach((key) => {
            let width = key.xScale * colWidth;
            setKeySvg(key, x, y, width);
            x += width + colPadding;
        });
        y += rowHeight + rowPadding;
    });
}

function renderArrows(qKey){
    let code = qKey.id.replace("0x", "");
    if(code.length == 1){
        return;
    }
    let codes = Array.from(code)
    for(var i = 0; i < codes.length - 1; i++) {
        let sourceKey = document.getElementById(`0x${codes[i]}`);
        let targetKey = document.getElementById(`0x${codes[i + 1]}`);
        if(sourceKey?.children == undefined){
            qKey.classList.add("chord-error");
            if(targetKey?.children["keyRect"]){
                targetKey.classList.add("chord-error");
            }
            continue;
        }
        if(targetKey?.children == undefined){
            qKey.classList.add("chord-error");
            if(sourceKey?.children["keyRect"]){
                sourceKey.classList.add("chord-error");
            }
            continue;
        }
        renderArrowBetweenKeys(sourceKey, targetKey, i);
    };
}

function renderArrowBetweenKeys(sourceKey, targetKey, index){
    //Create an SVG path element of the chain of keys.
    let arrowShift = index * 2;
    let arrow = document.createElementNS(svgNS, "line");
    if(sourceKey?.children == undefined){
        console.log("Source key is not used");
        return false;
    }
    let sourceRect = sourceKey.children["keyRect"];
    if(targetKey?.children == undefined){
        console.log("Target key is not used");
        return false;
    }
    let targetRect = targetKey.children["keyRect"];
    arrow.setAttribute(
        "x1", 
        parseFloat(sourceRect.getAttribute("x")) 
        + parseFloat(sourceRect.getAttribute("width")) / 2);
    arrow.setAttribute(
        "y1", 
        arrowShift 
        + parseFloat(sourceRect.getAttribute("y")) 
        + parseFloat(sourceRect.getAttribute("height")) / 2);
    arrow.setAttribute(
        "x2", 
        parseFloat(targetRect.getAttribute("x")) 
        + parseFloat(targetRect.getAttribute("width")) / 2);
    arrow.setAttribute(
        "y2", 
        arrowShift 
        + parseFloat(targetRect.getAttribute("y")) 
        + parseFloat(targetRect.getAttribute("height")) / 2);
    arrow.setAttribute("stroke", index === 0 ? "green": "black");
    arrow.setAttribute("stroke-width", "0.2");
    arrow.setAttribute("marker-end", "url(#arrowhead)");
    arrow.setAttribute("marker-start", "url(#arrowtail)");
    arrow.setAttribute("z-index", "100");
    arrow.classList.add("chordArrow");
    svg.appendChild(arrow);
}
