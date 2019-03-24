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
                <span id="register${this._number}" class="registerValue new badge light-blue lighten-5 light-blue-text" data-badge-caption="">${this._value}</span>
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
        
        for(let i=0; i<commands.length; ++i)
            if(commands[i].startsWith("label"))
            {
                let label_name = commands[i].substring(6);
                this.labels[label_name] = i;
            }
    }

}

class Queue {
    constructor() {
        this._queue = [];
        this._offset = 0;
        this.checkValue = int16checker;
        document.getElementById('queue').innerHTML = "";
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

createStateFromRawCode = (rawInput) =>{
    return new ProgramState(rawInput.replace(/;/g, String.fromCharCode(10)).split(String.fromCharCode(10)).map(x => x.trim()), 0);
};
clearRegisters = () => registers.forEach(x => x.value = 0);
clearQueue = () => queue = new Queue();
function postLoad() {
    document.getElementById("stepButton").addEventListener("click", stepListener);
    document.getElementById("runButton").addEventListener("click", runListener);
    document.getElementById("stopButton").addEventListener("click", stopListener);
    document.getElementById("fasterButton").addEventListener("click", fasterListener);
    document.getElementById("slowerButton").addEventListener("click", slowerListener);
    registers = Array(numberOfRegisters).fill(0).map((x, i) => new Register(i));
    queue = new Queue();
}

let runListener = () => {
    document.getElementById("runButton").innerHTML = "<i class=\"material-icons\">pause</i>";
    document.getElementById("runButton").removeEventListener("click", runListener);
    document.getElementById("runButton").addEventListener("click", pauseListener);
    if(!programState){
        document.getElementById("stopButton").classList.remove("disabled");
        clearQueue();
        clearRegisters();
        changeCodeTextToLines();
        document.getElementById("output").innerHTML = "";
        programState = createStateFromRawCode(document.getElementById('code').value);
    }
    start();
};
let pauseListener = () => {
    document.getElementById("runButton").innerHTML = "<i class=\"material-icons\">play_arrow</i>";
    document.getElementById("runButton").addEventListener("click", runListener);
    document.getElementById("runButton").removeEventListener("click", pauseListener);
    pause();
};
stopListener = () => {
    document.getElementById("stopButton").classList.add("disabled");
    stop();
};
resetUIAfterEndOfProgramEvaluationTheLongestMethodNameInThisProject = () =>{
    changeCodeLinesToText();
    document.getElementById("stopButton").classList.add("disabled");
    document.getElementById("runButton").innerHTML = "<i class=\"material-icons\">play_arrow</i>";
    document.getElementById("runButton").addEventListener("click", runListener);
    document.getElementById("runButton").removeEventListener("click", pauseListener);
};
let fasterListener = () => {
    executionInterval /= 1.3;
    if(handle) {
        pause();
        start();
    }
};
let slowerListener = () => {
    executionInterval *= 1.3;
    if(handle) {
        pause();
        start();
    }
};
let stepListener = () => {
    if(!programState){
        document.getElementById("stopButton").classList.remove("disabled");
        clearQueue();
        clearRegisters();
        changeCodeTextToLines();
        document.getElementById("output").innerHTML = "";
        programState = createStateFromRawCode(document.getElementById('code').value);
    }
    step();
};
let changeCodeTextToLines = () => {
    let elements = document.getElementById('code').value
        .replace(/;/g, ";~")
        .split(String.fromCharCode(10)).join("<br class='codeLineBreaker'>"+"~")
        .split("~")
        .map(x => x)
        .map((x,i) => document.getElementById('codeLines')
            .appendChild(htmlToElement(`<span id="codeLine${i}" class="codeLine">${x}</span>`)));

    document.getElementById('code').classList.add('hidden');
    document.getElementById('codeLines').classList.remove('hidden');
};
let changeCodeLinesToText = () => {
    [...document.getElementsByClassName('codeLine')].forEach(x => x.parentElement.removeChild(x));
    document.getElementById('code').classList.remove('hidden');
    document.getElementById('codeLines').classList.add('hidden');
};

if (window.addEventListener) window.addEventListener("load", postLoad, false);
else if (window.attachEvent) window.attachEvent("onload", postLoad);
else window.onload = postLoad;
