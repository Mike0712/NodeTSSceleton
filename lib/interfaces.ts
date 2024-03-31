export interface IFile {
    fileName: string;
    filePath: string;
    size: number,
    type: 'audio/mpeg';
}

export interface ProcessEnv {
    [key: string]: string | undefined
}