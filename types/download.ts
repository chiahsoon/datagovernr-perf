import {Page} from 'puppeteer';
import {avg} from '../utils/common';

export interface DownloadMetrics {
    keyGenTime: number
    decryptionTime: number
    downloadFromDataverseTime: number,
    userDownloadTime: number,
    total: number,
}

export interface DownloadFn {
    (page: Page, idx: number, downloadedFilepath: string): Promise<number>
};

export interface DownloadContext {
    fn: DownloadFn
    label: string
    idx: number
    downloadPath: string
}

export function newDownloadMetrics(): DownloadMetrics {
    return {
        keyGenTime: 0,
        decryptionTime: 0,
        downloadFromDataverseTime: 0,
        userDownloadTime: 0,
        total: 0,
    };
};

export function getDownloadOthersTime(metrics: DownloadMetrics): number {
    return metrics.total - metrics.keyGenTime - metrics.downloadFromDataverseTime -
        Math.max(metrics.decryptionTime, metrics.userDownloadTime);
}

export function displayDownloadMetrics(metric: DownloadMetrics) {
    console.log('Key Gen: ', metric.keyGenTime);
    console.log('Download from Dataverse: ', metric.downloadFromDataverseTime);
    console.log('Decryption: ', metric.decryptionTime);
    console.log('User download: ', metric.userDownloadTime);
    console.log('Total: ', metric.total);
    console.log('Others: ', getDownloadOthersTime(metric));
    console.log('\n');
}

export function displayAvgDownloadMetrics(metrics: DownloadMetrics[]) {
    console.log('Averages: ');
    console.log('Key Gen: ', avg(metrics.map((m) => m.keyGenTime)));
    console.log('Download from Dataverse: ', avg(metrics.map((m) => m.downloadFromDataverseTime)));
    console.log('Decryption: ', avg(metrics.map((m) => m.decryptionTime)));
    console.log('User download: ', avg(metrics.map((m) => m.userDownloadTime)));
    console.log('Total: ', avg(metrics.map((m) => m.total)));
    console.log('Others: ', avg(metrics.map((m) => getDownloadOthersTime(m))));
    console.log('\n');
}
