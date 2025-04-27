import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getCustomers, getCustomerById, createCustomer, updateCustomer, deleteCustomer } from '@/lib/api/customers';

// تهيئة قاعدة البيانات للاختبار
beforeAll(async () => {
  await db.init();
  
  // إنشاء جدول المستخدمين للاختبار
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
  
  // إنشاء جدول العملاء للاختبار
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
  
  // إنشاء جدول جهات الاتصال للاختبار
  await db.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      value TEXT NOT NULL,
      is_primary BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
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
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS contacts');
  await db.query('DROP TABLE IF EXISTS customers');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة العملاء', () => {
  it('يجب أن يجلب جميع العملاء', async () => {
    const customers = await getCustomers();
    expect(customers).toBeInstanceOf(Array);
    expect(customers.length).toBeGreaterThan(0);
    expect(customers[0]).toHaveProperty('email', 'ahmed@example.com');
  });
  
  it('يجب أن يجلب عميل بواسطة المعرف', async () => {
    const customer = await getCustomerById(1);
    expect(customer).not.toBeNull();
    expect(customer).toHaveProperty('email', 'ahmed@example.com');
    expect(customer).toHaveProperty('first_name', 'أحمد');
  });
  
  it('يجب أن ينشئ عميل جديد', async () => {
    const newCustomer = {
      first_name: 'سارة',
      last_name: 'أحمد',
      email: 'sara@example.com',
      phone: '+966 55 987 6543',
      company: 'مؤسسة الإبداع',
      status: 'lead',
      assigned_to: 1
    };
    
    const result = await createCustomer(newCustomer);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء العميل
    const customer = await getCustomerById(result.id);
    expect(customer).not.toBeNull();
    expect(customer).toHaveProperty('email', 'sara@example.com');
  });
  
  it('يجب أن يحدث بيانات العميل', async () => {
    const updateData = {
      company: 'مؤسسة الإبداع المتطورة',
      status: 'customer'
    };
    
    const result = await updateCustomer(2, updateData);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث العميل
    const customer = await getCustomerById(2);
    expect(customer).toHaveProperty('company', 'مؤسسة الإبداع المتطورة');
    expect(customer).toHaveProperty('status', 'customer');
  });
  
  it('يجب أن يحذف العميل', async () => {
    const result = await deleteCustomer(2);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من حذف العميل
    const customer = await getCustomerById(2);
    expect(customer).toBeNull();
  });
});
