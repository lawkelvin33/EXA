const mongoose = require('mongoose');

const Schema = mongoose.Schema

const cexSchema = new Schema ({
    baseToken: {
        type: String,
        required: true
    },
    chainId: {
        type: String,
        default: 'binance',
        required: true
    },
    dexId: {
        type: String,
        default: 'binance',
        required: true
    },
    priceUsd: {
        type: Number,
        required: true
    },
    ccxt_ticker: {
        type: String,
        required: true
    },
    pairAddress: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Cex', cexSchema);