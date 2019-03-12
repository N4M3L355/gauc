function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

const int16checker = value => value > 0 && value < 2 ** 16 && value % 1 === 0;

class Register {

    constructor(number, value = 0) {
        this._number = number;
        this._value = value;
        this.checkValue = int16checker;
        this._element = htmlToElement(`
            <div class="collection-item register">${String.fromCharCode(number+97)}:
                <span id="register${this._number}" class="registerValue new badge teal lighten-5 teal-text" data-badge-caption="">${this._value}</span>
            </div>
        `);
        document.getElementById('registers').appendChild(this._element);
    }

    get value() {
        return this._value;
    }

    set value(value) {
        if (this.checkValue(value)) {
            document.getElementById(`register${this._number}`).innerHTML = value;
            this._value = value;
        }
    }
}


class ProgramState {
    constructor(commands, line) {
        this.commands = commands;
        this.line = line;
        this.executedCount = 0;
        this.currentLine = () => this.commands[this.line];
    }

}

class Queue {
    constructor() {
        this._queue = [];
        this._offset = 0;
        this.checkValue = int16checker;
        this.enqueue = item => {
            if (this.checkValue(item)) {
                item = this._queue.push(item);
                document.getElementById('queue').innerHTML = this._queue.slice(this._offset).join(' ');
                return item;
            }
        };
        this.dequeue = () => {
            if (this._queue.length === 0) return undefined;
            let item = this._queue[this._offset];
            if (++this._offset * 2 >= this._queue.length) {
                this._queue = this._queue.slice(this._offset);
                this._offset = 0;
            }
            document.getElementById('queue').innerHTML = this._queue.slice(this._offset).join(' ');

            return item;

        };
        this.peek = () => (this._queue.length > 0 ? this._queue[this._offset] : undefined);

    }

    get length() {
        return this._queue.length - this._offset;
    }


}

show = (element, show) => show ? element.classList.add("hidden") : element.classList.remove("hidden");
const numberOfRegisters = 15;
let registers, queue, debugState;
let startDebug = () => debugStartHelper(document.getElementById('code').value);
let stopDebug = () => debugStopHelper();

debugStartHelper = (rawInput) => {
    show(document.getElementById("stepButton"), false);
    document.getElementById("debugButton").innerHTML = "<i class=\"material-icons left\">stop</i>Stop Debugging";
    document.getElementById("debugButton").addEventListener("click", stopDebug);
    document.getElementById("debugButton").classList.add('red');
    document.getElementById("debugButton").removeEventListener("click", startDebug);

    debugState = new ProgramState(rawInput.split(String.fromCharCode(10)).map(x => x.trim()), 0);
};

debugStopHelper = () => {
    show(document.getElementById("stepButton"), true);
    document.getElementById("debugButton").innerHTML = "<i class=\"material-icons left\">bug_report</i>Debug";
    document.getElementById("debugButton").addEventListener("click", startDebug);
    document.getElementById("debugButton").classList.remove('red');
    document.getElementById("debugButton").removeEventListener("click", stopDebug);
};

function postLoad() {
    document.getElementById("stepButton").addEventListener("click", () => step(debugState));
    document.getElementById("runButton").addEventListener("click", () => run(document.getElementById('code').value));
    document.getElementById("runButton").addEventListener("click", () => debugStopHelper());
    document.getElementById("debugButton").addEventListener("click", startDebug);
    registers = Array(numberOfRegisters).fill(0).map((x, i) => new Register(i));
    queue = new Queue();
}

if (window.addEventListener) window.addEventListener("load", postLoad, false);
else if (window.attachEvent) window.attachEvent("onload", postLoad);
else window.onload = postLoad;
