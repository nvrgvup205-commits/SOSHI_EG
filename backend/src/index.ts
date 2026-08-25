import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import settingsRoutes from './routes/settings';
import catalogRoutes from './routes/catalog';
import addressRoutes from './routes/addresses';
import chatRoutes from './routes/chat';

type AppEnv = { Bindings: Env };

const app = new Hono<AppEnv>();

app.use('*', cors({
  origin: (origin, c) => c.env.CORS_ORIGIN === '*' ? origin || '*' : c.env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.get('/', (c) => c.json({
  name: 'Sushi Shop Egypt API',
  version: '1.0.0',
  schema: 'soshi',
}));

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRoutes);
app.route('/api/customers', customerRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/catalog', catalogRoutes);
app.route('/api/addresses', addressRoutes);
app.route('/api/chat', chatRoutes);

export default app;
