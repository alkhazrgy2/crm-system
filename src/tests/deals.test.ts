import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getPipelines, getPipelineById, createPipeline, getDeals, getDealById, createDeal, updateDealStage, closeDeal } from '@/lib/api/deals';

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
    CREATE TABLE IF NOT EXISTS deal_products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id)
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
    INSERT INTO deals (title, customer_id, pipeline_id, stage_id, value, assigned_to, status)
    VALUES 
    ('مشروع تطوير موقع إلكتروني', 1, 1, 1, 15000, 1, 'open')
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS deal_products');
  await db.query('DROP TABLE IF EXISTS deals');
  await db.query('DROP TABLE IF EXISTS pipeline_stages');
  await db.query('DROP TABLE IF EXISTS pipelines');
  await db.query('DROP TABLE IF EXISTS customers');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة مسارات المبيعات والصفقات', () => {
  it('يجب أن يجلب جميع مسارات المبيعات', async () => {
    const pipelines = await getPipelines();
    expect(pipelines).toBeInstanceOf(Array);
    expect(pipelines.length).toBeGreaterThan(0);
    expect(pipelines[0]).toHaveProperty('name', 'مسار المبيعات الرئيسي');
    expect(pipelines[0]).toHaveProperty('stages');
    expect(pipelines[0].stages).toBeInstanceOf(Array);
    expect(pipelines[0].stages.length).toBe(5);
  });
  
  it('يجب أن يجلب مسار مبيعات بواسطة المعرف', async () => {
    const pipeline = await getPipelineById(1);
    expect(pipeline).not.toBeNull();
    expect(pipeline).toHaveProperty('name', 'مسار المبيعات الرئيسي');
    expect(pipeline).toHaveProperty('stages');
    expect(pipeline.stages).toBeInstanceOf(Array);
    expect(pipeline.stages.length).toBe(5);
  });
  
  it('يجب أن ينشئ مسار مبيعات جديد', async () => {
    const newPipeline = {
      name: 'مسار مبيعات المنتجات',
      description: 'مسار خاص بمبيعات المنتجات',
      created_by: 1,
      stages: [
        { name: 'اتصال أولي', color: '#3498db' },
        { name: 'عرض المنتج', color: '#9b59b6' },
        { name: 'تقديم عرض سعر', color: '#e74c3c' },
        { name: 'التفاوض', color: '#f39c12' },
        { name: 'إتمام البيع', color: '#2ecc71' }
      ]
    };
    
    const result = await createPipeline(newPipeline);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء المسار
    const pipeline = await getPipelineById(result.id);
    expect(pipeline).not.toBeNull();
    expect(pipeline).toHaveProperty('name', 'مسار مبيعات المنتجات');
    expect(pipeline.stages.length).toBe(5);
  });
  
  it('يجب أن يجلب جميع الصفقات', async () => {
    const deals = await getDeals();
    expect(deals).toBeInstanceOf(Array);
    expect(deals.length).toBeGreaterThan(0);
    expect(deals[0]).toHaveProperty('title', 'مشروع تطوير موقع إلكتروني');
  });
  
  it('يجب أن يجلب صفقة بواسطة المعرف', async () => {
    const deal = await getDealById(1);
    expect(deal).not.toBeNull();
    expect(deal).toHaveProperty('title', 'مشروع تطوير موقع إلكتروني');
    expect(deal).toHaveProperty('value', 15000);
  });
  
  it('يجب أن ينشئ صفقة جديدة', async () => {
    const newDeal = {
      title: 'خدمات استضافة سحابية',
      customer_id: 1,
      pipeline_id: 1,
      stage_id: 2,
      value: 8000,
      assigned_to: 1,
      probability: 70,
      expected_close_date: '2025-05-15'
    };
    
    const result = await createDeal(newDeal);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء الصفقة
    const deal = await getDealById(result.id);
    expect(deal).not.toBeNull();
    expect(deal).toHaveProperty('title', 'خدمات استضافة سحابية');
    expect(deal).toHaveProperty('value', 8000);
  });
  
  it('يجب أن يحدث مرحلة الصفقة', async () => {
    const result = await updateDealStage(1, 3);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث مرحلة الصفقة
    const deal = await getDealById(1);
    expect(deal).toHaveProperty('stage_id', 3);
    expect(deal).toHaveProperty('stage_name', 'تقديم عرض');
  });
  
  it('يجب أن يغلق الصفقة', async () => {
    const result = await closeDeal(1, 'won');
    expect(result).toHaveProperty('success', true);
    
    // التحقق من إغلاق الصفقة
    const deal = await getDealById(1);
    expect(deal).toHaveProperty('status', 'won');
    expect(deal).toHaveProperty('actual_close_date');
  });
});
