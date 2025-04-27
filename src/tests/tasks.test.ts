import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getTasks, getTaskById, createTask, updateTask, completeTask, reopenTask } from '@/lib/api/tasks';

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
    INSERT INTO tasks (title, description, type, status, priority, due_date, assigned_to, related_type, related_id, created_by)
    VALUES 
    ('متابعة العميل', 'متابعة العميل بخصوص العرض المقدم', 'call', 'pending', 'high', '2025-04-30', 1, 'customer', 1, 1)
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS tasks');
  await db.query('DROP TABLE IF EXISTS customers');
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة المهام', () => {
  it('يجب أن يجلب جميع المهام', async () => {
    const tasks = await getTasks();
    expect(tasks).toBeInstanceOf(Array);
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toHaveProperty('title', 'متابعة العميل');
    expect(tasks[0]).toHaveProperty('priority', 'high');
  });
  
  it('يجب أن يجلب مهمة بواسطة المعرف', async () => {
    const task = await getTaskById(1);
    expect(task).not.toBeNull();
    expect(task).toHaveProperty('title', 'متابعة العميل');
    expect(task).toHaveProperty('type', 'call');
    expect(task).toHaveProperty('related_type', 'customer');
    expect(task).toHaveProperty('related_id', 1);
  });
  
  it('يجب أن ينشئ مهمة جديدة', async () => {
    const newTask = {
      title: 'إرسال عرض سعر',
      description: 'إرسال عرض سعر للخدمات المطلوبة',
      type: 'email',
      priority: 'medium',
      due_date: '2025-05-05',
      assigned_to: 1,
      related_type: 'customer',
      related_id: 1,
      created_by: 1
    };
    
    const result = await createTask(newTask);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء المهمة
    const task = await getTaskById(result.id);
    expect(task).not.toBeNull();
    expect(task).toHaveProperty('title', 'إرسال عرض سعر');
    expect(task).toHaveProperty('type', 'email');
  });
  
  it('يجب أن يحدث بيانات المهمة', async () => {
    const updateData = {
      priority: 'high',
      due_date: '2025-05-03'
    };
    
    const result = await updateTask(2, updateData);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث المهمة
    const task = await getTaskById(2);
    expect(task).toHaveProperty('priority', 'high');
    expect(task).toHaveProperty('due_date', '2025-05-03');
  });
  
  it('يجب أن يكمل المهمة', async () => {
    const result = await completeTask(1);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من إكمال المهمة
    const task = await getTaskById(1);
    expect(task).toHaveProperty('status', 'completed');
    expect(task).toHaveProperty('completed_at');
  });
  
  it('يجب أن يعيد فتح المهمة', async () => {
    const result = await reopenTask(1);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من إعادة فتح المهمة
    const task = await getTaskById(1);
    expect(task).toHaveProperty('status', 'pending');
    expect(task.completed_at).toBeNull();
  });
});
