const mongoose = require('mongoose');

const Schema = mongoose.Schema

const arbitrageSchema = new Schema ({
    percentage: {
        type: Number,
        required: true
    },
    high: {
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
        liquidity: {
            type: Number,
            required: true
        },
        ccxt_ticker: {
            type: String,
            required: true
        }

    },
    low: {
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
        liquidity: {
            type: Number,
            required: true
        },
        ccxt_ticker: {
            type: String,
            required: true
        }

    

    }
})

module.exports = mongoose.model('Arbitrage', arbitrageSchema);