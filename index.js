const {prefix, token} = require('./config.json');

const discord = require('discord.js');
const client = new discord.Client();

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
    const args = msg.content.slice(prefix.length).trim().split('/ +/');
    const cmd = args.shift().toLocaleLowerCase();

    if(cmd === prefix + 'ping')
    {
        msg.channel.send('Pong.');
    }
});

client.login(token);