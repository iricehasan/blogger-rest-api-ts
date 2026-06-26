"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const logger_1 = require("../middleware/logger");
const client = (0, redis_1.createClient)({ url: process.env.REDIS_URL });
client.on("error", (err) => logger_1.logger.error({ err }, "Redis error"));
client.connect();
exports.default = client;
