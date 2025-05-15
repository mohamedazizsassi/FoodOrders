const {
  menuClient,
  orderClient,
  deliveryClient,
  orderStatusStore,
} = require('./grpcClients');

const resolvers = {
  Query: {
    getMenuItems: () =>
      new Promise((resolve, reject) => {
        menuClient.GetMenuItems({}, (err, response) => {
          if (err) reject(err);
          else resolve(response.items);
        });
      }),

    getMenuItemById: (_, { id }) =>
      new Promise((resolve, reject) => {
        menuClient.GetMenuItemById({ id }, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      }),

    getOrderById: (_, { order_id }) =>
      new Promise((resolve, reject) => {
        orderClient.GetOrderById({ order_id }, (err, response) => {
          if (err) reject(err);
          else resolve(response);
        });
      }),

    getDeliveryStatus: (_, { orderId }) =>
      new Promise((resolve, reject) => {
        if (orderStatusStore[orderId]) {
          console.log(`Order ${orderId} status:`, orderStatusStore[orderId]);
          resolve(orderStatusStore[orderId]);
        } else {
          reject(new Error(`Delivery status for order ${orderId} not found`));
        }
      }),
  },

  Mutation: {
    createOrder: (_, args) =>
      new Promise((resolve, reject) => {
        const { items, customerName } = args;

        orderClient.CreateOrder({ customerName, itemIds: items }, (err, response) => {
          if (err) reject(err);
          else {
            orderStatusStore[response.orderId] = {
              orderId: response.orderId,
              status: 'created',
              updatedAt: new Date().toISOString(),
            };
            console.log(`Order ${response.orderId} status added to store`);
            resolve(response);
          }
        });
      }),

    updateDeliveryStatus: (_, { orderId, status }) =>
      new Promise((resolve, reject) => {
        deliveryClient.UpdateDeliveryStatus({ orderId, status }, (err, response) => {
          if (err) reject(err);
          else {
            orderStatusStore[orderId] = {
              orderId,
              status: response.status,
              updatedAt: new Date().toISOString(),
            };
            console.log(`Updated delivery status for order ${orderId}: ${response.status}`);
            resolve(response);
          }
        });
      }),
  },
};

module.exports = resolvers;
