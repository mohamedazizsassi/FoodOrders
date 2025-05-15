const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const schema = require('./schema');
const resolvers = require('./resolvers');
const cors = require('cors');

const {
    menuClient,
    orderClient,
    deliveryClient,
    orderStatusStore,
} = require('./grpcClients');

const app = express();
const server = new ApolloServer({ typeDefs: schema, resolvers });

app.use(cors());
app.use(express.json());

// REST endpoints

// Menu endpoints
app.get('/menu/items', (req, res) => {
    menuClient.GetMenuItems({}, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response.items);
    });
});

app.get('/menu/items/:id', (req, res) => {
    const id = req.params.id;
    menuClient.GetMenuItemById({ id }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(response);
    });
});

// Orders endpoints
app.get('/orders/:orderId', (req, res) => {
    const order_id = req.params.orderId;
    orderClient.GetOrderById({ order_id }, (err, response) => {
        if (err) return res.status(404).json({ error: 'Order not found' });
        res.json(response);
    });
});

app.post('/orders', (req, res) => {
    const { items, customerName } = req.body;
    if (!items || !customerName) {
        return res.status(400).json({ error: 'Missing items or customerName' });
    }

    orderClient.CreateOrder({ customerName, itemIds: items }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });

        orderStatusStore[response.orderId] = {
            orderId: response.orderId,
            status: 'created',
            updatedAt: new Date().toISOString(),
        };

        res.json(response);
    });
});

// Delivery status endpoints
app.get('/delivery/status/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    if (orderStatusStore[orderId]) {
        res.json(orderStatusStore[orderId]);
    } else {
        res.status(404).json({ error: `Delivery status for order ${orderId} not found` });
    }
});

app.put('/delivery/status/:orderId', (req, res) => {
    const orderId = req.params.orderId;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Missing status in request body' });

    deliveryClient.UpdateDeliveryStatus({ orderId, status }, (err, response) => {
        if (err) return res.status(500).json({ error: err.message });

        orderStatusStore[orderId] = {
            orderId,
            status: response.status,
            updatedAt: new Date().toISOString(),
        };
        res.json(response);
    });
});

// GraphQL middleware
async function startServer() {
    await server.start();

    app.use('/graphql', express.json(), expressMiddleware(server, {
        context: async ({ req, res }) => ({ req, res }),
    }));

    app.listen(4000, () => {
        console.log('🚀 API Gateway running at http://localhost:4000/graphql');
        console.log('🚀 REST API available at http://localhost:4000/');
    });
}

startServer();
