const fs = require('fs');
const katex = require('katex');
const path = require('path');
const puppeteer = require('puppeteer');
const { exit } = require('process');

const template = fs.readFileSync('./commands/template.html', 'utf-8');
const macros = {
    "\\R": "\\mathbb{R}",
    "\\Z": "\\mathbb{Z}",
    "\\N": "\\mathbb{N}",
    "\\Q": "\\mathbb{Q}",
    "\\C": "\\mathbb{C}",
    "\\epsilon": "\\varepsilon",
    "\\emptyset": "\\varnothing"
}

let client = null;
let init = false;
let browser;

module.exports = {
    names: ['latex'],
    init: async(options) => {
        client = options.client;
        init = true;
        browser = await puppeteer.launch({ 
            ignoreDefaultArgs: ['--disable-extensions'],
            args: ['--no-sandbox']
        });
    },
    execf: async(msg, args) => {
        if (!init) {
            console.error('Command not initialized.');
            return;
        }
        if (args.length < 2) {
            sendErrorMsg(msg, args);
            return;
        } 
        let latexStr = '';
        args.forEach((v, i) => {
            if (i > 0) {
                latexStr = latexStr.concat(v);
                if (i < args.length-1) latexStr = latexStr.concat(' ');
            }
        });
        console.log(latexStr);
        latexStr = latexStr.replace(/(^`{1,3}|`{1,3}$)/gm, '');
        console.log(latexStr);
        const page = await browser.newPage();
    
        await page.setContent(toHtmlString(latexStr));
        let katexHandle = await page.waitForSelector('.katex-html', {timeout: 3000});
        if (katexHandle == null) {
            console.error('No such element found.');
            return;
        }
        console.log(`\tChildren total width: ${await getRealWidth(katexHandle)}`);
        let img = await saveScreenshot(katexHandle, await getRealWidth(katexHandle), null);
        msg.channel.send({files: [img]});
    },
}



async function sendErrorMsg(msg, args) {
    msg.channel.sendMessage(`Usage: ${names[0]} <expr>`);
}



function toHtmlString(latexString) {
    let newStr = template.slice().replace('<placeholder></placeholder>', katex.renderToString(latexString, {
        throwOnError: false,
        displayMode: true,
        output: 'html',
        macros
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