import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getAnalytics, getSalesSummary, getActivitySummary, getDashboardSummary, saveAnalytics } from '@/lib/api/analytics';

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
    CREATE TABLE IF NOT EXISTS pipelines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS pipeline_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pipeline_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      order_num INTEGER NOT NULL,
      color TEXT,
      FOREIGN KEY (pipeline_id) REFERENCES pipelines(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      customer_id INTEGER NOT NULL,
      pipeline_id INTEGER NOT NULL,
      stage_id INTEGER NOT NULL,
      value REAL,
      currency TEXT DEFAULT 'SAR',
      assigned_to INTEGER,
      probability REAL,
      expected_close_date DATE,
      actual_close_date DATE,
      status TEXT DEFAULT 'open',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id),
      FOREIGN KEY (pipeline_id) REFERENCES pipelines(id),
      FOREIGN KEY (stage_id) REFERENCES pipeline_stages(id),
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
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      due_date DATE,
      assigned_to INTEGER,
      related_type TEXT,
      related_id INTEGER,
      completed_at TIMESTAMP,
      created_by INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);
  
  await db.query(`
    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      period TEXT NOT NULL,
      date TEXT NOT NULL,
      metrics TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // إضافة بيانات تجريبية
  await db.query(`
    INSERT INTO users (email, password, first_name, last_name, role, status)
    VALUES 
    ('test@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'مستخدم', 'اختبار', 'admin', 'active')
  `);
  
  await db.query(`
    INSERT INTO customers (first_name, last_name, email, phone, company, status, assigned_to, created_at)
    VALUES 
    ('أحمد', 'محمد', 'ahmed@example.com', '+966 50 123 4567', 'شركة التقنية', 'customer', 1, '2025-04-01 10:00:00'),
    ('سارة', 'أحمد', 'sara@example.com', '+966 55 987 6543', 'مؤسسة الإبداع', 'lead', 1, '2025-04-10 14:30:00')
  `);
  
  await db.query(`
    INSERT INTO pipelines (name, description, created_by)
    VALUES 
    ('مسار المبيعات الرئيسي', 'المسار الافتراضي لإدارة صفقات المبيعات', 1)
  `);
  
  await db.query(`
    INSERT INTO pipeline_stages (pipeline_id, name, order_num, color)
    VALUES 
    (1, 'جهات اتصال جديدة', 1, '#3498db'),
    (1, 'اجتماع أولي', 2, '#9b59b6'),
    (1, 'تقديم عرض', 3, '#e74c3c'),
    (1, 'مفاوضات', 4, '#f39c12'),
    (1, 'صفقة مغلقة', 5, '#2ecc71')
  `);
  
  await db.query(`
    INSERT INTO deals (title, customer_id, pipeline_id, stage_id, value, assigned_to, status, actual_close_date, created_at)
    VALUES 
    ('مشروع تطوير موقع إلكتروني', 1, 1, 5, 15000, 1, 'won', '2025-04-15', '2025-04-01 09:00:00'),
    ('خدمات استضافة سحابية', 1, 1, 3, 8000, 1, 'open', NULL, '2025-04-05 11:30:00'),
    ('تطبيق جوال', 2, 1, 2, 25000, 1, 'open', NULL, '2025-04-10 14:00:00')
  `);
  
  await db.query(`
    INSERT INTO conversations (customer_id, channel, status, assigned_to, created_at, last_message_at)
    VALUES 
    (1, 'whatsapp', 'active', 1, '2025-04-01 10:30:00', '2025-04-01 10:35:00'),
    (2, 'email', 'active', 1, '2025-04-10 15:00:00', '2025-04-10 15:10:00')
  `);
  
  await db.query(`
    INSERT INTO messages (conversation_id, sender_type, sender_id, content, created_at)
    VALUES 
    (1, 'customer', 1, 'مرحباً، أود الاستفسار عن خدماتكم', '2025-04-01 10:30:00'),
    (1, 'user', 1, 'مرحباً بك! كيف يمكنني مساعدتك؟', '2025-04-01 10:35:00'),
    (2, 'customer', 2, 'أرغب في معرفة المزيد عن خدمات تطوير التطبيقات', '2025-04-10 15:00:00'),
    (2, 'user', 1, 'بالتأكيد، يسعدني تقديم المعلومات اللازمة', '2025-04-10 15:10:00')
  `);
  
  await db.query(`
    INSERT INTO tasks (title, type, status, priority, due_date, assigned_to, related_type, related_id, created_by, created_at, completed_at)
    VALUES 
    ('متابعة العميل', 'call', 'completed', 'high', '2025-04-02', 1, 'customer', 1, 1, '2025-04-01 11:00:00', '2025-04-02 14:00:00'),
    ('إرسال عرض سعر', 'email', 'pending', 'medium', '2025-04-12', 1, 'customer', 2, 1, '2025-04-10 16:00:00', NULL)
  `);
  
  await db.query(`
    INSERT INTO analytics (type, period, date, metrics, created_at)
    VALUES 
    ('sales', 'month', '2025-04', '{"total_deals":3,"won_deals":1,"total_value":48000,"won_value":15000}', '2025-04-20 00:00:00'),
    ('activity', 'week', '2025-04-2', '{"new_customers":2,"messages_sent":2,"messages_received":2,"tasks_created":2,"tasks_completed":1}', '2025-04-20 00:00:00')
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS analytics');
  await db.query('DROP TABLE IF EXISTS tasks');
  await db.query('DROP TABLE IF EXISTS messages');
  await db.query('DROP TABLE IF EXISTS conversations');
  await db.query('DROP TABLE IF EXISTS deals');
  await db.query('DROP TABLE IF EXISTS pipeline_stages');
  await db.query('DROP TABLE IF EXISTS pipelines');
  await db.query('DROP TABLE IF EXISTS customers');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة الإحصائيات', () => {
  it('يجب أن يجلب جميع الإحصائيات', async () => {
    const analytics = await getAnalytics();
    expect(analytics).toBeInstanceOf(Array);
    expect(analytics.length).toBeGreaterThan(0);
    expect(analytics[0]).toHaveProperty('type');
    expect(analytics[0]).toHaveProperty('metrics');
    expect(analytics[0].metrics).toBeInstanceOf(Object);
  });
  
  it('يجب أن يجلب الإحصائيات حسب النوع', async () => {
    const salesAnalytics = await getAnalytics({ type: 'sales' });
    expect(salesAnalytics).toBeInstanceOf(Array);
    expect(salesAnalytics.length).toBeGreaterThan(0);
    expect(salesAnalytics[0]).toHaveProperty('type', 'sales');
    expect(salesAnalytics[0].metrics).toHaveProperty('total_deals');
  });
  
  it('يجب أن يجلب ملخص المبيعات', async () => {
    const salesSummary = await getSalesSummary();
    expect(salesSummary).toHaveProperty('salesByPeriod');
    expect(salesSummary).toHaveProperty('salesByStage');
    expect(salesSummary).toHaveProperty('teamPerformance');
    expect(salesSummary.salesByPeriod).toBeInstanceOf(Array);
    expect(salesSummary.salesByStage).toBeInstanceOf(Array);
    expect(salesSummary.teamPerformance).toBeInstanceOf(Array);
  });
  
  it('يجب أن يجلب ملخص النشاط', async () => {
    const activitySummary = await getActivitySummary();
    expect(activitySummary).toHaveProperty('messageActivity');
    expect(activitySummary).toHaveProperty('taskActivity');
    expect(activitySummary).toHaveProperty('newCustomers');
    expect(activitySummary.messageActivity).toBeInstanceOf(Array);
    expect(activitySummary.taskActivity).toBeInstanceOf(Array);
    expect(activitySummary.newCustomers).toBeInstanceOf(Array);
  });
  
  it('يجب أن يجلب ملخص لوحة التحكم', async () => {
    const dashboardSummary = await getDashboardSummary();
    expect(dashboardSummary).toHaveProperty('customersCount');
    expect(dashboardSummary).toHaveProperty('dealsCount');
    expect(dashboardSummary).toHaveProperty('conversationsCount');
    expect(dashboardSummary).toHaveProperty('tasksCount');
    expect(dashboardSummary).toHaveProperty('recentDeals');
    expect(dashboardSummary).toHaveProperty('upcomingTasks');
    expect(dashboardSummary.recentDeals).toBeInstanceOf(Array);
    expect(dashboardSummary.upcomingTasks).toBeInstanceOf(Array);
  });
  
  it('يجب أن يحفظ إحصائيات جديدة', async () => {
    const newAnalytics = {
      type: 'performance',
      period: 'day',
      date: '2025-04-25',
      metrics: {
        response_time_avg: 15,
        messages_per_user: 25,
        deals_closed: 2
      }
    };
    
    const result = await saveAnalytics(newAnalytics);
    expect(result).toHaveProperty('id');
    
    // التحقق من حفظ الإحصائيات
    const analytics = await getAnalytics({ type: 'performance' });
    expect(analytics).toBeInstanceOf(Array);
    expect(analytics.length).toBeGreaterThan(0);
    expect(analytics[0]).toHaveProperty('type', 'performance');
    expect(analytics[0]).toHaveProperty('date', '2025-04-25');
    expect(analytics[0].metrics).toHaveProperty('response_time_avg', 15);
  });
});
