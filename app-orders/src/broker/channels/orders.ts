import { broker } from '../broker.ts';

export const ordersChannel = await broker.createChannel();
await ordersChannel.assertQueue('orders');
