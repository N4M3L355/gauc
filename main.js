

run = (rawInput) => {
    commands = rawInput.split(String.fromCharCode(10)).map(x => x.trim());
    console.log(commands);
    registers[0].value = Math.floor(Math.random()*30);
    registers[0].value = 0.3;   //this should fail
};

step = (debugState) =>{
    console.log(`currently on line ${debugState.line}: ${debugState.currentLine()}`);
    debugState.line++;
};