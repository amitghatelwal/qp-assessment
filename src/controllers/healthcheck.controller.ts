import { Request, Response } from "express";
import { controller, httpGet } from "inversify-express-utils";
import { GroceryService } from "../services/grocery.service";
import { inject } from "inversify";
import { Constants } from "../utils/Constants";

@controller(`${Constants.CONTEXT_PATH}/${Constants.HEALTH_CHECK}`)
export class HealthController {
  constructor(@inject(GroceryService) private groceryService: GroceryService) {}

  @httpGet("/")
  async getHealthCheck(req: Request, res: Response) {
    try {
      await this.groceryService.getItems({limit: 1});
      return res.json({msg: 'success'});
    } catch (err) {
      return this.groceryService.handleError(err, 'getHealthCheck');
    }
  }
}

