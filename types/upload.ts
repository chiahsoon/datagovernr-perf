import {Page} from 'puppeteer';
import {avg} from '../utils/common';

export interface UploadMetrics {
    keyGenTime: number
    zipTime: number
    encryptionTime: number
    encryptedHashingTime: number
    plaintextHashingTime: number
    savingFilesToDataverseTime: number
    savingToDGTime: number
    total: number,
};

export interface UploadFn {
    (page: Page, ...filenames: string[]): Promise<number>
};

export interface UploadContext {
    fn: UploadFn
    label: string
    filenames: string[]
}

export function newUploadMetrics(): UploadMetrics {
    return {
        keyGenTime: 0,
        zipTime: 0,
        encryptionTime: 0,
        encryptedHashingTime: 0,
        plaintextHashingTime: 0,
        savingFilesToDataverseTime: 0,
        savingToDGTime: 0,
        total: 0,
    };
}

export function getUploadOthersTime(metrics: UploadMetrics): number {
    return metrics.total - metrics.keyGenTime -
        Math.max(
            Math.max(metrics.encryptionTime, metrics.zipTime) + metrics.savingFilesToDataverseTime,
            Math.max(metrics.plaintextHashingTime, metrics.encryptedHashingTime),
        ) - metrics.savingToDGTime;
}

export function displayUploadMetrics(metrics: UploadMetrics) {
    console.log('Key Gen: ', metrics.keyGenTime);
    console.log('Encryption: ', metrics.encryptionTime);
    console.log('Zip: ', metrics.zipTime);
    console.log('Plaintext Hash: ', metrics.plaintextHashingTime);
    console.log('Ciphertext Hash: ', metrics.encryptedHashingTime);
    console.log('Save files to Dataverse: ', metrics.savingFilesToDataverseTime);
    console.log('Save to DataGovernR: ', metrics.savingToDGTime);
    console.log('Total: ', metrics.total);
    console.log('Others: ', getUploadOthersTime(metrics));
    console.log('\n');
}

export function displayAvgUploadMetrics(metrics: UploadMetrics[]) {
    console.log('Averages: ');
    console.log('Key Gen: ', avg(metrics.map((m) => m.keyGenTime)));
    console.log('Encryption: ', avg(metrics.map((m) => m.encryptionTime)));
    console.log('Zip: ', avg(metrics.map((m) => m.zipTime)));
    console.log('Plaintext Hash: ', avg(metrics.map((m) => m.plaintextHashingTime)));
    console.log('Ciphertext Hash: ', avg(metrics.map((m) => m.encryptedHashingTime)));
    console.log('Save files to Dataverse: ', avg(metrics.map((m) => m.savingFilesToDataverseTime)));
    console.log('Save to DataGovernR: ', avg(metrics.map((m) => m.savingToDGTime)));
    console.log('Others: ', avg(metrics.map((m) => getUploadOthersTime(m))));
    console.log('Total: ', avg(metrics.map((m) => m.total)));
};
