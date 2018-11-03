import util from "util";
import redis from "redis";

export class TextStorage {

    private readonly collabWriterTextKey = "collabwritertext";

    private readonly client: redis.RedisClient;

    constructor(redisUrl: string) {
        this.client = redis.createClient(redisUrl);

        this.client.on("error", function (error) {
            console.log("Redis error " + error);
        });
    }

    storeText(text: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.set(this.collabWriterTextKey, text, (error) => {
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
            this.client.get(this.collabWriterTextKey, (error, reply) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(reply);
                }
            });
        });
    }

}