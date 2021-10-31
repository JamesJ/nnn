import bot from './bot';

const load = async function () {
    console.log("Starting application...")

    await bot.start();
}

load().then(() => {
    console.log("Started!")
});
