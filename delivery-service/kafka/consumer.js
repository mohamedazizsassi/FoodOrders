const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'delivery-service',
  brokers: ['kafka:9092']

});

const consumer = kafka.consumer({ groupId: 'delivery-group' });

const orderStatusStore = {};  // In-memory store for order statuses

const startConsumer = async () => {
  try {
    // Connect the consumer to Kafka
    await consumer.connect();
    console.log('Kafka consumer connected.');

    // Subscribe to the "order_created" topic
    await consumer.subscribe({ topic: 'order-created', fromBeginning: true });
    console.log('Subscribed to "order-created" topic.');

    // Start consuming messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const order = JSON.parse(message.value.toString());
          console.log(`Received message for order: ${order.id}, Status: ${order.status}`);

          // Store or process the delivery status (for example, storing in-memory)
          orderStatusStore[order.id] = {
            orderId: order.id,
            status: order.status,
            updatedAt: new Date().toISOString(),
          };

          console.log(`Order ${order.id} status updated: ${order.status}`);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    console.log('Kafka consumer is now listening for events.');
  } catch (error) {
    console.error('Error starting Kafka consumer:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    console.log('Shutting down consumer...');
    await consumer.stop();
    await consumer.disconnect();
    console.log('Kafka consumer disconnected.');

  } catch (error) {
    console.error('Error during consumer shutdown:', error);
  }
};

// Call the startConsumer function
startConsumer();

// Handle shutdown signals (e.g., SIGINT, SIGTERM)
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { startConsumer };
