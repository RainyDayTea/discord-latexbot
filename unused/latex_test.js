const Command = require('./Command');
const Discord = require('discord.js');

const fs = require('fs');
const katex = require('katex');
const path = require('path');
const puppeteer = require('puppeteer');
const { exit } = require('process');

const template = fs.readFileSync('./template.html', 'utf-8');
let browser;
let init = false;

// ======================== MAIN ======================== //
(async () => {
    browser = await puppeteer.launch({ 
        headless: true
    });
    return;
})().then(() => {
    module.exports = new Command(['latex'], async (msg, argv) => {
        if (!init) {
            console.error('Command not initialized.');
            return;
        }
        const page = await browser.newPage();
    
        await page.setContent(toHtmlString('a^2 + b^2 = c^2'));
        let katexHandle = await page.waitForSelector('.katex-html', {timeout: 1000});
        if (katexHandle == null) {
            console.error('No such element found.');
            return;
        }
        console.log(`Children total width: ${await getRealWidth(katexHandle)}`);
        await saveScreenshot(katexHandle, await getRealWidth(katexHandle), 'cropped.png');
    }, );
    exit(0);
});

module.exports = {
    
}


function toHtmlString(latexString) {
    let newStr = template.slice().replace('<placeholder></placeholder>', katex.renderToString(latexString, {
        throwOnError: false,
        displayMode: true,
        output: 'html'
    }));
    return newStr;
}


/**
 * Takes a screenshot of a katex equation using a tighter crop width,
 * and saves the result to disk.
 * @param {*} eqn The katex equation.
 * @param {*} realWidth The tighter crop width.
 * @param {*} path The path to save to disk.
 * @returns The return value of ElementHandle.screenshot()
 */
async function saveScreenshot(eqn, realWidth, path) {
    let bbox = await eqn.boundingBox();
    return await eqn.screenshot({
        path: path,
        clip: {
            x: (bbox.width - realWidth) / 2 + bbox.x,
            y: bbox.y,
            width: realWidth,
            height: bbox.height
        }
    });
}



/**
 * Calculates a tighter width for an ElementHandle.
 * @param {*} eqnHandle 
 * @returns A float, representing the total width of the handle's children.
 */
async function getRealWidth(eqnHandle) {
    let children = await eqnHandle.$$('.katex-html > *');
    let boxPromises = [];
    let boxes = [];
    children.forEach((v) => boxPromises.push(v.boundingBox()));
    boxes = await Promise.all(boxPromises);
    return boxes.reduce((prev, curr) => prev + curr.width, 0);
}