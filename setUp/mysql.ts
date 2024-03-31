import { createPool, Pool, escape } from 'mysql2/promise';
import { DI } from 'lib/DependencyInjection';

export default class extends DI {
    private pool: Pool;

    init(): DI {
        const config: Record<string, string> = {};
        for (const param of ['MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DB']) {
            if  (this.config && typeof this.config[param] === 'string') {
                const p = this.config[param] as string;
                config[param] = p;                
            } else {
                throw new Error(`Param ${param} missing! in config`);
            }
        }

        this.pool = createPool({
            host: config.MYSQL_HOST,
            port: Number(config.MYSQL_PORT),
            user: config.MYSQL_USER,
            password: config.MYSQL_PASSWORD,
            database: config.MYSQL_DB,
            waitForConnections: true,
            connectionLimit: 30,
            queueLimit: 0
        });
        return this;
    }

    getConnection() {
        return this.pool.getConnection();
    }

    async query(sql: string, params: object) {
        const query = this.prepareQuery(sql, params);
        const connection = await this.pool.getConnection();
        const [result] = await connection.query(query);
        (await connection).release;

        return result;
    }
    prepareQuery(sql: string, params: object) {
        return sql.replace(/:(\w+)/g, (txt, key) => {
            if (typeof params === 'object' && params.hasOwnProperty(key)) {
                return escape(params[key as keyof typeof params]);
            }
            return txt;
        });
    }
}