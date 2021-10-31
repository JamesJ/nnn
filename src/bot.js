import Discord from 'discord.js';
import config from "../config.json";

const debug = function (message) {
    if (config.debug) {
        console.log("[DEBUG] " + message);
    }
}

const client = new Discord.Client({intents: ["GUILD_MEMBERS", "GUILD_MESSAGES", "GUILDS", "GUILD_MESSAGE_REACTIONS"]});

async function login() {
    debug("Logging in...")
    return client.login(config.token);
}

async function connect() {
    await client.user.setActivity("with anything other than myself", {type: 'PLAYING'});
    debug("Connected!")
}

async function sendRoleCallMessage(date) {
    const day = date.getDay();
    const index = random(config.messages.role_call.length);
    const selected = config.messages.role_call[index];

    const message = `\`Day ${day}\` ${selected}`;

    const promise = new Promise((resolve, reject) => {
        client.guilds.fetch(config.guild).then(guild => {
            guild.channels.fetch(config.channel).then(channel => resolve(channel));
        })
    });
    promise.then(channel => {
        if (!channel) {
            debug("Channel was null?")
            return;
        }
        channel.send(message).then(message => {
            for (let reactionsKey in config.messages.reactions) {
                message.react(config.messages.reactions[reactionsKey])
            }
            message.startThread({name: "Day " + day + " role call", autoArchiveDuration: 1440}).then(thread => {
                thread.send('Update the group of your status here... Are you a warrior, or pathetic?');
            })
        });
    })
}

function schedule() {
    setTimeout(async function () {
        const date = new Date();

        if (date.getHours() === 21 && date.getMinutes() === 0) {
            await sendRoleCallMessage(date);
        }

        schedule();
    }, 1000 * 60);
}

function random(limit = 10) {
    return Math.floor(Math.random() * limit);
}

export default {
    start: async function () {
        debug("Starting application...");

        await login();

        await connect();

        schedule();
        await sendRoleCallMessage(new Date());
    }
}
