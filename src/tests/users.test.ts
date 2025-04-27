import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '@/lib/api/users';

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
  
  // إضافة بيانات تجريبية
  await db.query(`
    INSERT INTO users (email, password, first_name, last_name, role, status)
    VALUES 
    ('test@example.com', '$2b$10$X7PVFv1Aqz3q8KzK5K9kKOH8KJ8.f8U4R.ghbP8xjJ9jvjY6jQYjy', 'مستخدم', 'اختبار', 'admin', 'active')
  `);
});

// تنظيف قاعدة البيانات بعد الاختبار
afterAll(async () => {
  await db.query('DROP TABLE IF EXISTS users');
  await db.close();
});

describe('اختبار وحدة المستخدمين', () => {
  it('يجب أن يجلب جميع المستخدمين', async () => {
    const users = await getUsers();
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('email', 'test@example.com');
  });
  
  it('يجب أن يجلب مستخدم بواسطة المعرف', async () => {
    const user = await getUserById(1);
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('email', 'test@example.com');
    expect(user).toHaveProperty('first_name', 'مستخدم');
  });
  
  it('يجب أن ينشئ مستخدم جديد', async () => {
    const newUser = {
      email: 'new@example.com',
      password: 'password123',
      first_name: 'جديد',
      last_name: 'مستخدم',
      role: 'agent'
    };
    
    const result = await createUser(newUser);
    expect(result).toHaveProperty('id');
    
    // التحقق من إنشاء المستخدم
    const user = await getUserById(result.id);
    expect(user).not.toBeNull();
    expect(user).toHaveProperty('email', 'new@example.com');
  });
  
  it('يجب أن يحدث بيانات المستخدم', async () => {
    const updateData = {
      first_name: 'محدث',
      last_name: 'مستخدم'
    };
    
    const result = await updateUser(2, updateData);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من تحديث المستخدم
    const user = await getUserById(2);
    expect(user).toHaveProperty('first_name', 'محدث');
    expect(user).toHaveProperty('last_name', 'مستخدم');
  });
  
  it('يجب أن يحذف المستخدم', async () => {
    const result = await deleteUser(2);
    expect(result).toHaveProperty('success', true);
    
    // التحقق من حذف المستخدم
    const user = await getUserById(2);
    expect(user).toBeNull();
  });
  
  it('يجب أن يفشل عند إنشاء مستخدم بنفس البريد الإلكتروني', async () => {
    const duplicateUser = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'مكرر',
      last_name: 'مستخدم',
      role: 'agent'
    };
    
    await expect(createUser(duplicateUser)).rejects.toThrow();
  });
});
