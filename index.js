const fs = require('fs');
const discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new discord.Client();

client.commands = new discord.Collection();
client.cooldowns = new discord.Collection();
const cmdFolders = fs.readdirSync('./commands');

/**
 *  read the sub-folder directories and require each command inside them
 */
for(const folder of cmdFolders){
    const cmdFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for(const file of cmdFiles){
        const cmd = require(`./commands/${folder}/${file}`);
        client.commands.set(cmd.name, cmd);
    }
}
//  verify if bot is logged
client.on('ready', ()=>{
    console.log(`Logged in as ${client.user.tag}!`);
});
/**
 *  If the message either doesn't start with the prefix
 * or the author is a bot, exit early
 */
client.on('message', msg => {
    if(!msg.content.startsWith(prefix) || msg.author.bot) return;
    //pars message arguments
    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const cmd = client.commands.get(cmdName)  || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(cmdName));
    if(!cmd) return;
    /**
     * 
     */
    if (cmd.guildOnly && msg.channel.type === 'dm') {
        return msg.reply('I can\'t execute that command inside DMs!');
    }
    //check for permissions before executing the command
    if(cmd.permissions){
        const authorPerms = msg.channel.permissionsFor(msg.author);
        if(!authorPerms || !authorPerms.has(cmd.permissions)){
            return msg.reply('You can\'t do this!');
        }
    }
    //if args is set true and argument length is not 0
    if (cmd.args && !args.length) 
    {
        let reply = `You didn't provide any arguments, ${msg.author}!`;
        if (cmd.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${cmd.name} ${cmd.usage}\``;
        }
        return msg.channel.send(reply);
    }
    /**
     *  check if the cooldowns Collection already has an entry for the command 
     * being used right nou. If this is not the case, add a new entry, where the
     * value is initialized as an empty Collection.
     *  now: the current timestamp
     *  timestamp: a reference to the Collection of user-ID and timestamp key/value
     * pairs for the triggered command.
     *  cooldownAmount:     the specified cooldown for the command file, converted to 
     * milliseconds for straightforward calculation. If none is specified, this 
     * defaults to three seconds.
     */
    const {cooldowns} = client;
    if(!cooldowns.has(cmd.name)){
        cooldowns.set(cmd.name, new discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(cmd.name);
    const cooldownAmount = (cmd.cooldown || 3) * 1000;

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
    
    //try to execute command
    try {
        cmd.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply('there was an error trying to execute that command');
    }

});
// Set the bot presence (status)
client.on("ready", () => {
    client.user.setActivity('DS(ಥ﹏ಥ)', {type: 'PLAYING'});
})

client.login(token);