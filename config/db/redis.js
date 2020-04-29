const redis = require('redis')
const config = require('config')

const redisClient = redis.createClient(config.redis.url)

redisClient.on('error', err => {
    console.log('redis is Error: ' + err)
})

redisClient.on('connect', () => {
    console.log('redis is ready')
})

exports.client = redisClient

/**
 * 将数据保存在redis里
 * @param {*} key redis key
 * @param {*} data key => data
 * @param {*} expire 过期时间
 */
exports.saveRedisKey = (key, data, expire = 30 * 60 * 1000) => {
    return new Promise((resolve, reject) => {
        redisClient.set(key, data, 'PX', expire, err => {
            if (err) reject(err)
            resolve({
                key,
                data
            })
        })
    })
}

/**
 * 过期存储在redis里面的数据
 * @param {*} key
 */
exports.expireRedisKey = key => {
    redisClient.expire(key, 0)
}

/**
 * 检测数据是否和Redis存储的一致
 * @param {*} key
 * @param {*} data
 */
exports.verifyRedisKeyVal = (key, data) => {
    return new Promise((resolve, reject) => {
        redisClient.get(key, (err, val) => {
            if (err) reject(err)
            resolve(val === data)
        })
    })
}
