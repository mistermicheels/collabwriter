import redis from "redis";

import { Pool, PoolClient } from "pg";

export class TextStorage {
    private static readonly REDIS_KEY = "collabwritertext";

    private readonly redisClient: redis.RedisClient;

    private readonly postgresPool: Pool;

    constructor(redisUrl: string, postgresUrl: string, enablePostgresSsl: boolean) {
        this.redisClient = redis.createClient(redisUrl);

        this.redisClient.on("connect", () => console.log("Connected to Redis"));
        this.redisClient.on("error", (error) => console.error("Redis error " + error));

        this.postgresPool = new Pool({
            connectionString: postgresUrl,
            ssl: enablePostgresSsl,
        });

        this.postgresPool.on("connect", () => console.log("Connected to Postgres"));
        this.postgresPool.on("error", (error) => console.error("Postgres error " + error));
    }

    public async initialize(): Promise<void> {
        await this.executePostgresQuery(async (client) => {
            await client.query(
                `CREATE TABLE IF NOT EXISTS collabwritertext (
                    id integer PRIMARY KEY,
                    collabwritertext text
                );`
            );
        });
    }

    async storeTextAndSwallowErrors(text: string): Promise<void> {
        try {
            await this.storeTextInPostgres(text);
        } catch (error) {
            console.error(`Error storing text in Postgres: ${error.message}`);
        }
    }

    async retrieveText(): Promise<string> {
        let retrievedText = await this.retrieveTextFromPostgres();

        if (!retrievedText) {
            retrievedText = await this.retrieveTextFromRedis();
            await this.storeTextInPostgres(retrievedText);
        }

        return retrievedText;
    }

    async storeTextInPostgres(text: string): Promise<void> {
        await this.executePostgresQuery(async (client) => {
            await client.query(
                `INSERT INTO collabwritertext (id, collabwritertext) VALUES (1, $1)
                ON CONFLICT (id) DO UPDATE SET collabwritertext = $1;`,
                [text]
            );

            console.info("Stored text in Postgres");
        });
    }

    retrieveTextFromRedis(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.redisClient.get(TextStorage.REDIS_KEY, (error, reply) => {
                if (error) {
                    reject(error);
                } else {
                    console.info("Retrieved stored text from Redis");
                    resolve(reply);
                }
            });
        });
    }

    async retrieveTextFromPostgres(): Promise<string> {
        return this.executePostgresQuery(async (client) => {
            const queryResult = await client.query(
                `SELECT collabwritertext FROM collabwritertext WHERE id = 1;`
            );

            let text = "";

            if (queryResult.rows.length > 0) {
                text = String(queryResult.rows[0].collabwritertext);
            }

            if (text) {
                console.info("Retrieved stored text from Postgres");
            } else {
                console.warn("Didn't find any stored text in Postgres");
            }

            return text;
        });
    }

    private async executePostgresQuery<T>(
        queryFunction: (client: PoolClient) => Promise<T>
    ): Promise<T> {
        const client = await this.postgresPool.connect();

        try {
            return await queryFunction(client);
        } finally {
            client.release();
        }
    }
}
