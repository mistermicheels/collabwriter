import { Pool, PoolClient, PoolConfig } from "pg";

export class TextStorage {
    private readonly postgresPool: Pool;

    constructor(postgresUrl: string, enablePostgresSsl: boolean) {
        const postgresOptions: PoolConfig = {
            connectionString: postgresUrl,
            ssl: enablePostgresSsl,
        };

        if (enablePostgresSsl) {
            // allow this to work even with self-signed certificates (not huge security issue in our case)
            postgresOptions.ssl = { rejectUnauthorized: false };
        }

        this.postgresPool = new Pool(postgresOptions);

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
        return this.retrieveTextFromPostgres();
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
