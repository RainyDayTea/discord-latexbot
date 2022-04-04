const assert = require('assert').strict;
const fs = require('fs');
const {Client, Intents} = require('discord.js');
const { execf } = require('./commands/latex');
const client = new Client({ 
    intents: [Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES] 
});

const prefix = '??';
let commands = [];

// Set up environment variables
require('dotenv').config();

const replies = JSON.parse(fs.readFileSync('reply.json'));
assert.notEqual(replies, undefined);


// Boilerplate interactions
client.on('ready', (bot) => {
    console.log(`Logged in as ${client.user.tag}!`);

    
    loadCommands().then(() => {
        bot.on('messageCreate', (msg) => {
            if (msg.author.bot == true) return;
            log_msg(msg);
            // if (has_horny(msg.content)) {
            //     console.log('  ↳ Has horny. Issuing warning.');
            //     msg.reply(replies.REPLY_WARN);
            // }
            if (msg.content.indexOf(prefix) == 0) {
                let args = parseArgs(msg.content);
                console.log(args);
                commands.forEach(v => {
                    if (v.names.find(str => str == args[0])) {
                        console.log('Command match found');
                        try {
                            execf(msg, args);
                        } catch (err) {
                            console.error(err);
                        }
                        return;
                    }
                });
            }
        });
    });
    
});


async function loadCommands(bot) {
    const commandsFolder = './commands/';
    let commandModules = [];
    let initPromises = [];
    fs.readdirSync(commandsFolder).forEach(file => {
        if (file.match(/\.js$/) != null) {
            let cmdModule = require(commandsFolder + file);
            console.log(`Loading command for file ${file}...`);
            commandModules.push(cmdModule);
            initPromises.push(cmdModule.init({client: bot}));
        }
    });
    await Promise.all(initPromises);
    commandModules.forEach(v => commands.push(v));
    console.log(`Finished loading commands. (count: ${commandModules.length})`);
}


function parseArgs(str) {
    if (str.indexOf(prefix) != 0) return [];
    str = str.slice(prefix.length);
    return str.match(/\S+(?=\s*)/gm);
}


// Detects "inappropriate speech" in a string 
function has_horny(str) {
    if (typeof(str) != 'string') return false;

    let strLower = str.toLowerCase();
    if (strLower.match(/\b(cum|fap|wank|masturbat)/gm) != null) return true;
}

function log_msg(msg) {
    console.log(`Message from '${msg.author.username}#${msg.author.discriminator}': ${msg.content}`);
}



client.login(process.env.TOKEN);