let handle;
let lastLineNumber;
let out = (where => (...what) => {
    where.innerHTML = what;
    return what;
});
make_step = () => {
    if(programState.executedCount > 10000 || programState.line >= programState.commands.length)
    {
        stop();
        return;
    }

    document.getElementById(`codeLine${programState.line}`).classList.add('orange-text');
    if(lastLineNumber!==undefined){
        document.getElementById(`codeLine${lastLineNumber}`).classList.remove('orange-text');
    }
    lastLineNumber = programState.line;
    var current_command = programState.currentLine();
    
    if( current_command.startsWith("get") )
    {
        var reg = current_command.charCodeAt(4) - 97;
        registers[reg].value = queue.dequeue();
    }
    
    if( current_command.startsWith("print") )
    {
        out(document.getElementById("output"))(queue.dequeue());
    }
    
    if( current_command.startsWith("put") )
    {
        var x = parseInt(current_command.substr(4));

        if( isNaN(x) )
        {
            var reg = current_command.charCodeAt(4) - 97;
            queue.enqueue(registers[reg].value);   
        }
        else queue.enqueue( x%65536 );
    }
    
    if( current_command.startsWith("add") ) queue.enqueue((queue.dequeue() + queue.dequeue()) % 65536);
    
    if( current_command.startsWith("sub") ) queue.enqueue((queue.dequeue()-queue.dequeue()+65536)%65536 );
    
    if( current_command.startsWith("mul") ) queue.enqueue((queue.dequeue() * queue.dequeue()) % 65536);
    
    if( current_command.startsWith("div") )
    {
        var a = queue.dequeue();
        var b = queue.dequeue();
        
        if(b == 0)
        {
            programState.line = programState.commands.length;
            return;
        }
        queue.enqueue( (a/b)%65536 );
    }
    
    if( current_command.startsWith("mod") )
    {
        var a = queue.dequeue();
        var b = queue.dequeue();
        
        if(b === 0)
        {
            programState.line = programState.commands.length;
            return;
        }
        queue.enqueue( (a%b)%65536 );
    }
    
    if( current_command.startsWith("jump") )
    {
        var label_name = current_command.substr(5);
        programState.line = programState.labels[label_name];
    }
    
    if( current_command.startsWith("jz") )
    {
        var reg = current_command.charCodeAt(3) - 97;
        if(registers[reg].value == 0)
        {
            var label_name = current_command.substr(5);
            programState.line = programState.labels[label_name];
        }
    }
    
    if( current_command.startsWith("jeq") )
    {
        var reg1 = current_command.charCodeAt(4) - 97;
        var reg2 = current_command.charCodeAt(6) - 97;
        
        if(registers[reg1].value == registers[reg2].value)
        {
            var label_name = current_command.substr(8);
            programState.line = programState.labels[label_name];
        }
    }
    
    if( current_command.startsWith("jgt") )
    {
        var reg1 = current_command.charCodeAt(4) - 97;
        var reg2 = current_command.charCodeAt(6) - 97;
        
        if(registers[reg1].value > registers[reg2].value)
        {
            var label_name = current_command.substr(8);
            programState.line = programState.labels[label_name];
        }
    }
    
    if( current_command.startsWith("jempty") )
    {
        if(queue.peek() === undefined)
        {
            var label_name = current_command.substr(7);
            programState.line = programState.labels[label_name];
        }
    }
    
    programState.executedCount++;
    programState.line++;
};

start = () => handle = setInterval(make_step, executionInterval);
pause = () => clearInterval(handle);
stop = () => {
    clearInterval(handle);
    if(lastLineNumber!==undefined&&lastLineNumber<programState.commands.length){
        document.getElementById(`codeLine${lastLineNumber}`).classList.remove('orange-text');
    }
    programState = undefined;
    resetUIAfterEndOfProgramEvaluationTheLongestMethodNameInThisProject();
};


step = () =>{
    make_step();
};
