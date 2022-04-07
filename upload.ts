import {ConsoleMessage} from 'puppeteer';
import {dup, setup} from './utils/common';
import {UploadMetrics, newUploadMetrics, displayUploadMetrics, UploadContext} from './types/upload';
import {uploadToDV, uploadToDG} from './actions/upload';

export function consoleMsgToUploadMetrics(msg: ConsoleMessage, res: UploadMetrics) {
    const text = msg.text();
    const words = text.split(' ');
    const timing = words[words.length-1];
    const timingNumber = parseFloat(timing.slice(0, timing.length - 1));

    if (text.startsWith('Key Generation')) res.keyGenTime = timingNumber;
    if (text.startsWith('Encryption')) res.encryptionTime = timingNumber;
    if (text.startsWith('Zipping')) res.zipTime = timingNumber;
    if (text.startsWith('Stream Hashing')) res.encryptedHashingTime = timingNumber;
    if (text.startsWith('File Hashing')) res.plaintextHashingTime = timingNumber;
    if (text.startsWith('Saving files to Dataverse')) res.savingFilesToDataverseTime = timingNumber;
    if (text.startsWith('Saving to DataGovernR')) res.savingToDGTime = timingNumber;
};

async function singleUploadWrapper(uploadCtx: UploadContext): Promise<UploadMetrics> {
    const {fn, label, filenames} = uploadCtx;
    console.log(label);

    const res = newUploadMetrics();
    const [browser, page] = await setup();
    page.on('console', async (msg) => consoleMsgToUploadMetrics(msg, res));
    res.total = await fn(page, ...filenames);

    setTimeout(async () => await browser.close(), 5000);
    return res;
}

async function multipleUploadWithRepeatsWrapper(uploadData: UploadContext[], repeats: number) {
    for (let i = 0; i < uploadData.length; i++) {
        for (let j = 0; j < repeats; j ++) {
            displayUploadMetrics(await singleUploadWrapper(uploadData[i]));
        }
    }
}

async function testDVandDGUpload() {
    const uploadFns: UploadContext[] = [
        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Tabular', filenames: ['test_data/1MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Tabular', filenames: ['test_data/100MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Tabular', filenames: ['test_data/1GB.csv']},

        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Non-tabular', filenames: ['test_data/1MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Non-tabular', filenames: ['test_data/100MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Non-tabular', filenames: ['test_data/1GB.md']},

        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: ['test_data/1MB.csv']},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: ['test_data/100MB.csv']},
        {fn: uploadToDG, label: 'DataGovernR Upload 1GB - Tabular', filenames: ['test_data/1GB.csv']},

        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: ['test_data/1MB.md']},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: ['test_data/100MB.md']},
        {fn: uploadToDG, label: 'DataGovernR Upload 1GB - Non-tabular', filenames: ['test_data/1GB.md']},
    ];
    multipleUploadWithRepeatsWrapper(uploadFns, 3);
}

async function testCauseOfAdditionalUploadTime() {
    const uploadFns: UploadContext[] = [
        // Plaintext
        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Tabular Plaintext', filenames: ['test_data/1MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Tabular Plaintext', filenames: ['test_data/100MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Tabular Plaintext', filenames: ['test_data/1GB.csv']},

        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Non-tabular Plaintext', filenames: ['test_data/1MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Non-tabular Plaintext', filenames: ['test_data/100MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Non-tabular Plaintext', filenames: ['test_data/1GB.md']},

        // Plaintext Zipped
        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Tabular Plaintext Zipped', filenames: ['test_data/1MB.csv.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Tabular Plaintext Zipped', filenames: ['test_data/100MB.csv.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Tabular Plaintext Zipped', filenames: ['test_data/1GB.csv.zip']},

        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Non-tabular Plaintext Zipped', filenames: ['test_data/1MB.md.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Non-tabular Plaintext Zipped', filenames: ['test_data/100MB.md.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Non-tabular Plaintext Zipped', filenames: ['test_data/1GB.md.zip']},

        // Encrypted
        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Tabular Encrypted', filenames: ['test_data/Encrypted 1MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Tabular Encrypted', filenames: ['test_data/Encrypted 100MB.csv']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Tabular Encrypted', filenames: ['test_data/Encrypted 1GB.csv']},

        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Non-tabular Encrypted ', filenames: ['test_data/Encrypted 1MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Non-tabular Encrypted ', filenames: ['test_data/Encrypted 100MB.md']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Non-tabular Plaintext ', filenames: ['test_data/Encrypted 1GB.md']},

        // Encrypted
        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Tabular Encrypted Zipped', filenames: ['test_data/Encrypted 1MB.csv.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Tabular Encrypted Zipped', filenames: ['test_data/Encrypted 100MB.csv.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Tabular Encrypted Zipped', filenames: ['test_data/Encrypted 1GB.csv.zip']},

        {fn: uploadToDV, label: 'Dataverse Upload 1MB - Non-tabular Encrypted Zipped', filenames: ['test_data/Encrypted 1MB.md.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 100MB - Non-tabular Encrypted Zipped', filenames: ['test_data/Encrypted 100MB.md.zip']},
        {fn: uploadToDV, label: 'Dataverse Upload 1GB - Non-tabular Encrypted Zipped', filenames: ['test_data/Encrypted 1GB.md.zip']},
    ];
    multipleUploadWithRepeatsWrapper(uploadFns, 3);
}

async function testZipVsPoll() {
    const uploadFns: UploadContext[] = [
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 1)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Tabular', filenames: dup('test_data/1MB.csv', 10)},

        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 1)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Tabular', filenames: dup('test_data/10MB.csv', 10)},

        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 1)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Tabular', filenames: dup('test_data/100MB.csv', 10)},

        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: dup('test_data/1MB.md', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: dup('test_data/1MB.md', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: dup('test_data/1MB.md', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: dup('test_data/1MB.md', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 1MB - Non-tabular', filenames: dup('test_data/1MB.md', 10)},

        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Non-tabular', filenames: dup('test_data/10MB.md', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Non-tabular', filenames: dup('test_data/10MB.md', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Non-tabular', filenames: dup('test_data/10MB.md', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Non-tabular', filenames: dup('test_data/10MB.md', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 10MB - Non-tabular', filenames: dup('test_data/10MB.md', 10)},

        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: dup('test_data/100MB.md', 2)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: dup('test_data/100MB.md', 4)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: dup('test_data/100MB.md', 6)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: dup('test_data/100MB.md', 8)},
        {fn: uploadToDG, label: 'DataGovernR Upload 100MB - Non-tabular', filenames: dup('test_data/100MB.md', 10)},
    ];
    multipleUploadWithRepeatsWrapper(uploadFns, 3);
}

