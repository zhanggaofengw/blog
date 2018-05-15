const settings = require('../settings');
module.exports = {
    url: `mongodb://zgf:admin@${settings.host}:${settings.port}/${settings.db}`,
    MongoClient: require('mongodb').MongoClient
};