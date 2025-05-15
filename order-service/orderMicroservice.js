const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { Kafka } = require('kafkajs');

// Load proto
const orderProtoPath = path.join(__dirname, 'order.proto');
const packageDef = protoLoader.loadSync(orderProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const orderProto = grpc.loadPackageDefinition(packageDef).order;

// Dummy orders DB
const orders = [];

// Kafka setup
const kafka = new Kafka({ clientId: 'order-service', brokers: ['localhost:9092'] });
const producer = kafka.producer();

// Connect producer asynchronously
const connectProducer = async () => {
    try {
        await producer.connect();
        console.log('Kafka producer connected');
    } catch (error) {
        console.error('Error connecting Kafka producer:', error);
    }
};

// Send Kafka event
const sendKafkaEvent = async (order) => {
    try {
        await producer.send({
            topic: 'order-created',
            messages: [
                { value: JSON.stringify(order) },
            ],
        });
        console.log('Order created event sent');
    } catch (error) {
        console.error('Error sending Kafka message:', error);
    }
};

// gRPC service implementation
const orderService = {
    CreateOrder: async (call, callback) => {
        const order = {
            id: String(orders.length + 1),
            items: call.request.items,
            status: 'created',
        };
        orders.push(order);

        await sendKafkaEvent(order);

        callback(null, { orderId: order.id, message: "Order created successfully" });
    },

    TrackOrder: (call, callback) => {
        const order = orders.find(o => o.id === call.request.id);
        if (order) {
            callback(null, { orderId: order.id, status: order.status });
        } else {
            callback({ code: grpc.status.NOT_FOUND, message: 'Order not found' });
        }
    },

    GetOrderById: (call, callback) => {
        const { orderId } = call.request;
        const order = orders.find(o => o.id === orderId);
        if (order) {
            callback(null, { orderId: order.id, message: "Order retrieved successfully" });
        } else {
            callback({ code: grpc.status.NOT_FOUND, message: 'Order not found' });
        }
    },

    GetAllOrders: (call, callback) => {
        const allOrders = orders.map(order => ({
            orderId: order.id,
            message: `Order ${order.id} with ${order.items.length} item(s)`
        }));
        callback(null, { orders: allOrders });
    },
};


// Start gRPC server
const server = new grpc.Server();
server.addService(orderProto.OrderService.service, orderService);

const PORT = 50052;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`📦 OrderService gRPC server running at http://localhost:${PORT}`);
});

// Connect the Kafka producer after starting the server
connectProducer().catch(console.error);
