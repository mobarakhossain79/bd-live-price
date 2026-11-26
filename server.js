import express from 'express';
import cors from 'cors';
app.get('/', (req, res) => {
  res.send('✅ আজকের বাজারদর API সার্ভার সফলভাবে চলছে! ডেটা দেখতে /api/overview ভিজিট করুন।');
});

const app = express();
app.use(cors());
app.use(express.json());

let marketData = {
  gold: {
  '22k': 197880,
  '21k': 188900,
  '18k': 161900,
  traditional: 134500,
  international: 1586.46,
},
  exchange_rates: {
    USD: 122.50,
    EUR: 132.80,
    GBP: 155.40,
    SAR: 32.65,
    AED: 33.35,
    QAR: 33.60,
    KWD: 398.50,
    MYR: 27.80,
    SGD: 91.20,
    INR: 1.45,
  },
  commodities: {
    1: 72,
    6: 110,
    13: 780,
    20: 167,
  },
};

app.get('/api/overview', (req, res) => res.json(marketData));
app.get('/api/gold-prices', (req, res) => res.json(marketData.gold));
app.get('/api/exchange-rates', (req, res) => res.json({ rates: marketData.exchange_rates }));
app.get('/api/commodities', (req, res) => res.json(marketData.commodities));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
}); 