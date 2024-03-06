import { Request, Response } from "express";
import { controller, httpGet, httpPost, httpPut, httpDelete } from "inversify-express-utils";
import { GroceryService } from "../services/grocery.service";
import { inject } from "inversify";
import { RequestPreprocessor } from "../utils/RequestPreprocessor";
import { Constants } from "../utils/Constants";

@controller(`${Constants.CONTEXT_PATH}/${Constants.GROCERY}`)
export class GroceryController {
  constructor(@inject(GroceryService) private groceryService: GroceryService) {}

  /**
   * @param req skip, limit, search in query
   * @returns Array of item details like itemName(string), price(int), itemId(string), availableInventory(int), discount(int), unit(string).
   * Also returns non available items too [For Admin]
   */
  @httpGet("/getItems", RequestPreprocessor.preprocess)
  async getItems(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      return await this.groceryService.getItems(req.query);
    } catch (err) {
      return this.groceryService.handleError(err, 'getItems');
    }
  }
  
  /**
   * @param req skip, limit, search in query
   * @returns Array of item details like itemName(string), price(int), itemId(string), availableInventory(int), discount(int), unit(string).
   * Only returns available items [For customer]
   */
  @httpGet("/getAvailableItems") // Not preprocessing request here as available items we should see as customer without login too
  async getAvailableItems(req: Request, res: Response) {
    try {
      return await this.groceryService.getAvailableItems(req.query);
    } catch (err) {
      return this.groceryService.handleError(err, 'getAvailableItems');
    }
  }

  /**
   * @param req Object of item to be added in system, object with fields like itemName(string), price(int), itemId(string), availableInventory(int), discount(int), unit(string)
   * @returns returns success.
   */
  @httpPost("/addItem", RequestPreprocessor.preprocess)
  async addItem(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.addItem(req.body);
      return { msg: 'success' };
    } catch (err: any) {
      return this.groceryService.handleError(err, 'addItem');
    }
  }

  /**
   * @param req Creates 'orders' table in db 
   * @returns returns success.
   */
  @httpPost("/createOrderTable", RequestPreprocessor.preprocess)
  async createOrderTable(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.createOrderTable();
      return { msg: 'success' };
    } catch (err: any) {
      return this.groceryService.handleError(err, 'createOrderTable');
    }
  }

  /**
   * @param req Creates 'groceryItems' table in db 
   * @returns returns success.
   */
  @httpPost("/createGroceryTable", RequestPreprocessor.preprocess)
  async createGroceryTable(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.createGroceryTable();
      return { msg: 'success' };
    } catch (err: any) {
      return this.groceryService.handleError(err, 'createGroceryTable');
    }
  }

  /**
   * @param req Takes and updates field like itemName(string), price(int), availableInventory(int), discount(int), unit(string)
   * @returns returns success.
   */
  @httpPut("/updateItem/:itemId", RequestPreprocessor.preprocess)
  async updateItem(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.updateItem(req.params.itemId, req.body);
      return { msg: 'success' };
    } catch (err) {
      return this.groceryService.handleError(err, 'updateItem');
    }
  }

  /**
   * @param req Takes userId(string) and array of objects. Object with itemId(string) and itemCount
   * @returns returns success.
   */
  @httpPost("/bookItems", RequestPreprocessor.preprocess)
  async bookItems(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.orderItems(req.body);
      return { msg: 'success' };
    } catch (err) {
      return this.groceryService.handleError(err, 'bookItems');
    }
  }

  /**
   * @param req Takes itemId(string) is url param and deletes the item from db.
   * @returns returns success.
   */
  @httpDelete("/removeItem/:itemId", RequestPreprocessor.preprocess)
  async removeItem(req: Request, res: Response) {
    try {
      if (req.body.status == 'error') {
        return { msg: req.body.msg, status: 500 };
      }
      await this.groceryService.removeItem(req.params.itemId);
      return { msg: 'success' };
    } catch (err) {
      return this.groceryService.handleError(err, 'removeItem');
    }
  }
}