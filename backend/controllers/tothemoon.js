const axios = require("axios");
const ccxt = require("ccxt");
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");

const Dex = require("../models/dex");
const Cex = require("../models/cex");
const Token = require("../models/token");
const Arbitrage = require("../models/arbitrage");
const { base } = require("../models/token");
const { emitKeypressEvents } = require("readline");

exports.example = async (req, res, next) => {
  console.log("it's working");
  const token = await Token.find();
  const cex = await Cex.find();
  const dex = await Dex.find();

  console.log("tokens: ", token.length);
  console.log("cex: ", cex.length);
  console.log("dex: ", dex.length);
};

exports.getTokens = async (req, res, next) => {
  console.log("getTokens");
  const token = await Token.find();
  try {
    console.log(token);
  } catch (err) {
    console.log(err);
  }
};

exports.addTokens = (req, res, next) => {
  console.log("addTokens");
  let cnt = 1
  // ---- mongoDB에 tokens.csv 데이터 업로드
  fs.createReadStream("./tokens_data/tokens.csv")
    .pipe(csv())
    .on("data", async (data) => {
      const chainId = data["chainId"];
      const dexId = data["dexId"];
      const baseToken = data["baseToken"];
      const pairAddress = data["pairAddress"];
      const liquidity = data["liquidity"];
      const ccxt_ticker = data["ccxt_ticker"];

      const token = new Token({
        chainId: chainId,
        dexId: dexId,
        baseToken: baseToken,
        pairAddress: pairAddress,
        liquidity: liquidity,
        ccxt_ticker: ccxt_ticker,
      });
      token
        .save()
        .then((result) => {
            console.log(cnt);
            cnt += 1;
        })
        .catch((err) => {
            console.log(err);
        });
    })
    .on("end", () => {
        console.log("Import Complete!");
    });
  //
};

exports.getCEX = async (req,res,next) => {

    console.log('starting getCEX')
    const binance = new ccxt.binance();
    const binancecoinm = new ccxt.binancecoinm();
    const binanceusdm = new ccxt.binanceusdm();

    const interval = setInterval(async () => {

        const binancemarkets = await binance.fetchTickers();
        const binancecoinmmarkets = await binancecoinm.fetchTickers();
        const binanceusdmmarkets = await binanceusdm.fetchTickers();
    
        for (const bmarkets of Object.values(binancemarkets)) {
          if (
            bmarkets["symbol"].includes("USDT") ||
            bmarkets["symbol"].includes("BUSD")
          ) {
            // console.log(cnt);
            // cnt += 1;
            const symb = bmarkets["symbol"].split("/");
            const pairAddress = bmarkets["symbol"];
            const baseToken = symb[0]; // BNBx
            // const chainId = 'binance';
            // const dexId = 'binance';
            const priceUsd = bmarkets["last"];
            const liquidity = bmarkets["baseVolume"];
            const ccxt_ticker = symb[0];
    
            const update = {
              pairAddreess: pairAddress,
              baseToken: baseToken,
              // chainId : chainId,
              // dexId : dexId,
              priceUsd: priceUsd,
              liquidity: liquidity,
              ccxt_ticker: ccxt_ticker,
            };
    
            try { const result = await Cex.findOneAndUpdate(
              { pairAddress: pairAddress },
              { $set: update },
              { upsert: true, new: true } // if document does not exist, insert
            )} catch (error) {
                console.log(err);
            }
              
          }
        }
    
        for (const bcmarkets of Object.values(binancecoinmmarkets)) {
          const symb = bcmarkets["symbol"].split("/");
          const pairAddress = bcmarkets["symbol"];
          const baseToken = symb[0]; // BNBx
          // const chainId = 'binance';
          // const dexId = 'binance';
          const priceUsd = bcmarkets["last"];
          const liquidity = bcmarkets["baseVolume"];
          const ccxt_ticker = symb[0];
          
        //   console.log(cnt);
        //   cnt += 1;
    
          const update = {
            pairAddreess: pairAddress,
            baseToken: baseToken,
            // chainId : chainId,
            // dexId : dexId,
            priceUsd: priceUsd,
            liquidity: liquidity,
            ccxt_ticker: ccxt_ticker,
          };
    
          try { const result = await Cex.findOneAndUpdate(
            { pairAddress: pairAddress },
            { $set: update },
            { upsert: true } // if document does not exist, insert
          ) } catch (err) {
            console.log(err);
          }
            
        }
    
        for (const bumarkets of Object.values(binanceusdmmarkets)) {
          const symb = bumarkets["symbol"].split("/");
          const pairAddress = bumarkets["symbol"];
          const baseToken = symb[0]; // BNBx
          // const chainId = 'binance';
          // const dexId = 'binance';
          const priceUsd = bumarkets["last"];
          const liquidity = bumarkets["baseVolume"];
          const ccxt_ticker = symb[0];
          
        //   console.log(cnt);
        //   cnt += 1;
    
          const update = {
            pairAddress: pairAddress,
            baseToken: baseToken,
            // chainId : chainId,
            // dexId : dexId,
            priceUsd: priceUsd,
            liquidity: liquidity,
            ccxt_ticker: ccxt_ticker,
          };
    
          try { const result = await Cex.findOneAndUpdate(
            { pairAddress: pairAddress },
            { $set: update },
            { upsert: true } // if document does not exist, insert
          ) } catch (err) {
            console.log(err)
          }
        }
        console.log("getCEX done!")
    }, 30000);

}
  

