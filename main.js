let handle;

make_step = (programState) => {
    
    console.log(`currently on line ${programState.line} ${programState.commands.length}`);
    
    if(programState.executedCount > 20 || programState.line >= programState.commands.length)
    {
        clearInterval(handle);
        return;
    }
    
    registers[0].value = programState.currentLine().length;
    registers[1].value = programState.executedCount;
    
    programState.executedCount++;
    programState.line++;
};

run = (rawInput, programState) => {

    programState = new ProgramState(rawInput.replace(/;/g, String.fromCharCode(10)).split(String.fromCharCode(10)).map(x => x.trim()), 0);
    handle = setInterval(make_step, 1000, programState);

};

step = (programState) =>{
    console.log(`currently on line ${programState.line}: ${programState.currentLine()}`);
    programState.line++;
};
