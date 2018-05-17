const settings = require('../settings');
module.exports = {
    url: `mongodb://${settings.name}:${settings.password}@${settings.host}:${settings.port}/${settings.db}`,
    MongoClient: require('mongodb').MongoClient
};