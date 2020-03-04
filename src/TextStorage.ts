import redis from "redis";

export class TextStorage {
    private static readonly REDIS_KEY = "collabwritertext";

    private readonly client: redis.RedisClient;

    constructor(redisUrl: string) {
        this.client = redis.createClient(redisUrl);

        this.client.on("error", error => console.log("Redis error " + error));
        this.client.on("connect", error => console.log("Connected to Redis"));
    }

    storeText(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(TextStorage.REDIS_KEY, text, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    }

    retrieveText(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.get(TextStorage.REDIS_KEY, (error, reply) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(reply);
                }
            });
        });
    }
}
