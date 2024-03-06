export class Constants {
  public static GROCERY = 'grocery';
  public static CONTEXT_PATH = '/groceryservice';
  public static HEALTH_CHECK = 'healthcheck';
  public static GROCERY_TABLE = 'groceryItems';
  public static ORDERS = 'orders';
  public static COLUMNS = 'itemName, price, itemId, availableInventory, discount, unit';
  public static COLUMN_ARR = ["itemName", "price", "itemId", "availableInventory", "discount", "unit"];
  public static ORDER_COLUMNS = ["userId", "itemId", "itemCount", "orderId"];
}