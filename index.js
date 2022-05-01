const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// middlewares 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m39ui.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db('axiosDB').collection('products');
    console.log('connected to DB')

    app.post('/product', async (req, res) => {
      const product = req.body;
      if (!product.name || !product.price || !product.index) {
        return res.send({ success: false, error: 'Please Provide all info correctly!' })
      }
      const result = await productsCollection.insertOne(product);
      res.send({ success: true, message: `successfully inserted ${product.name}` })
    })

    app.get('/products', async (req, res) => {
      const query = req.query;
      const limit = parseInt(query.limit);
      const pageNumber = parseInt(query.pageNumber);
      // console.log(limit, pageNumber);
      const cursor = productsCollection.find();
      const products = await cursor.skip(pageNumber * limit).limit(limit).toArray();
      const count = await productsCollection.estimatedDocumentCount();

      if (!products?.length) {
        return res.send({ success: false, error: 'No Product Found!!!' })
      }

      res.send({ success: true, data: products, count: count })
    })
  }

  catch (error) {
    console.log(error)
  }
}

run();



app.get('/', (req, res) => {
  res.send('server is running');
})
app.listen(port, () => {
  console.log('server is listening to port', port);
})