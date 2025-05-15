const { gql } = require('apollo-server-express');

module.exports = gql`
  type MenuItem {
    id: String!
    name: String!
    description: String!
    price: Float!
  }

  type Order {
    orderId: String!
    status: String!
  }

  type Delivery {
    orderId: String!
    status: String!
    updatedAt: String!
  }

  type Query {
    getMenuItems: [MenuItem!]!
    getMenuItemById(id: String!): MenuItem
    getOrderById(order_id: String!): Order
    getDeliveryStatus(orderId: String!): Delivery
  }

  type Mutation {
    createOrder(items: [String!]!): Order!
    updateDeliveryStatus(orderId: String!, status: String!): Delivery!
  }
`;
