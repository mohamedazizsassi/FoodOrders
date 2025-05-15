// grpcClients.js
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const orderStatusStore = {}; // shared in-memory store

const loadProto = (path) => protoLoader.loadSync(path, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const menuProtoDef = loadProto('./protos/menu.proto');
const orderProtoDef = loadProto('./protos/order.proto');
const deliveryProtoDef = loadProto('./protos/delivery.proto');

const menuProto = grpc.loadPackageDefinition(menuProtoDef).menu;
const orderProto = grpc.loadPackageDefinition(orderProtoDef).order;
const deliveryProto = grpc.loadPackageDefinition(deliveryProtoDef).delivery;

const menuClient = new menuProto.MenuService('menu-service:50051', grpc.credentials.createInsecure());
const orderClient = new orderProto.OrderService('order-service:50052', grpc.credentials.createInsecure());
const deliveryClient = new deliveryProto.DeliveryService('delivery-service:50053', grpc.credentials.createInsecure());

module.exports = {
    menuClient,
    orderClient,
    deliveryClient,
    orderStatusStore,
};
