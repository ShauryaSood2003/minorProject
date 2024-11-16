import Redis from "ioredis"
import dotenv from "dotenv"

// TODO: add import env and config here if this does not work as shown in the video but I don't think it is required so I skipping it for now
// TODO: without adding the import env and config here, it will not work, figure out why, codeim tell me why to add import dotenv and config
dotenv.config() ;

// console.log(process.env.UPSTASH_REDIS_URL)

// connect to redis
export const redisClient = new Redis(process.env.UPSTASH_REDIS_URL);




// a short description of redis here itself
// it is a key-value store that can be used to store data in a key-value pair format, where the key is a string and the value can be any data type.      
// to learn more, go to https://redis.io/docs/
// following is a key value pair that is set in redis
// await client.set('foo', 'bar');