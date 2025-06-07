import { channels } from './channels/index.ts';

channels.ordersChannel.consume(
   'orders',
   async (message) => {
      if (!message) return null;
      console.log('Received message:', message.content.toString());

      channels.ordersChannel.ack(message);
   },
   { noAck: false }
);
