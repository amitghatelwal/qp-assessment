import "reflect-metadata";
import { InversifyExpressServer } from "inversify-express-utils";
import container from "./inversify.config";
import * as express from 'express';
import * as bodyParser from 'body-parser';
const mysql = require('mysql')
export let dbConnection: any;

require('dotenv').config();
const server = new InversifyExpressServer(container);

server.setConfig(async (app: express.Application) => {
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json({ limit: '10mb' }));
  await connectToDb();
  server.setErrorConfig(async (app) => {
    app.use(async (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.log('error occured here', err);
      res.status(500).json("Some error ocurred. Contact your admin.");
      return;
    })
  });
});

const port = process.env.serverPort;
server.build().listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

async function connectToDb() {
  try {
    dbConnection = mysql.createConnection({
      host: process.env.host,
      user: process.env.user,
      password: process.env.password,
      database: process.env.database,
      port: process.env.mysqlPort
    });
    
    dbConnection.connect();
  } catch (err) {
    console.log('Error while connecting to db - ', err);
    throw err;
  }
}