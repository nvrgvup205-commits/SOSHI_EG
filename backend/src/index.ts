import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { errorResponse, isJsonSyntaxError, jsonResponse } from './lib/http';
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

app.get('/', (c) => jsonResponse({
  name: 'Sushi Shop Egypt API',
  version: '1.1.0',
  schema: 'soshi',
  demo: { customer: '1111 / 1111', admin: '1111 / 1111' },
}));

app.get('/health', (c) => jsonResponse({ status: 'ok', timestamp: new Date().toISOString() }));

app.get('/api', (c) => jsonResponse({
  name: 'Sushi Shop Egypt API',
  version: '1.1.0',
  endpoints: [
    'POST /api/auth/customer/login',
    'POST /api/auth/customer/register',
    'POST /api/auth/staff/login',
    'GET /api/auth/me',
    'GET /api/catalog/home',
    'GET /api/products',
    'POST /api/products',
    'POST /api/products/images',
    'POST /api/orders',
  ],
}));

app.route('/api/auth', authRoutes);
app.route('/api/customers', customerRoutes);
app.route('/api/products', productRoutes);
app.route('/api/orders', orderRoutes);
app.route('/api/admin', adminRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/catalog', catalogRoutes);
app.route('/api/addresses', addressRoutes);
app.route('/api/chat', chatRoutes);

app.notFound((c) => errorResponse(`Not found: ${c.req.method} ${new URL(c.req.url).pathname}`, 404));

app.onError((err, c) => {
  if (isJsonSyntaxError(err)) {
    return errorResponse('Invalid JSON in request body', 400);
  }
  return errorResponse(err instanceof Error ? err.message : 'Internal error', 500);
});

export default app;
