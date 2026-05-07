import { createClient } from "redis";
import { logger } from "../middleware/logger";

const client = createClient({ url: process.env.REDIS_URL });

client.on("error", (err: Error) => logger.error({ err }, "Redis error"));

client.connect();

export default client;
