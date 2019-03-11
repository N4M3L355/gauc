function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
class Register {

    constructor(number, value = undefined) {
        this._number = number;
        this._value = value;
        this.checkValue = value => value>0&&value<2**16&&value%1===0;
        this._element = htmlToElement(`
            <a class="collection-item register">${this._number}. register: 
                <span id="register${this._number}" class="new badge" data-badge-caption="">${this._value}</span>
            </a>
        `);
        document.getElementById('registers').appendChild(this._element);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if(this.checkValue(value)){
            document.getElementById(`register${this._number}`).innerHTML = value;
            this._value = value;
        }
    }
}


class DebugState {
    constructor(commands, line) {
        this.commands = commands;
        this.line = line;
        this.currentLine = () => this.commands[this.line];
    }

}
show = (element,show) => show?element.classList.add("hidden"):element.classList.remove("hidden");
const numberOfRegisters = 15;
let registers, queue, debugState;
let startDebug = () => debugStartHelper(document.getElementById('code').value);
let stopDebug = () => debugStopHelper();

debugStartHelper = (rawInput) => {
    show(document.getElementById("stepButton"),false);
    document.getElementById("debugButton").innerHTML = "<i class=\"material-icons left\">stop</i>Stop Debugging";
    document.getElementById("debugButton").addEventListener("click",stopDebug);
    document.getElementById("debugButton").removeEventListener("click",startDebug);

     debugState = new DebugState(rawInput.split(String.fromCharCode(10)).map(x => x.trim()),0);
};

debugStopHelper = () => {
    show(document.getElementById("stepButton"),true);
    document.getElementById("debugButton").innerHTML = "<i class=\"material-icons left\">bug_report</i>Debug";
    document.getElementById("debugButton").addEventListener("click",startDebug);
    document.getElementById("debugButton").removeEventListener("click",stopDebug);
};

function postLoad() {
    document.getElementById("stepButton").addEventListener("click", () => step(debugState));
    document.getElementById("runButton").addEventListener("click",() => run(document.getElementById('code').value));
    document.getElementById("debugButton").addEventListener("click",startDebug);
    registers = Array(numberOfRegisters).fill(0).map((x, i) => new Register(i));
}

if (window.addEventListener) window.addEventListener("load", postLoad, false);
else if (window.attachEvent) window.attachEvent("onload", postLoad);
else window.onload = postLoad;