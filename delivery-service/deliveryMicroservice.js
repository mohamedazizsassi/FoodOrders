const grpc = require('@grpc/grpc-js');  // Use the recommended @grpc/grpc-js
const protoLoader = require('@grpc/proto-loader');
const { startConsumer } = require('./kafka/consumer');
const path = require('path');

// Load the proto file for the delivery service
const deliveryProtoPath = path.join(__dirname, 'delivery.proto');  // Ensure the correct path
const packageDefinition = protoLoader.loadSync(deliveryProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const deliveryProto = grpc.loadPackageDefinition(packageDefinition).delivery;
// gRPC client for DeliveryService
const deliveryClient = new deliveryProto.DeliveryService('0.0.0.0:50053', grpc.credentials.createInsecure());

// In-memory store for delivery statuses
let deliveryStatusStore = {};

// Allowed delivery statuses
const allowedStatuses = ['created', 'dispatched', 'delivered'];

// Create a gRPC server
const server = new grpc.Server();

// Implement the dispatchOrder function (for example)
const dispatchOrder = (call, callback) => {
    const order = call.request;
    console.log('Dispatching order:', order);
    // Handle delivery logic here (e.g., contacting delivery drivers)
    callback(null, { status: 'dispatched' });
};

// Implement the updateDeliveryStatus function
const updateDeliveryStatus = (call, callback) => {
    const { orderId, status } = call.request;
    const updatedAt = new Date().toISOString();

    if (!allowedStatuses.includes(status)) {
        return callback({
            code: grpc.status.INVALID_ARGUMENT,
            message: `Invalid status value`,
        });
    }

    deliveryStatusStore[orderId] = { status, updatedAt };
    callback(null, { orderId, status, updatedAt });
};


// Add services to gRPC server
server.addService(deliveryProto.DeliveryService.service, {
    dispatchOrder,
    updateDeliveryStatus: updateDeliveryStatus  // Add the new function to the service
});

// Start the gRPC server
const PORT = 50053;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Delivery service is running on port ${PORT}`);
    server.start();
});

// Start the Kafka consumer for order events (listen for 'order_created' messages)
startConsumer().catch(console.error);
