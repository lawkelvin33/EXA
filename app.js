const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const axios = require("axios");
const ccxt = require("ccxt");
const cors = require("cors");

const csv = require('csv-parser');
const fs = require('fs');
const { base } = require("./models/token");
const Token = require('./models/token');

const executeRouter = require('./routes/execute');

const app = express();

app.use((req,res,next) => { 
    res.setHeader('Access-Control-Allow-Origin', '*'); // does not send but only add headers
    // '*'는 모든 domain으로부터 access를 허용함
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, ALL'); //methods that you will allow access to
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // allow requests with these extra headers
    
    // app.use(cors({
    //     origin: "*",
    //     credentials: true,
    //     optionsSuccessStatus: 200,
    // }))
    next();
})

app.use('/', executeRouter);

mongoose
    .connect(
        "mongodb://lawkelvin33:GQvLWms8AFQNQcdN@ac-mggjue9-shard-00-00.izrwwt9.mongodb.net:27017,ac-mggjue9-shard-00-01.izrwwt9.mongodb.net:27017,ac-mggjue9-shard-00-02.izrwwt9.mongodb.net:27017/?ssl=true&replicaSet=atlas-wffvqc-shard-0&authSource=admin&retryWrites=true&w=majority"
    )
    .then(result => {
        console.log('connected!')

        fs.createReadStream('./tokens_data/tokens.csv')
            .pipe(csv())
            .on('data', async (data) => {
                const chainId = data['chainId']
                const dexId = data['dexId']
                const baseToken = data['baseToken']
                const pairAddress = data['pairAddress']
                const liquidity = data['liquidity']
                const ccxt_ticker = data['ccxt_ticker']

                const token = {
                    chainId : chainId,
                    dexId : dexId,
                    baseToken : baseToken,
                    pairAddress : pairAddress,
                    liquidity : liquidity,
                    ccxt_ticker : ccxt_ticker
                }
                const result = await Token.findOneAndUpdate(
                    { pairAddress: pairAddress },
                    { $set: token },
                    { upsert: true, new: true } // if document does not exist, insert
                  )
                    .then((result) => {
                    //   console.log(result);
                    })
                    .catch((err) => {
                      console.log(err);
                    });
                
            })
            .on('end', () => {
                console.log('Import Complete!');
                    })
                
                })
            
            .then(result => {
                app.listen(8000);

            })
            .catch(err => {
                console.log(err);
            })

        

/*
db when? 
final)
telegrambot -> db -> server -> db -> telegrambot

first)
db -> server -> telegrambot
*/



