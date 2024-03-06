import { injectable } from "inversify";
import { dbConnection } from "../../server";
import { Constants } from "../utils/Constants";

@injectable()
export class GroceryService {
  constructor() {
  }

  async getItems(reqData: any) {
    const limit = +reqData.limit || 20;
    const skip = +reqData.skip || 0;
    let sqlQuery = `SELECT ${Constants.COLUMNS} FROM ${Constants.GROCERY_TABLE}`;
    if (reqData.search) {
      sqlQuery = sqlQuery + ` WHERE itemName LIKE '%${reqData.search}%'`;
    }
    sqlQuery = sqlQuery + ` LIMIT ${skip}, ${limit}`;
    return await this.executeQuery(sqlQuery);
  }

  async getAvailableItems(reqData: any) {
    const limit = +reqData.limit || 20;
    const skip = +reqData.skip || 0;
    let sqlQuery = `SELECT ${Constants.COLUMNS} FROM ${Constants.GROCERY_TABLE}`;
    if (reqData.search) {
      sqlQuery = sqlQuery + ` WHERE itemName LIKE '%${reqData.search}%' AND availableInventory > 0`;
    } else {
      sqlQuery = sqlQuery + ` WHERE availableInventory > 0`;
    }
    sqlQuery = sqlQuery + ` LIMIT ${skip}, ${limit}`;
    return await this.executeQuery(sqlQuery);
  }

  async addItem(reqData: any) {
    const columns = Constants.COLUMN_ARR;
    let values = '';
    let colNames = '';
    for (const col of columns) {
      if (Object.keys(reqData).includes(col)) {
        colNames = colNames + "," + col;
        values = values + ',' + ((typeof reqData[col] == 'string') ? `'${reqData[col]}'`: reqData[col]);
      } else {
        throw 'Data not found for column: ' + col;
      }
    }
    const sqlQuery = `INSERT INTO ${Constants.GROCERY_TABLE} (` + colNames.substring(1) + `) VALUES (` + values.substring(1) + `)`;
    return await this.executeQuery(sqlQuery);
  }

  async updateItem(itemId: string, reqData: any) {
    let updateQuery = '';
    const columns = Constants.COLUMN_ARR;
    for (let key of Object.keys(reqData)) {
      if (columns.includes(key)) {
        updateQuery = updateQuery + "," + key + ' = ' + ((typeof reqData[key] == 'string') ? `'${reqData[key]}'`: reqData[key]);
      } else {
        throw 'Data not found for column: ' + key;
      }
    }
    const sqlQuery = `UPDATE ${Constants.GROCERY_TABLE} SET ${updateQuery.substring(1)} WHERE itemId = ${itemId}`;
    return await this.executeQuery(sqlQuery);
  }

  async orderItems(reqData: any) {
    let data = reqData;

    const columns = Constants.ORDER_COLUMNS;
    let values = '';
    let colNames = '';
    const itemCheck: any = await this.checkIfAllItemsAvailalble(data.items);
    if (itemCheck?.msg) {
      return itemCheck;
    }
    for (const item of data.items) {
      const itemData: any = {
        userId: data.userId,
        itemId: item.itemId,
        itemCount: item.itemCount,
        orderId: (new Date().valueOf()).toString()
      };
      for (const col of columns) {
        if (Object.keys(itemData).includes(col)) {
          colNames = colNames + "," + col;
          values = values + ',' + ((typeof itemData[col] == 'string') ? `'${itemData[col]}'`: itemData[col]);
        } else {
          throw 'Data not found for column: ' + col;
        }
      }
      
      const sqlQuery1 = `INSERT INTO ${Constants.ORDERS} (` + colNames.substring(1) + `) VALUES (` + values.substring(1) + `)`;
      await this.executeQuery(sqlQuery1); 
      let updateQuery = `UPDATE ${Constants.GROCERY_TABLE} SET availableInventory = availableInventory - ${item.itemCount} WHERE itemId = ${itemData.itemId}`;
      await this.executeQuery(updateQuery); // update availableInventory
    }
  }

  async checkIfAllItemsAvailalble(items: any) {
    for (let item of items) {
      const [itemData]: any = await this.getItemById(item.itemId);
      if (itemData.availableInventory < item.itemCount) {
        return { msg: `Item with itemId: ${item.itemId} is out of stock` };
      }
    }
  }

  async getItemById(itemId: string) {
    let sqlQuery = `SELECT ${Constants.COLUMNS} FROM ${Constants.GROCERY_TABLE}`;
    sqlQuery = sqlQuery + ` WHERE itemId = ${itemId}`;
    return await this.executeQuery(sqlQuery);
  }

  async createGroceryTable() {
    const sqlQuery = `CREATE TABLE ${Constants.GROCERY_TABLE} (itemId varchar(255) NOT NULL, itemName varchar(255), price int, availableInventory int, discount int, unit varchar(255), PRIMARY KEY (itemId))`;
    return await this.executeQuery(sqlQuery);
  }

  async createOrderTable() {
    const sqlQuery = `CREATE TABLE ${Constants.ORDERS} (orderId varchar(255) NOT NULL, itemId varchar(255), userId varchar(255), itemCount int, PRIMARY KEY (orderId))`;
    return await this.executeQuery(sqlQuery);
  }

  async removeItem(itemId: string) {
    const sqlQuery = `DELETE FROM ${Constants.GROCERY_TABLE} WHERE itemId='${itemId}'`;
    return await this.executeQuery(sqlQuery);
  }

  async executeQuery(sqlQuery: string) {

    return await new Promise((resolve, reject) => {
      dbConnection.query(sqlQuery, (err: any, rows: any, fields: any) => {
        if (err) {
          console.log('error in sql', err);
          reject(err);
          return;
        }

        resolve(rows);
      });
    })
  }

  async handleError(err: any, errId = '') {
    console.log(`[${errId}]Error occured - `, err.errMsg || err.msg || err.sqlMessage, err);
    return { status: 'error', msg: err.errMsg || err.msg || err.sqlMessage }
  }
}