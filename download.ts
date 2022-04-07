import {ConsoleMessage} from 'puppeteer';
import {setup} from './utils/common';
import {displayDownloadMetrics, DownloadContext, DownloadMetrics, newDownloadMetrics} from './types/download';
import fs from 'fs';
import {downloadFromDV, downloadFromDG} from './actions/download';

const basePath = '/Users/cs/Downloads/';

export function consoleMsgToDownloadMetrics(msg: ConsoleMessage, res: DownloadMetrics) {
    const text = msg.text();
    const words = text.split(' ');
    const timing = words[words.length-1];
    const timingNumber = parseFloat(timing.slice(0, timing.length - 1));

    if (text.startsWith('Key Generation')) res.keyGenTime = timingNumber;
    if (text.startsWith('Download file from Dataverse')) res.downloadFromDataverseTime = timingNumber;
    if (text.startsWith('Decryption')) res.decryptionTime = timingNumber;
    if (text.startsWith('User download')) res.userDownloadTime = timingNumber;
};

async function singleDownloadWrapper(downloadCtx: DownloadContext): Promise<DownloadMetrics> {
    const {fn, label, idx, downloadPath} = downloadCtx;
    console.log(label);
    const res = newDownloadMetrics();

    const [browser, page] = await setup();
    page.on('console', async (msg) => consoleMsgToDownloadMetrics(msg, res));

    res.total = await fn(page, idx, downloadPath);
    fs.unlinkSync(downloadPath);

    setTimeout(async () => await browser.close(), 5000);
    return res;
}

async function multipleDownloadWithRepeatsWrapper(downloadCtxs: DownloadContext[], repeats: number) {
    for (let i = 0; i < downloadCtxs.length; i++) {
        for (let j = 0; j < repeats; j ++) {
            displayDownloadMetrics(await singleDownloadWrapper(downloadCtxs[i]));
        }
    }
}

function testDVandDGDownload() {
    const uploadFns: DownloadContext[] = [
        {fn: downloadFromDV, label: 'Dataverse Download 1MB - Tabular', idx: 515, downloadPath: basePath + '1MB.csv'},
        {fn: downloadFromDV, label: 'Dataverse Download 100MB - Tabular', idx: 515, downloadPath: basePath + '100MB.csv'},
        {fn: downloadFromDV, label: 'Dataverse Download 1GB - Tabular', idx: 515, downloadPath: basePath + '1GB.csv'},

        {fn: downloadFromDV, label: 'Dataverse Download 1MB - Non-tabular', idx: 515, downloadPath: basePath + '1MB.md'},
        {fn: downloadFromDV, label: 'Dataverse Download 100MB - Non-tabular', idx: 515, downloadPath: basePath + '100MB.md'},
        {fn: downloadFromDV, label: 'Dataverse Download 1GB - Non-tabular', idx: 515, downloadPath: basePath + '1GB.md'},

        {fn: downloadFromDG, label: 'DataGovernR Download 1MB - Tabular', idx: 0, downloadPath: basePath + '1MB.csv'},
        {fn: downloadFromDG, label: 'DataGovernR Download 100MB - Tabular', idx: 0, downloadPath: basePath + '100MB.csv'},
        {fn: downloadFromDG, label: 'DataGovernR Download 1GB - Tabular', idx: 0, downloadPath: basePath + '1GB.csv'},

        {fn: downloadFromDG, label: 'DataGovernR Download 1MB - Non-tabular', idx: 0, downloadPath: basePath + '1MB.md'},
        {fn: downloadFromDG, label: 'DataGovernR Download 100MB - Non-tabular', idx: 0, downloadPath: basePath + '100MB.md'},
        {fn: downloadFromDG, label: 'DataGovernR Download 1GB - Non-tabular', idx: 0, downloadPath: basePath + '1GB.md'},
    ];
    multipleDownloadWithRepeatsWrapper(uploadFns, 3);
}

