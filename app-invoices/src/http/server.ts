import '@opentelemetry/auto-instrumentations-node/register';
import '../broker/subscriber.ts';
import { fastifyCors } from '@fastify/cors';
import { fastify } from 'fastify';
import {
   serializerCompiler,
   validatorCompiler,
   type ZodTypeProvider,
} from 'fastify-type-provider-zod';

const app = fastify().withTypeProvider<ZodTypeProvider>();
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifyCors, { origin: '*' });

app.get('/health', () => 'OK');

app.listen({ host: '0.0.0.0', port: 3334 }).then(() => {
   console.log('[Invoices] Server is running on port 3334');
});
