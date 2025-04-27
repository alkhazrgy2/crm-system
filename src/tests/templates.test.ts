import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, getBots, getBotById, createBot, updateBot, toggleBotStatus } from '@/lib/api/templates';

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
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      subject TEXT,
      content TEXT NOT NULL,
      variables TEXT,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS bots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      trigger_type TEXT NOT NULL,
      trigger_value TEXT NOT NULL,
      is_active BOOLEAN DEFAULT 1,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS bot_actions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bot_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      config TEXT NOT NULL,
      order_num INTEGER NOT NULL,
      FOREIGN KEY (bot_id) REFERENCES bots(id)
    )
  `);
  
  // إضافة بيانات تجريبية
  await db.query(`
    INSERT INTO users (email, password, first_name, last_name, role, status)
    VALUES 
    ('test@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'مستخدم', 'اختبار', 'admin', 'active')
  `);
  
  await db.query(`
    INSERT INTO templates (name, type, subject, content, variables, created_by)
    VALUES 
    ('ترحيب بالعميل', 'email', 'مرحباً بك في شركتنا', 'مرحباً {{customer_name}}،\n\nنشكرك على التواصل معنا. يسعدنا خدمتك.\n\nمع تحيات فريق العمل', '{"customer_name":"اسم العميل"}', 1)
  `);
  
  await db.query(`
    INSERT INTO bots (name, description, trigger_type, trigger_value, is_active, created_by)
    VALUES 
    ('روبوت الترحيب', 'يرسل رسالة ترحيب تلقائية للعملاء الجدد', 'new_customer', '*', 1, 1)
  `);
  
  await db.query(`
    INSERT INTO bot_actions (bot_id, type, config, order_num)
    VALUES 
    (1, 'wait', '{"duration":60}', 1),
    (1, 'send_message', '{"template_id":1,"channel":"email"}', 2)
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS bot_actions');
  await db.query('DROP TABLE IF EXISTS bots');
  await db.query('DROP TABLE IF EXISTS templates');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة القوالب والروبوتات', () => {
  it('يجب أن يجلب جميع القوالب', async () => {
    const templates = await getTemplates();
    expect(templates).toBeInstanceOf(Array);
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('name', 'ترحيب بالعميل');
    expect(templates[0]).toHaveProperty('type', 'email');
  });
  
  it('يجب أن يجلب قالب بواسطة المعرف', async () => {
    const template = await getTemplateById(1);
    expect(template).not.toBeNull();
    expect(template).toHaveProperty('name', 'ترحيب بالعميل');
    expect(template).toHaveProperty('subject', 'مرحباً بك في شركتنا');
  });
  
  it('يجب أن ينشئ قالب جديد', async () => {
    const newTemplate = {
      name: 'متابعة العميل',
      type: 'whatsapp',
      content: 'مرحباً {{customer_name}}،\n\nأود الاطمئنان على رأيك في خدماتنا. هل لديك أي استفسارات؟',
      variables: '{"customer_name":"اسم العميل"}',
      created_by: 1
    };
    
    const result = await createTemplate(newTemplate);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء القالب
    const template = await getTemplateById(result.id);
    expect(template).not.toBeNull();
    expect(template).toHaveProperty('name', 'متابعة العميل');
    expect(template).toHaveProperty('type', 'whatsapp');
  });
  
  it('يجب أن يحدث بيانات القالب', async () => {
    const updateData = {
      content: 'مرحباً {{customer_name}}،\n\nأود الاطمئنان على رأيك في خدماتنا. هل أنت راضٍ عن الخدمة المقدمة؟\n\nنتطلع لسماع رأيك.',
    };
    
    const result = await updateTemplate(2, updateData);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث القالب
    const template = await getTemplateById(2);
    expect(template.content).toContain('هل أنت راضٍ عن الخدمة المقدمة؟');
  });
  
  it('يجب أن يحذف القالب', async () => {
    const result = await deleteTemplate(2);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من حذف القالب
    const template = await getTemplateById(2);
    expect(template).toBeNull();
  });
  
  it('يجب أن يجلب جميع الروبوتات', async () => {
    const bots = await getBots();
    expect(bots).toBeInstanceOf(Array);
    expect(bots.length).toBeGreaterThan(0);
    expect(bots[0]).toHaveProperty('name', 'روبوت الترحيب');
    expect(bots[0]).toHaveProperty('actions');
    expect(bots[0].actions).toBeInstanceOf(Array);
    expect(bots[0].actions.length).toBe(2);
  });
  
  it('يجب أن يجلب روبوت بواسطة المعرف', async () => {
    const bot = await getBotById(1);
    expect(bot).not.toBeNull();
    expect(bot).toHaveProperty('name', 'روبوت الترحيب');
    expect(bot).toHaveProperty('trigger_type', 'new_customer');
    expect(bot).toHaveProperty('actions');
    expect(bot.actions).toBeInstanceOf(Array);
    expect(bot.actions.length).toBe(2);
  });
  
  it('يجب أن ينشئ روبوت جديد', async () => {
    const newBot = {
      name: 'روبوت المتابعة',
      description: 'يرسل رسالة متابعة بعد 3 أيام من آخر تواصل',
      trigger_type: 'no_activity',
      trigger_value: '3',
      created_by: 1,
      actions: [
        { type: 'wait', config: '{"duration":4320}' },
        { type: 'send_message', config: '{"template_id":1,"channel":"whatsapp"}' }
      ]
    };
    
    const result = await createBot(newBot);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء الروبوت
    const bot = await getBotById(result.id);
    expect(bot).not.toBeNull();
    expect(bot).toHaveProperty('name', 'روبوت المتابعة');
    expect(bot).toHaveProperty('trigger_type', 'no_activity');
    expect(bot.actions.length).toBe(2);
  });
  
  it('يجب أن يحدث بيانات الروبوت', async () => {
    const updateData = {
      description: 'يرسل رسالة متابعة بعد 5 أيام من آخر تواصل',
      trigger_value: '5'
    };
    
    const result = await updateBot(2, updateData);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث الروبوت
    const bot = await getBotById(2);
    expect(bot.description).toContain('5 أيام');
    expect(bot.trigger_value).toBe('5');
  });
  
  it('يجب أن يبدل حالة الروبوت', async () => {
    const result = await toggleBotStatus(1);
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('is_active', false);
    
    // التحقق من تبديل حالة الروبوت
    const bot = await getBotById(1);
    expect(bot.is_active).toBe(0);
    
    // إعادة تبديل الحالة
    const result2 = await toggleBotStatus(1);
    expect(result2).toHaveProperty('success', true);
    expect(result2).toHaveProperty('is_active', true);
    
    // التحقق من إعادة تبديل حالة الروبوت
    const bot2 = await getBotById(1);
    expect(bot2.is_active).toBe(1);
  });
});
