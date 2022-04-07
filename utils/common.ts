import Puppeteer, {Browser, ConsoleMessage, Page} from 'puppeteer';
import fs from 'fs';

const loginPageUrl = 'http://localhost:8080/loginpage.xhtml?redirectPage=%2Fdataverse.xhtml';
const username = 'cs';
const password = 'password1';
const loginUsernameFieldSelector = 'input[id="loginForm:credentialsContainer:0:credValue"]';
const loginPasswordFieldSelector = 'input[id="loginForm:credentialsContainer:1:sCredValue"]';
const loginButtonFieldSelector = 'button[name="loginForm:login"]';

export async function setup(): Promise<[Browser, Page]> {
    const browser = await Puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-fullscreen'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(60 * 60 * 1000);
    return [browser, page];
}

export async function loginToDataverse(page: Page): Promise<void> {
    await page.goto(loginPageUrl);

    const loginTextField = await page.$(loginUsernameFieldSelector);
    const pwTextField = await page.$(loginPasswordFieldSelector);

    if (loginTextField == null) throw new Error('loginTextField not found');
    if (pwTextField == null) throw new Error('pwTextField not found');

    await loginTextField.click();
    await loginTextField.type(username);
    await pwTextField.click();
    await pwTextField.type(password);

    await page.click(loginButtonFieldSelector);
    await page.waitForNavigation();
};

export async function waitForFile(filepath: string): Promise<void> {
    // console.log('Waiting for file at: ', filepath);
    return new Promise(async (resolve) => {
        while (!fs.existsSync(filepath)) {
            await delay(100);
            continue;
        }
        resolve();
    });
};

function delay(time: number) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time);
    });
};

export function avg(arr: number[]): number {
    return arr.reduce((p, c) => p + c, 0 ) / arr.length;
};

export function dup(data: string, count: number): string[] {
    const res: string[] = [];
    for (let i = 0; i < count; i++) res.push(data);
    return res;
};
