import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getConversations, getConversationById, createConversation, addMessage, closeConversation } from '@/lib/api/conversations';

// تهيئة قاعدة البيانات للاختبار
beforeAll(async () => {
  await db.init();
  
  // إنشاء جداول الاختبار
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      role TEXT NOT NULL,
      avatar TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      status TEXT DEFAULT 'active'
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      position TEXT,
      avatar TEXT,
      status TEXT DEFAULT 'lead',
      source TEXT,
      assigned_to INTEGER,
      tags TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_contact TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      channel TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      subject TEXT,
      assigned_to INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_message_at TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL,
      sender_type TEXT NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      attachments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS message_reads (
      message_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id, user_id),
      FOREIGN KEY (message_id) REFERENCES messages(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  
  // إضافة بيانات تجريبية
  await db.query(`
    INSERT INTO users (email, password, first_name, last_name, role, status)
    VALUES 
    ('test@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'مستخدم', 'اختبار', 'admin', 'active')
  `);
  
  await db.query(`
    INSERT INTO customers (first_name, last_name, email, phone, company, status, assigned_to)
    VALUES 
    ('أحمد', 'محمد', 'ahmed@example.com', '+966 50 123 4567', 'شركة التقنية', 'customer', 1)
  `);
  
  await db.query(`
    INSERT INTO conversations (customer_id, channel, status, assigned_to, last_message_at)
    VALUES 
    (1, 'whatsapp', 'active', 1, CURRENT_TIMESTAMP)
  `);
  
  await db.query(`
    INSERT INTO messages (conversation_id, sender_type, sender_id, content)
    VALUES 
    (1, 'customer', 1, 'مرحباً، أود الاستفسار عن خدماتكم')
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS message_reads');
  await db.query('DROP TABLE IF EXISTS messages');
  await db.query('DROP TABLE IF EXISTS conversations');
  await db.query('DROP TABLE IF EXISTS customers');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة المحادثات', () => {
  it('يجب أن يجلب جميع المحادثات', async () => {
    const conversations = await getConversations();
    expect(conversations).toBeInstanceOf(Array);
    expect(conversations.length).toBeGreaterThan(0);
    expect(conversations[0]).toHaveProperty('channel', 'whatsapp');
  });
  
  it('يجب أن يجلب محادثة بواسطة المعرف', async () => {
    const conversation = await getConversationById(1);
    expect(conversation).not.toBeNull();
    expect(conversation).toHaveProperty('channel', 'whatsapp');
    expect(conversation).toHaveProperty('messages');
    expect(conversation.messages).toBeInstanceOf(Array);
    expect(conversation.messages.length).toBeGreaterThan(0);
  });
  
  it('يجب أن ينشئ محادثة جديدة', async () => {
    const newConversation = {
      customer_id: 1,
      channel: 'email',
      subject: 'استفسار عن المنتجات',
      assigned_to: 1,
      initial_message: 'مرحباً، كيف يمكنني مساعدتك؟'
    };
    
    const result = await createConversation(newConversation);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء المحادثة
    const conversation = await getConversationById(result.id);
    expect(conversation).not.toBeNull();
    expect(conversation).toHaveProperty('channel', 'email');
    expect(conversation).toHaveProperty('subject', 'استفسار عن المنتجات');
  });
  
  it('يجب أن يضيف رسالة جديدة للمحادثة', async () => {
    const newMessage = {
      sender_type: 'user',
      sender_id: 1,
      content: 'مرحباً بك! كيف يمكنني مساعدتك؟'
    };
    
    const result = await addMessage(1, newMessage);
    expect(result).toHaveProperty('id');
    
    // التحقق من إضافة الرسالة
    const conversation = await getConversationById(1);
    expect(conversation.messages.length).toBeGreaterThan(1);
    expect(conversation.messages.some(msg => msg.content === 'مرحباً بك! كيف يمكنني مساعدتك؟')).toBe(true);
  });
  
  it('يجب أن يغلق المحادثة', async () => {
    const result = await closeConversation(1);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من إغلاق المحادثة
    const conversation = await getConversationById(1);
    expect(conversation).toHaveProperty('status', 'closed');
  });
});
