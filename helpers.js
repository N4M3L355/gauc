function htmlToElement(html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
}

const int16checker = value => value >= 0 && value < 2 ** 16 && value % 1 === 0;

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
        
        this.labels = [];
        
        for(var i=0; i<commands.length; ++i)
            if(commands[i].startsWith("label"))
            {
                var label_name = commands[i].substring(6);
                this.labels[label_name] = i;
            }
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

display = (element, shown=true) => shown ? element.classList.remove("hidden") : element.classList.add("hidden");

const numberOfRegisters = 26;
let executionInterval = 10;
let registers, queue, programState;
let startDebug = () => debugStartHelper(document.getElementById('code').value);
let stopDebug = () => debugStopHelper();

let runStartHelper = (rawInput) => {
    console.log("run was called");
    document.getElementById("runButton").innerHTML = "<i class=\"material-icons left\">stop</i>Pause";
    display(document.getElementById("slowerButton"));
    display(document.getElementById("pauseButton"));
    display(document.getElementById("fasterButton"));
    document.getElementById("stepButton").classList.add('disabled');
    programState = programState||createStateFromRawCode(rawInput);
    run();
};

function postLoad() {
    document.getElementById("stepButton").addEventListener("click", () => step(debugState));
    document.getElementById("runButton").addEventListener("click", () => runStartHelper(document.getElementById('code').value));
    document.getElementById("fasterButton").addEventListener("click", () => executionInterval/=1.5);
    document.getElementById("slowerButton").addEventListener("click", () => executionInterval*=1.5);
    registers = Array(numberOfRegisters).fill(0).map((x, i) => new Register(i));
    queue = new Queue();
}

if (window.addEventListener) window.addEventListener("load", postLoad, false);
else if (window.attachEvent) window.attachEvent("onload", postLoad);
else window.onload = postLoad;
