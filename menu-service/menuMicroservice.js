const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load .proto
const menuProtoPath = path.join(__dirname, 'menu.proto');
const packageDef = protoLoader.loadSync(menuProtoPath, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});
const menuProto = grpc.loadPackageDefinition(packageDef).menu;

// Dummy menu data
const menuItems = [
    { id: '1', name: 'Sushi', description: 'Fresh salmon sushi', price: 10.99 },
    { id: '2', name: 'Ramen', description: 'Pork ramen bowl', price: 12.5 },
];

// gRPC service implementation
const menuService = {
    GetMenuItems: (call, callback) => {
        callback(null, { items: menuItems });
    },
    GetMenuItemById: (call, callback) => {
        const item = menuItems.find(m => m.id === call.request.id);
        if (item) {
            callback(null, item);
        } else {
            callback({ code: grpc.status.NOT_FOUND, message: 'Item not found' });
        }
    },
};

// Start gRPC server
const server = new grpc.Server();
server.addService(menuProto.MenuService.service, menuService);

const PORT = 50051;
server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});
