FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 50053 

CMD ["node", "deliveryMicroservice.js"] 
