import { Hono } from 'hono';
import type { Env } from '../types';
import { createSupabase } from '../lib/supabase';
import { errorResponse, jsonResponse } from '../lib/auth';
import { requireCustomer, requireStaff } from '../middleware/auth';
import {
  detectMessageLanguage,
  localizeMessages,
  normalizeLang,
  writeTranslationCache,
  type ChatMessageRow,
  type LangCode,
} from '../lib/translate';

type AppEnv = {
  Bindings: Env;
  Variables: {
    staff?: Record<string, unknown>;
    customer?: Record<string, unknown>;
  };
};

const chat = new Hono<AppEnv>();

async function persistTranslationCache(
  supabase: ReturnType<typeof createSupabase>,
  messages: ChatMessageRow[],
  viewerLang: LangCode,
) {
  await Promise.all(
    messages.map(async (msg) => {
      if (!msg.is_translated || !msg.translated_message || typeof msg.translated_message !== 'string') return;
      await supabase
        .from('chat_messages')
        .update({
          translated_message: writeTranslationCache(viewerLang, msg.translated_message),
          is_translated: true,
        })
        .eq('id', msg.id);
    }),
  );
}

async function getOrCreateConversation(
  supabase: ReturnType<typeof createSupabase>,
  customerId: string,
  orderId?: string | null,
  customerLanguage?: string,
) {
  let query = supabase.from('conversations').select('*').eq('customer_id', customerId).order('created_at', { ascending: false }).limit(1);
  if (orderId) query = supabase.from('conversations').select('*').eq('customer_id', customerId).eq('order_id', orderId).limit(1);
  else query = supabase.from('conversations').select('*').eq('customer_id', customerId).eq('kind', 'support').is('order_id', null).limit(1);

  const { data: existing } = await query.maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from('conversations')
    .insert({
      customer_id: customerId,
      order_id: orderId || null,
      kind: orderId ? 'order' : 'support',
      customer_language: customerLanguage || 'ar',
      status: 'open',
      last_message_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return created;
}

async function syncCustomerLanguage(
  supabase: ReturnType<typeof createSupabase>,
  customerId: string,
  uiLang: string,
) {
  await supabase
    .from('customers')
    .update({ preferred_language: uiLang, updated_at: new Date().toISOString() })
    .eq('id', customerId);
}

chat.get('/', requireCustomer, async (c) => {
  const customer = c.get('customer')!;
  const orderId = c.req.query('order_id') || null;
  const uiLang = normalizeLang(c.req.query('lang') || String(customer.preferred_language || 'ar'));
  const supabase = createSupabase(c.env);
  try {
    const conversation = await getOrCreateConversation(
      supabase,
      String(customer.id),
      orderId,
      uiLang,
    );
    await syncCustomerLanguage(supabase, String(customer.id), uiLang);
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true });
    const localized = await localizeMessages(
      c.env.AI,
      (messages || []) as ChatMessageRow[],
      'customer',
      uiLang,
    );
    await persistTranslationCache(supabase, localized, uiLang);
    return jsonResponse({ conversation: { ...conversation, customer_language: uiLang }, messages: localized });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Chat error', 500);
  }
});

chat.post('/messages', requireCustomer, async (c) => {
  const customer = c.get('customer')!;
  const body = await c.req.json<{ message?: string; order_id?: string; lang?: string }>();
  const text = (body.message || '').trim();
  if (!text) return errorResponse('Message required', 400);

  const uiLang = normalizeLang(body.lang || String(customer.preferred_language || 'ar'));
  const messageLang = detectMessageLanguage(text);
  const supabase = createSupabase(c.env);
  try {
    const conversation = await getOrCreateConversation(supabase, String(customer.id), body.order_id || null, uiLang);
    const { data: message, error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation.id,
        sender_type: 'customer',
        sender_customer_id: customer.id,
        message: text,
        language: messageLang,
        translated_message: null,
        is_translated: false,
      })
      .select()
      .single();
    if (error) return errorResponse(error.message, 500);
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString(), customer_language: uiLang })
      .eq('id', conversation.id);
    await syncCustomerLanguage(supabase, String(customer.id), uiLang);
    return jsonResponse({ message }, 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : 'Chat error', 500);
  }
});

chat.get('/inbox', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const { data, error } = await supabase
    .from('conversations')
    .select('*, customers(full_name, phone, email, preferred_language), orders(order_number, status)')
    .order('last_message_at', { ascending: false, nullsFirst: false });
  if (error) return errorResponse(error.message, 500);
  return jsonResponse({ conversations: data || [] });
});

chat.get('/inbox/:id', requireStaff, async (c) => {
  const supabase = createSupabase(c.env);
  const uiLang = normalizeLang(c.req.query('lang') || 'ar');
  const id = c.req.param('id');
  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('*, customers(full_name, phone, email, preferred_language), orders(order_number, status)')
    .eq('id', id)
    .single();
  if (error || !conversation) return errorResponse('Conversation not found', 404);
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });
  const localized = await localizeMessages(
    c.env.AI,
    (messages || []) as ChatMessageRow[],
    'staff',
    uiLang,
  );
  await persistTranslationCache(supabase, localized, uiLang);
  return jsonResponse({ conversation, messages: localized });
});

chat.post('/inbox/:id/messages', requireStaff, async (c) => {
  const staff = c.get('staff')!;
  const body = await c.req.json<{ message?: string; lang?: string }>();
  const text = (body.message || '').trim();
  if (!text) return errorResponse('Message required', 400);

  const supabase = createSupabase(c.env);
  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', c.req.param('id'))
    .single();
  if (convError || !conversation) return errorResponse('Conversation not found', 404);

  const messageLang = detectMessageLanguage(text);
  const { data: message, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversation.id,
      sender_type: 'staff',
      sender_staff_id: staff.id,
      message: text,
      language: messageLang,
      translated_message: null,
      is_translated: false,
    })
    .select()
    .single();
  if (error) return errorResponse(error.message, 500);
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString(), assigned_staff_id: staff.id })
    .eq('id', conversation.id);
  return jsonResponse({ message }, 201);
});

export default chat;
