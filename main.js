let handle;
let lastLineNumber;
let out = (where => (...what) => {
    where.innerHTML = where.innerHTML + what + '<br>';
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
    var parsed = false;
    
    if( current_command.startsWith("get") )
    {
        parsed = true;
        var reg = current_command.charCodeAt(4) - 97;
        registers[reg].value = queue.dequeue();
    }
    
    if( current_command.startsWith("print") )
    {
        parsed = true;
        out(document.getElementById("output"))(queue.dequeue());
    }
    
    if( current_command.startsWith("put") )
    {
        parsed = true;
        var x = parseInt(current_command.substr(4));

        if( isNaN(x) )
        {
            var reg = current_command.charCodeAt(4) - 97;
            queue.enqueue(registers[reg].value);   
        }
        else queue.enqueue( x%65536 );
    }
    
    if( current_command.startsWith("add") )
    {
        parsed = true;
        queue.enqueue((queue.dequeue() + queue.dequeue()) % 65536);
    }
    if( current_command.startsWith("sub") )
    {
        parsed = true;
        queue.enqueue((queue.dequeue()-queue.dequeue()+65536)%65536 );
    }
    if( current_command.startsWith("mul") )
    {
        parsed = true;
        queue.enqueue((queue.dequeue() * queue.dequeue()) % 65536);
    }
    if( current_command.startsWith("div") )
    {
        parsed = true;
        var a = queue.dequeue();
        var b = queue.dequeue();
        
        if(b == 0)
        {
            programState.line = programState.commands.length;
            return;
        }
        queue.enqueue( Math.floor(a/b)%65536 );
    }
    
    if( current_command.startsWith("mod") )
    {
        parsed = true;
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
        parsed = true;
        var label_name = current_command.substr(5);
        programState.line = programState.getLabelLine(label_name);
    }
    
    if( current_command.startsWith("jz") )
    {
        parsed = true;
        var reg = current_command.charCodeAt(3) - 97;
        if(registers[reg].value == 0)
        {
            var label_name = current_command.substr(5);
            programState.line = programState.labels[label_name];
        }
    }
    
    if( current_command.startsWith("jeq") )
    {
        parsed = true;
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
        parsed = true;
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
        parsed = true;
        if(queue.peek() === undefined)
        {
            var label_name = current_command.substr(7);
            programState.line = programState.labels[label_name];
        }
    }
    
    if( current_command.startsWith("stop") )
    {
        parsed = true;
        stop();
        return;
    }

    if( current_command.startsWith("label") )
    {
        parsed = true;
    }

    if(parsed == false && current_command != "")
    {
        alert("Nerozpoznany prikaz.");
        stop();
        return;
    }
    
    programState.executedCount++;
    programState.line++;
};

start = () => {
    lastLineNumber = 0;
    handle = setInterval(make_step, executionInterval);
};
pause = () => {
    clearInterval(handle);
    handle = undefined;
};
stop = () => {
    clearInterval(handle);
    handle = undefined;
    if(lastLineNumber!==undefined&&lastLineNumber<programState.commands.length){
        document.getElementById(`codeLine${lastLineNumber}`).classList.remove('orange-text');
    }
    programState = undefined;
    resetUIAfterEndOfProgramEvaluationTheLongestMethodNameInThisProject();
};


step = () =>{
    make_step();
};
