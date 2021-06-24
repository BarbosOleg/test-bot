module.exports = {
    name: 'args_info',
    description: 'Information about the arguments provided.',
    args: true,
    execute(msg, args){
        if(args[0] === 'foo'){
            return msg.channel.send('bar');
        }

        msg.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);

    }
}