exports.getDEX = async (req, res, next) => {
  let tokens = await Token.find(); //649개
  const total = tokens.length //649
  const start_index = 0;
  const end_index = Math.floor(total/2);
  //tokens = tokens.slice(start_index,end_index);

  console.log("starting getDEX", total);
  let cnt = 0;
  let timeInterval = 5000;

  let startTime;
  let currentTime;


  const interval = setInterval(async () => {
    /////
    
    startTime = Date.now();
    const urls = [];
    const ccxt_tickers = [];
    // const l = Math.floor(Math.random()*(10) + 5); // 5 ~ 15 개당 200ms
    const l = 10;
    // timeInterval = l * 500
    
    // console.log(timeInterval, l);
    for (let i = 0; i < l; i++){
        const url = `http://api.dexscreener.com/latest/dex/pairs/${tokens[(cnt+i)%total]['chainId']}/${tokens[(cnt+i)%total]['pairAddress']}`
        urls.push(url);
        ccxt_tickers.push(tokens[(cnt+i)%total]['ccxt_ticker']);
        // console.log(tokens[(cnt+i)%total]);
    }
    let i = -1;
    let requests = urls.map((url) => axios.get(url));

    try {
        axios.all(requests).then(async (res) => {
            for(let j = 0; j < l; j++){
                const dat = res[j].data.pair;
                if(!dat) continue;
                const pairAddress = dat.pairAddress;
                const baseToken = dat.baseToken.symbol;
                const chainId = dat.chainId;
                const dexId = dat.dexId;
                const priceUsd = +dat.priceUsd;
                // console.log((cnt+j)%total);
                const ccxt_ticker = ccxt_tickers[j];
                // console.log(ccxt_tickers);
                
                const update = {
                    pairAddress: pairAddress,
                    baseToken: baseToken,
                    chainId: chainId,
                    dexId: dexId,
                    priceUsd: priceUsd,
                    ccxt_ticker: ccxt_ticker
                };
        
                try { let res = await Dex.findOneAndUpdate(
                { pairAddress: pairAddress },
                { $set: update },
                { upsert: true, new: true }
                )
                // console.log(update);
                // console.log((cnt+i)%total);
                    
                } catch (err) {
                    console.log(err);
                }
            }
        })
    }catch(err) {
        throw new Error(err);
    }
    cnt += l;
    console.log(cnt);
    ////////
    currentTime = Date.now();

    console.log(currentTime - startTime);
}, timeInterval)
};

exports.getArbitrage = async (req,res,next) => {
    console.log('executing getArbitrage');

    const standard_percentage = 5;

    // const interval_time = 60000;

    // const interval = setInterval(async () => {
    
        const cex = await Cex.find();
        const dex = await Dex.find();

        const arbitrages = [];

        const arbitrage = {}

        for (let i = 0; i < cex.length; i++) {
            if (cex[i]['ccxt_ticker'] in arbitrage) {
                arbitrage[cex[i]['ccxt_ticker']].push(cex[i]);
            }
            else {
                arbitrage[cex[i]['ccxt_ticker']] = [cex[i]];
            }
        }
        for (let i = 0; i < dex.length; i++) {

            if (dex[i]['ccxt_ticker'] in arbitrage) {
                arbitrage[dex[i]['ccxt_ticker']].push(dex[i]);
            }
            else {
                arbitrage[dex[i]['ccxt_ticker']].push(dex[i]);
            }
        }
        // console.log(Object.keys(arbitrage).length);
        
        for (const a in arbitrage) {
            if (arbitrage[a].length > 1) { // needs more than one pair to have arbitrage
                arbitrage[a].sort((a,b) => b.priceUsd - a.priceUsd);
                const l = arbitrage[a].length - 1;
                const percentage = (arbitrage[a][0].priceUsd - arbitrage[a][l].priceUsd) * 100 / arbitrage[a][l].priceUsd;
                if (percentage >standard_percentage && percentage != Infinity){
                    arbitrages.push({
                        percentage: percentage,
                        high: {
                            pairAddress: arbitrage[a][0].pairAddress,
                            baseToken: arbitrage[a][0].baseToken,
                            chainId: arbitrage[a][0].chainId,
                            dexId: arbitrage[a][0].dexId,
                            priceUsd: arbitrage[a][0].priceUsd,
                            liquidity: +arbitrage[a][0].liquidity,
                            ccxt_ticker: arbitrage[a][0].ccxt_ticker
                        },
                        low: {
                            pairAddress: arbitrage[a][l].pairAddress,
                            baseToken: arbitrage[a][l].baseToken,
                            chainId: arbitrage[a][l].chainId,
                            dexId: arbitrage[a][l].dexId,
                            priceUsd: arbitrage[a][l].priceUsd,
                            liquidity: +arbitrage[a][l].liquidity,
                            ccxt_ticker: arbitrage[a][l].ccxt_ticker
                        }
                    })
                }
        }


        }
    arbitrages.sort((a,b) => b.percentage - a.percentage);
    res.send(JSON.stringify(arbitrages));
    console.log(arbitrages);
// }, interval_time);

}

//////////////////////////////////////////////////////////////////////////////////

// 649개

// 300개 당 1분
// 1초에 5개 

// 1개에 0.2초 200ms