// تكوين قاعدة البيانات D1 للنشر
import { Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

// تحديد نوع البيئة (تطوير أو إنتاج)
const isDevelopment = process.env.NODE_ENV !== 'production';

// تكوين الاتصال بقاعدة البيانات
export const db = {
  _db: null,
  
  // تهيئة قاعدة البيانات
  async init() {
    if (this._db) return this._db;
    
    if (isDevelopment) {
      // استخدام SQLite المحلي في بيئة التطوير
      const sqlite = await import('sqlite');
      this._db = await sqlite.open({
        filename: process.env.DB_PATH || './data/crm.db',
        driver: sqlite3.Database
      });
    } else {
      // استخدام Cloudflare D1 في بيئة الإنتاج
      // سيتم التعامل مع هذا تلقائياً من خلال Cloudflare Workers
      this._db = {
        async query(sql, params = []) {
          // في بيئة الإنتاج، سيتم استبدال هذا بالاتصال الفعلي بـ D1
          // هذا مجرد واجهة متوافقة للاختبار
          const { results } = await DB.prepare(sql).bind(...params).all();
          return results;
        },
        async get(sql, params = []) {
          const { results } = await DB.prepare(sql).bind(...params).first();
          return results;
        },
        async run(sql, params = []) {
          return await DB.prepare(sql).bind(...params).run();
        },
        async exec(sql) {
          // تنفيذ عدة استعلامات متتالية
          const statements = sql.split(';').filter(stmt => stmt.trim());
          for (const stmt of statements) {
            if (stmt.trim()) {
              await DB.prepare(stmt).run();
            }
          }
        },
        async close() {
          // لا حاجة لإغلاق اتصال D1
          return;
        }
      };
    }
    
    return this._db;
  },
  
  // تنفيذ استعلام وإرجاع جميع النتائج
  async query(sql, params = []) {
    await this.init();
    if (isDevelopment) {
      return await this._db.all(sql, params);
    } else {
      return await this._db.query(sql, params);
    }
  },
  
  // تنفيذ استعلام وإرجاع النتيجة الأولى فقط
  async get(sql, params = []) {
    await this.init();
    if (isDevelopment) {
      return await this._db.get(sql, params);
    } else {
      return await this._db.get(sql, params);
    }
  },
  
  // تنفيذ استعلام بدون إرجاع نتائج
  async run(sql, params = []) {
    await this.init();
    if (isDevelopment) {
      return await this._db.run(sql, params);
    } else {
      return await this._db.run(sql, params);
    }
  },
  
  // تنفيذ استعلامات متعددة
  async exec(sql) {
    await this.init();
    if (isDevelopment) {
      return await this._db.exec(sql);
    } else {
      return await this._db.exec(sql);
    }
  },
  
  // إغلاق الاتصال بقاعدة البيانات
  async close() {
    if (this._db && isDevelopment) {
      await this._db.close();
      this._db = null;
    }
  }
};

// تطبيق ملفات الترحيل
export async function applyMigrations() {
  await db.init();
  
  // قراءة ملفات الترحيل
  const migrationsDir = path.join(process.cwd(), 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // ترتيب الملفات تصاعدياً
  
  // تنفيذ كل ملف ترحيل
  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    try {
      await db.exec(sql);
      console.log(`تم تطبيق ملف الترحيل: ${file}`);
    } catch (error) {
      console.error(`خطأ في تطبيق ملف الترحيل ${file}:`, error);
      throw error;
    }
  }
  
  console.log('تم تطبيق جميع ملفات الترحيل بنجاح');
}

export default db;
