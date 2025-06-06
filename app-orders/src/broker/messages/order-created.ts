import { type OrderCreatedMessage } from '../../../../contracts/messages/order-created-message.ts';
import { channels } from '../channels/index.ts';

export function dispatchOrderCreated(body: OrderCreatedMessage) {
   channels.ordersChannel.sendToQueue(
      'orders',
      Buffer.from(JSON.stringify(body))
   );
}
