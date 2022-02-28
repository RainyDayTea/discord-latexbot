const assert = require('assert').strict;
const fs = require('fs');
const {Client, Intents} = require('discord.js');
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES] 
});

// Set up environment variables
require('dotenv').config();

const replies = JSON.parse(fs.readFileSync('reply.json'));
assert.notEqual(replies, undefined);


// Boilerplate interactions
client.on('ready', (bot) => {
    console.log(`Logged in as ${client.user.tag}!`);

    bot.on('messageCreate', (msg) => {
        if (msg.author.bot == true) return;
        log_msg(msg);
        if (has_horny(msg.content)) {
            console.log('  ↳ Has horny. Issuing warning.');
            msg.reply(replies.REPLY_WARN);
        }
    });
});


// Detects "inappropriate speech" in a string 
function has_horny(str) {
    if (typeof(str) != 'string') return false;

    let strLower = str.toLowerCase();
    if (strLower.match(/(cum|fap|wank|masturbate)/gm) != null) return true;
}

function log_msg(msg) {
    console.log(`Message from '${msg.author.username}#${msg.author.discriminator}': ${msg.content}`);
}



client.login(process.env.TOKEN);