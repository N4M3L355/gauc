let handle;

make_step = (programState) => {
    
    if(programState.executedCount > 10000 || programState.line >= programState.commands.length)
    {
        clearInterval(handle);
        return;
    }
    
    var current_command = programState.currentLine();
    
    if( current_command.startsWith("get") )
    {
        var reg = current_command.charCodeAt(4) - 97;
        registers[reg].value = queue.peek();
        queue.dequeue();
    }
    
    if( current_command.startsWith("print") )
    {
        console.log("Vypisujem " + queue.peek() + "\n");
        queue.dequeue();
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
    
    if( current_command.startsWith("add") )
    {
        var a = queue.peek();
        queue.dequeue();
        var b = queue.peek();
        queue.dequeue();
        
        queue.enqueue( (a+b)%65536 );
    }
    
    if( current_command.startsWith("sub") )
    {
        var a = queue.peek();
        queue.dequeue();
        var b = queue.peek();
        queue.dequeue();
        
        queue.enqueue( (a-b+65536)%65536 );
    }
    
    if( current_command.startsWith("mul") )
    {
        var a = queue.peek();
        queue.dequeue();
        var b = queue.peek();
        queue.dequeue();
        
        queue.enqueue( (a*b)%65536 );
    }
    
    if( current_command.startsWith("div") )
    {
        var a = queue.peek();
        queue.dequeue();
        var b = queue.peek();
        queue.dequeue();
        
        if(b == 0)
        {
            programState.line = programState.commands.length;
            return;
        }
        queue.enqueue( (a/b)%65536 );
    }
    
    if( current_command.startsWith("mod") )
    {
        var a = queue.peek();
        queue.dequeue();
        var b = queue.peek();
        queue.dequeue();
        
        if(b == 0)
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
        if(queue.peek() == undefined)
        {
            var label_name = current_command.substr(7);
            programState.line = programState.labels[label_name];
        }
    }
    
    programState.executedCount++;
    programState.line++;
};

run = (rawInput, programState) => {

    programState = new ProgramState(rawInput.replace(/;/g, String.fromCharCode(10)).split(String.fromCharCode(10)).map(x => x.trim()), 0);
    handle = setInterval(make_step, 10, programState);

};

step = (programState) =>{
    console.log(`currently on line ${programState.line}: ${programState.currentLine()}`);
    programState.line++;
};
