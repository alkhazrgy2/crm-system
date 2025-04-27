import { db } from '@/lib/db';

export async function getUsers() {
  try {
    const users = await db.query('SELECT id, email, first_name, last_name, role, avatar, status FROM users');
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('فشل في جلب بيانات المستخدمين');
  }
}

export async function getUserById(id: number) {
  try {
    const user = await db.query('SELECT id, email, first_name, last_name, role, avatar, status FROM users WHERE id = ?', [id]);
    return user[0] || null;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw new Error('فشل في جلب بيانات المستخدم');
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
}) {
  try {
    const { email, password, first_name, last_name, role, avatar } = userData;
    
    // التحقق من عدم وجود مستخدم بنفس البريد الإلكتروني
    const existingUser = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      throw new Error('البريد الإلكتروني مستخدم بالفعل');
    }
    
    // إنشاء المستخدم الجديد
    const result = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, first_name, last_name, role, avatar || null]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUser(id: number, userData: {
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  avatar?: string;
  status?: string;
}) {
  try {
    const { email, first_name, last_name, role, avatar, status } = userData;
    
    // التحقق من وجود المستخدم
    const existingUser = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      throw new Error('المستخدم غير موجود');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    let updateFields = [];
    let updateValues = [];
    
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    
    if (first_name !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(first_name);
    }
    
    if (last_name !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(last_name);
    }
    
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    
    if (status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // تنفيذ استعلام التحديث
    await db.query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
}

export async function updateUserPassword(id: number, newPassword: string) {
  try {
    // التحقق من وجود المستخدم
    const existingUser = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      throw new Error('المستخدم غير موجود');
    }
    
    // تحديث كلمة المرور
    await db.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPassword, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating password for user ${id}:`, error);
    throw error;
  }
}

export async function deleteUser(id: number) {
  try {
    // التحقق من وجود المستخدم
    const existingUser = await db.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existingUser.length === 0) {
      throw new Error('المستخدم غير موجود');
    }
    
    // حذف المستخدم
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
}

export async function updateUserLastLogin(id: number) {
  try {
    await db.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating last login for user ${id}:`, error);
    throw error;
  }
}
