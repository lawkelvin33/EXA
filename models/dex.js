const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dexSchema = new Schema ({
    pairAddress: {
        type: String,
        required: true
    },
    baseToken: {
        type: String,
        required: true
    },
    chainId: {
        type: String,
        required: true
    },
    dexId: {
        type: String,
        required: true
    },
    priceUsd: {
        type: Number,
        required: true
    },
    ccxt_ticker: {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Dex', dexSchema);