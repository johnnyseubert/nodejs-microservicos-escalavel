import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import { z } from 'zod';
import {
   serializerCompiler,
   validatorCompiler,
   type ZodTypeProvider,
} from 'fastify-type-provider-zod';

import { channels } from '../broker/channels/index.ts';
import { db } from '../db/client.ts';
import { schema } from '../db/schema/index.ts';

const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, { origin: '*' });

app.get('/health', () => 'OK');
app.post(
   '/orders',
   { schema: { body: z.object({ amount: z.number().min(0) }) } },
   async (request, reply) => {
      const { amount } = request.body;

      const response = await db
         .insert(schema.orders)
         .values({
            id: crypto.randomUUID(),
            customerId: 'cdf5965b-2cba-405f-8d42-fe8fbca8cf1b',
            amount,
         })
         .returning();

      channels.ordersChannel.sendToQueue(
         'orders',
         Buffer.from(JSON.stringify(response))
      );

      return reply.status(201).send({
         message: `Order created successfully with amount: ${amount}`,
      });
   }
);

app.listen({ host: '0.0.0.0', port: 3333 }).then(() => {
   console.log('[Orders] Server is running on port 3333');
});
