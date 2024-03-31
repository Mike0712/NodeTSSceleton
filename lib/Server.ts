import * as https from 'https';
import * as http from 'http';
import fsp from 'fs/promises';
import { handleRequest } from './HandleRequest';
import { ProcessEnv } from 'lib/interfaces';

type SslOptions = {
    key: string;
    cert: string;
}

export class Server {
    private server: any;

    constructor(private config: ProcessEnv, ssl: SslOptions | false) {
        if (ssl) {
            this.server = https.createServer({
                key: ssl.key,
                cert: ssl.cert
            }, handleRequest);
        } else {
            this.server = http.createServer(handleRequest);
        }
        this.init()
    }

    public init() {
        this.server.listen(this.config.port, () => {
            console.log(`Server is running at http://localhost:${this.config.port}`);
        });
    }
}



export default async (config: ProcessEnv) => {
    if (config.SSL_PATH_KEY && config.SSL_PATH_CERT) {
        const key = (await fsp.readFile(config.SSL_PATH_KEY)).toString();
        const cert = (await fsp.readFile(config.SSL_PATH_CERT)).toString();
        const options = {
            key,
            cert
        }
        return new Server(config, options);
    } else {
        return new Server(config, false);
    }   
}