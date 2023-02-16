const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tokenSchema = new Schema({
    chainId: {
        type: String,
        required: true
    },
    dexId: {
        type: String,
        required: true
    },
    baseToken: {
        type: String,
        required: true
    },
    pairAddress: {
        type: String,
        required: true
    },
    liquidity: {
        type: Object,
        required: true
    },
    ccxt_ticker: {
        type: String,
        required: true
    }
})






module.exports = mongoose.model('Token', tokenSchema);