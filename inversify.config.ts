import { Container } from "inversify";
import { GroceryController } from "./src/controllers/grocery.controller";
import { HealthController } from "./src/controllers/healthcheck.controller";
import { GroceryService } from "./src/services/grocery.service";

const container = new Container();
container.bind<HealthController>(HealthController).toSelf();
container.bind<GroceryController>(GroceryController).toSelf();
container.bind<GroceryService>(GroceryService).toSelf();

export default container;