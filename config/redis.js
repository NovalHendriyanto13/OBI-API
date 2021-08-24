const path = require('path')
const config = require(path.resolve('config/config'))
const redis = require('redis')

module.exports.redisClient = () => {
    const client = redis.createClient(config.redis.port, config.redis.host)
    client.on('error', (error) => {
        console.log('Failed to establish Redis Connection', error); // eslint-disable-line no-console
    });
    
    client.on('connect', () => {
        console.log('Redis client connected', config.redis.host); // eslint-disable-line no-console
    });
    return client
}