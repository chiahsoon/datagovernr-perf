import {Page} from 'puppeteer';
import {loginToDataverse} from '../utils/common';

// Dataverse Upload
const uploadFileBtnSelector = 'input[type="file"]';
const saveBtnSelector = 'button[id="datasetForm:savebutton"]';
const dupWarningModalSelector = 'div[id="datasetForm:fileAlreadyExistsPopup"]';
const dupWarningModalCloseBtnSelector = 'a[aria-label="Close"]';
const uploadSuccessSelector = '.alert-success';

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
// const dgUrl = 'http://localhost:3000/?siteUrl=https://demo.dataverse.org&datasetId=1955688' +
//     '&datasetPid=doi%3A10.70122%2FFK2%2FEZXAZX&datasetVersion=:draft&apiToken=3e4b895c-0d13-47d2-83a3-3e7bd3146c29';

// DataGovernR Upload modal
const filePassword = 'password';
const openUploadModalBtnSelector = '//span[contains(text(), "Upload Files")]';
const uploadFileInputSelector = 'input[type="file"]';
const uploadFilePasswordInputSelector = 'input[type="password"]';
const genKeySharesSwitchSelector = 'button[role="switch"]';
const dgUploadFileBtnSelector = '.ant-modal-footer button.ant-btn-primary';
const uploadMessageSelector = '.ant-message-notice';


export async function uploadToDV(page: Page, filename: string): Promise<number> {
    await loginToDataverse(page);

    const datasetId = 2;
    const url = `http://localhost:8080/editdatafiles.xhtml?datasetId=${datasetId}&mode=UPLOAD`;
    await page.goto(url);
    await page.waitForNetworkIdle();

    const start = Date.now();
    const fileInput = (await page.$$(uploadFileBtnSelector))[0];
    await fileInput.uploadFile(filename);
    await page.waitForSelector(saveBtnSelector);

    // Close duplicate warning
    const dupWarning = await page.$(dupWarningModalSelector);
    if (dupWarning == null) throw new Error('dupWarning not found');

    if (await dupWarning.isIntersectingViewport()) {
        const closeButtons = await page.$$(dupWarningModalCloseBtnSelector);
        await closeButtons[1].click();
    }

    const saveFilesButton = await page.$(saveBtnSelector);
    if (saveFilesButton == null) throw new Error('saveFilesButton not found');
    await Promise.all([
        page.waitForSelector(uploadSuccessSelector),
        saveFilesButton.click(),
    ]);
    await page.waitForNetworkIdle();
    const timeTaken = (Date.now() - start) / 1000;
    console.log(`Dataverse Upload - Time taken: ${timeTaken}s`);
    return timeTaken;
};

export async function uploadToDG(page: Page, ...filenames: string[]): Promise<number> {
    await page.goto(dgUrl);
    await page.waitForNetworkIdle();
    const [openUploadFilesModalBtn] = await page.$x(openUploadModalBtnSelector);
    await openUploadFilesModalBtn.click();

    const fileInput = await page.$(uploadFileInputSelector);
    const passwordInput = await page.$(uploadFilePasswordInputSelector);
    const genSplitKeysSwitch = await page.$(genKeySharesSwitchSelector);
    const uploadBtn = await page.$(dgUploadFileBtnSelector);
    if (uploadBtn == null) throw new Error('uploadBtn not found');

    if (fileInput == null) throw new Error('fileInput not found');
    if (passwordInput == null) throw new Error('passwordInput not found');
    if (genSplitKeysSwitch == null) throw new Error('genSplitKeysSwitch not found');

    const start = Date.now();
    await passwordInput.type(filePassword);
    await genSplitKeysSwitch.click();
    await fileInput.uploadFile(...filenames);
    await page.waitForTimeout(300); // 250 works

    await Promise.all([
        page.waitForSelector(uploadMessageSelector),
        uploadBtn.click(),
    ]);
    await page.waitForNetworkIdle();

    const timeTaken = (Date.now() - start) / 1000;
    console.log(`DataGovernR Upload - Time taken: ${timeTaken}s`);
    return timeTaken;
}
