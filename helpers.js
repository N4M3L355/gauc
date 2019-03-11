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

const numberOfRegisters = 15;
let registers;


function postLoad() {
    registers = Array(numberOfRegisters).fill(0).map((x, i) => new Register(i));
}

if (window.addEventListener) window.addEventListener("load", postLoad, false);
else if (window.attachEvent) window.attachEvent("onload", postLoad);
else window.onload = postLoad;