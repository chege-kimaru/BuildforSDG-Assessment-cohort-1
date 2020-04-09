import express, { Router } from 'express';
import compression from 'compression';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'mongoose-morgan';
import mongodb from 'mongodb';
import path from 'path';
import xml2js from 'xml2js';
import estimator from './estimator';

const mongooseUrl = process.env.MONGODB_URL;
const { MongoClient } = mongodb;
let db;
MongoClient.connect(mongooseUrl, (err, data) => {
  if (err) {
    MongoClient.close();
    throw err;
  }
  db = data.db('test');
});

const jsonBuilder = new xml2js.Builder({ headless: true });

const app = express();
app.use(morgan({ connectionString: mongooseUrl }, {},
  ':method\t\t:url\t\t:status\t\t:response-time ms'));
app.use(compression());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`));
});

const router = Router();

router.post('/', (req, res) => {
  res.json(estimator(req.body));
});

router.post('/:format', (req, res, next) => {
  if (req.params.format === 'json') {
    res.json(estimator(req.body));
  } else if (req.params.format === 'xml') {
    res.header('Content-Type', 'text/xml');
    res.send(jsonBuilder.buildObject(estimator(req.body)));
  } else {
    next();
  }
});

router.get('/logs', (req, res) => {
  const collection = db.collection('logs');
  collection.find({}).toArray((error, docs) => {
    if (error) throw error;
    let text = '';
    docs.forEach((doc) => {
      text += `${doc.log}\r\n`;
    });
    res.header('Content-Type', 'text/plain');
    res.send(text);
  });
});
app.use('/api/v1/on-covid-19', router);

app.use((req, res) => {
  res.status(400).json({ error: 'route not found' });
});

app.use((err, req, res) => {
  res.satus(500).json({ error: 'internal server error' });
});

app.listen(process.env.PORT || 3000);
