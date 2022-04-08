const app  = require('express')();
const puppet = require('puppeteer')
const dotenv = require('dotenv')
const {Telegraf} = require('telegraf')
dotenv.config();

const PORT = process.env.PORT || 5000;

const bot = new Telegraf(process.env.BOT_TOKEN);
const validate = (url)=>{
      return /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/.test(url);   
}
bot.start((ctx) =>{
    try {
        ctx.reply('Welcome! this is WEB to pdf  bot. Send any webpage url to save as pdf. Github : https://github.com/khushhnood/Webpdf-bot.git').catch((err)=>{
            if(err){
                console.log("err")
                console.log(err)
                bot.stop('SIGINT');
                bot.stop('SIGTERM')
            }
        })
    } catch (error) {
        console.log("blocked")
        console.log(error)
    }
})

bot.help((ctx) => ctx.reply('type any valid url link.'))
bot.on('text',async(ctx)=>{
    let url = ctx.update.message.text;
    try {
       if(validate(url)){
        ctx.reply('Preparing pdf')
        const browser = await puppet.launch();
        const page = await browser.newPage();
        await page.goto(url, {
                   waitUntil: "networkidle2"
                   });
        const dimensions = await page.evaluate(() => {
            return {
              width: document.documentElement.clientWidth,
              height: document.documentElement.clientHeight,
              deviceScaleFactor: window.devicePixelRatio,
            }
        })
        await page.setViewport(dimensions);
        const buff = await page.pdf({
                format: "A4",
                printBackground: true
        })
        ctx.replyWithDocument(buff);
       }else{
           ctx.reply('This does not seems to be a valid link! Please provide a valid URL.');
       }
    } catch (error) {
        console.log('error: ',error)
    }
})

bot.launch();

app.get('/pdfbot',(req,res)=>{
    res.send("<html><h1>BOT SERVINCE RUNNING</h1></html>")
})
app.listen(PORT,()=>{
    console.log(`Server runnng on ${PORT}`)
})