import {Page} from 'puppeteer';
import {loginToDataverse, waitForFile} from '../utils/common';

// Dataverse Upload
const accessBtnSelector = 'button.btn-access-file';
const downloadCsvBtnSelector = 'a[id="fileForm:j_idt272"]';

// DataGovernR Dataset page
const datasetId = 2;
const datasetPid = 'doi:10.5072/FK2/GFD9PG';
const datasetVersion = ':draft';
const apiToken = 'd080f97e-c66b-48a6-a109-b77363d1fe13';
const dgUrl = 'http://localhost:3000?siteUrl=http://CS-MBP.local:8080' +
    `&datasetId=${datasetId}` +
    `&datasetPid=${datasetPid}` +
    `&datasetVersion=${datasetVersion}` +
    `&apiToken=${apiToken}`;

// DataGovernR File page
const filePassword = 'password';
const fileBtnSelector = 'button.ant-btn-link';
const dropdownBtnSelector = 'button.ant-dropdown-trigger';
const dropdownDownloadBtnSelector = 'li.ant-dropdown-menu-item';
const dropdownDownloadBtnIdx = 0;
const downloadPasswordInputSelector = 'input[type="password"]';
const downloadFileBtnSelector = `.ant-modal-footer button.ant-btn-primary`;

export async function downloadFromDV(page: Page, idx: number, downloadedFilepath: string): Promise<number> {
    await loginToDataverse(page);

    const filePage = `http://localhost:8080/file.xhtml?fileId=${idx}&version=DRAFT`;
    await page.goto(filePage);
    await page.waitForNetworkIdle();

    const accessButton = await page.$(accessBtnSelector);
    if (accessButton == null) throw new Error('accessButton not found');
    await accessButton.click();

    const downloadCsvBtn = await page.$(downloadCsvBtnSelector);
    if (downloadCsvBtn == null) throw new Error('downloadCsvBtn not found');

    const start = Date.now();
    await Promise.all([
        waitForFile(downloadedFilepath),
        downloadCsvBtn.click(),
    ]);
    await page.waitForNetworkIdle();

    const timeTaken = (Date.now() - start) / 1000;
    console.log(`Dataverse Download - Time taken: ${timeTaken}s`);
    return timeTaken;
};

export async function downloadFromDG(page: Page, idx: number, downloadedFilepath: string): Promise<number> {
    await page.goto(dgUrl);
    await page.waitForNetworkIdle();

    await page.waitForSelector(fileBtnSelector);
    const gotoFileBtn = (await page.$$(fileBtnSelector))[idx];
    await gotoFileBtn.click();

    await page.waitForSelector(dropdownBtnSelector);
    const optionsDropdownBtn = await page.$(dropdownBtnSelector);
    if (optionsDropdownBtn == null) throw new Error('optionsDropdownBtn not found');
    await optionsDropdownBtn.click();
    await page.waitForNetworkIdle(); // Otherwise modal won't appear

    const optionsDropdownDownloadBtn = await page.$$(dropdownDownloadBtnSelector);
    await optionsDropdownDownloadBtn[dropdownDownloadBtnIdx].click();

    await page.waitForSelector(downloadPasswordInputSelector);
    const passwordField = await page.$(downloadPasswordInputSelector);
    if (passwordField == null) throw new Error('passwordField not found');
    await passwordField.type(filePassword);

    await page.waitForSelector(downloadFileBtnSelector);
    const downloadFileBtn = await page.$(downloadFileBtnSelector);
    if (downloadFileBtn == null) throw new Error('downloadFileBtn not found');

    const start = Date.now();
    await Promise.all([
        waitForFile(downloadedFilepath),
        downloadFileBtn.click(),
    ]);
    await page.waitForNavigation();

    const timeTaken = (Date.now() - start) / 1000;
    console.log(`DataGovernR Download - Time taken: ${timeTaken}s`);
    return timeTaken;
}
