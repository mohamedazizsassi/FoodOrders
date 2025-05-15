const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'order-service',
    brokers: ['kafka:9092'] // Ensure Kafka is running on this address
});

const producer = kafka.producer();

const startProducer = async () => {
    await producer.connect();
    console.log('Producer connected to Kafka');

    // Example function to send "order_created" event
    const sendOrderCreatedEvent = async (order) => {
        try {
            await producer.send({
                topic: 'order-created',
                messages: [
                    {
                        value: JSON.stringify(order),
                    },
                ],
            });
            console.log('Order created event sent');
        } catch (error) {
            console.error('Error sending order-created event:', error);
        }
    };


    await sendOrderCreatedEvent(order);
};

// Graceful shutdown handling
process.on('SIGINT', async () => {
    await producer.disconnect();
    console.log('Producer disconnected');
    process.exit(0);
});

startProducer().catch(console.error);
