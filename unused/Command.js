const Discord = require('discord.js');

//TODO: Learn TypeScript to enforce structure

/* An example instance of this object type. The 'client' field here is set to
   null to avoid creating a real Discord user, but in reality
   a client must be provided. */
const exampleCommand = {
    client: null,
    names: ['example', 'exmp', 'ex'],
    exec: (msg, argv) => {
        console.log(`Hello world! (Invoked by ${msg.author.username} 
            with ${argv.length} args)`);
    }
}

/**
 * Represents a bot command.
 */
class Command {

    /**
     * Creates a new command.
     * @param {Array<string>} names The names the command responds to. The first element is presumed
     *      to be the "true name" and subsequent elements are aliases.
     * @param {Function} execf Called when the command executes. The function must accept
     *      a Discord.Message and a string array as arguments.
     * @param {Function} init Called once before execf. Used to set up
     *      necessary context.
     */
    constructor(names, execf, init) {
        this.names = names;
        this.execf = execf;
        this.init = init;
    }
}

module.exports = Command;