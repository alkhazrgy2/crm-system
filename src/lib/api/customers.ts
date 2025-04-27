import { db } from '@/lib/db';

export async function getCustomers(filters?: {
  status?: string;
  assignedTo?: number;
  search?: string;
}) {
  try {
    let query = `
      SELECT 
        c.id, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.phone, 
        c.company, 
        c.position, 
        c.avatar, 
        c.status, 
        c.source, 
        c.assigned_to,
        c.created_at,
        c.last_contact,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.status) {
        query += ' AND c.status = ?';
        queryParams.push(filters.status);
      }
      
      if (filters.assignedTo) {
        query += ' AND c.assigned_to = ?';
        queryParams.push(filters.assignedTo);
      }
      
      if (filters.search) {
        query += ` AND (
          c.first_name LIKE ? OR 
          c.last_name LIKE ? OR 
          c.email LIKE ? OR 
          c.phone LIKE ? OR 
          c.company LIKE ?
        )`;
        const searchTerm = `%${filters.search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
    }
    
    query += ' ORDER BY c.created_at DESC';
    
    const customers = await db.query(query, queryParams);
    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw new Error('فشل في جلب بيانات العملاء');
  }
}

export async function getCustomerById(id: number) {
  try {
    const customer = await db.query(`
      SELECT 
        c.id, 
        c.first_name, 
        c.last_name, 
        c.email, 
        c.phone, 
        c.company, 
        c.position, 
        c.avatar, 
        c.status, 
        c.source, 
        c.assigned_to,
        c.tags,
        c.created_at,
        c.updated_at,
        c.last_contact,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ?
    `, [id]);
    
    if (customer.length === 0) {
      return null;
    }
    
    // جلب جهات الاتصال للعميل
    const contacts = await db.query(
      'SELECT id, type, value, is_primary FROM contacts WHERE customer_id = ?',
      [id]
    );
    
    // جلب المحادثات للعميل
    const conversations = await db.query(`
      SELECT 
        c.id, 
        c.channel, 
        c.status, 
        c.subject, 
        c.assigned_to,
        c.created_at,
        c.last_message_at,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM conversations c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.customer_id = ?
      ORDER BY c.last_message_at DESC
    `, [id]);
    
    // جلب الصفقات للعميل
    const deals = await db.query(`
      SELECT 
        d.id, 
        d.title, 
        d.value, 
        d.currency, 
        d.status,
        d.created_at,
        p.name as pipeline_name,
        ps.name as stage_name,
        ps.color as stage_color
      FROM deals d
      JOIN pipelines p ON d.pipeline_id = p.id
      JOIN pipeline_stages ps ON d.stage_id = ps.id
      WHERE d.customer_id = ?
      ORDER BY d.created_at DESC
    `, [id]);
    
    // جلب المهام للعميل
    const tasks = await db.query(`
      SELECT 
        t.id, 
        t.title, 
        t.type, 
        t.status, 
        t.priority,
        t.due_date,
        t.assigned_to,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.related_type = 'customer' AND t.related_id = ?
      ORDER BY t.due_date ASC
    `, [id]);
    
    return {
      ...customer[0],
      contacts,
      conversations,
      deals,
      tasks
    };
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw new Error('فشل في جلب بيانات العميل');
  }
}

export async function createCustomer(customerData: {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  status?: string;
  source?: string;
  assigned_to?: number;
  tags?: string;
}) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      company,
      position,
      avatar,
      status,
      source,
      assigned_to,
      tags
    } = customerData;
    
    const result = await db.query(
      `INSERT INTO customers (
        first_name, last_name, email, phone, company, position, 
        avatar, status, source, assigned_to, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name, 
        last_name, 
        email || null, 
        phone || null, 
        company || null, 
        position || null,
        avatar || null, 
        status || 'lead', 
        source || null, 
        assigned_to || null, 
        tags || null
      ]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

export async function updateCustomer(id: number, customerData: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  avatar?: string;
  status?: string;
  source?: string;
  assigned_to?: number;
  tags?: string;
}) {
  try {
    // التحقق من وجود العميل
    const existingCustomer = await db.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existingCustomer.length === 0) {
      throw new Error('العميل غير موجود');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(customerData)) {
      if (value !== undefined) {
        updateFields.push(`${key} = ?`);
        updateValues.push(value);
      }
    }
    
    if (updateFields.length === 0) {
      return { success: true }; // لا يوجد شيء للتحديث
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    // تنفيذ استعلام التحديث
    await db.query(
      `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
}

export async function deleteCustomer(id: number) {
  try {
    // التحقق من وجود العميل
    const existingCustomer = await db.query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existingCustomer.length === 0) {
      throw new Error('العميل غير موجود');
    }
    
    // حذف جهات الاتصال المرتبطة بالعميل
    await db.query('DELETE FROM contacts WHERE customer_id = ?', [id]);
    
    // حذف المحادثات والرسائل المرتبطة بالعميل
    const conversations = await db.query('SELECT id FROM conversations WHERE customer_id = ?', [id]);
    for (const conversation of conversations) {
      await db.query('DELETE FROM messages WHERE conversation_id = ?', [conversation.id]);
      await db.query('DELETE FROM message_reads WHERE message_id IN (SELECT id FROM messages WHERE conversation_id = ?)', [conversation.id]);
    }
    await db.query('DELETE FROM conversations WHERE customer_id = ?', [id]);
    
    // حذف الصفقات المرتبطة بالعميل
    const deals = await db.query('SELECT id FROM deals WHERE customer_id = ?', [id]);
    for (const deal of deals) {
      await db.query('DELETE FROM deal_products WHERE deal_id = ?', [deal.id]);
    }
    await db.query('DELETE FROM deals WHERE customer_id = ?', [id]);
    
    // حذف المهام المرتبطة بالعميل
    await db.query('DELETE FROM tasks WHERE related_type = "customer" AND related_id = ?', [id]);
    
    // حذف العميل
    await db.query('DELETE FROM customers WHERE id = ?', [id]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
}

export async function updateCustomerLastContact(id: number) {
  try {
    await db.query(
      'UPDATE customers SET last_contact = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating last contact for customer ${id}:`, error);
    throw error;
  }
}

export async function addCustomerContact(customerId: number, contactData: {
  type: string;
  value: string;
  is_primary?: boolean;
}) {
  try {
    const { type, value, is_primary } = contactData;
    
    // التحقق من وجود العميل
    const existingCustomer = await db.query('SELECT id FROM customers WHERE id = ?', [customerId]);
    if (existingCustomer.length === 0) {
      throw new Error('العميل غير موجود');
    }
    
    // إذا كانت جهة الاتصال الجديدة هي الرئيسية، قم بإلغاء تعيين الجهات الأخرى من نفس النوع كرئيسية
    if (is_primary) {
      await db.query(
        'UPDATE contacts SET is_primary = 0 WHERE customer_id = ? AND type = ?',
        [customerId, type]
      );
    }
    
    // إضافة جهة الاتصال الجديدة
    const result = await db.query(
      'INSERT INTO contacts (customer_id, type, value, is_primary) VALUES (?, ?, ?, ?)',
      [customerId, type, value, is_primary ? 1 : 0]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error(`Error adding contact for customer ${customerId}:`, error);
    throw error;
  }
}

export async function deleteCustomerContact(contactId: number) {
  try {
    // التحقق من وجود جهة الاتصال
    const existingContact = await db.query('SELECT id FROM contacts WHERE id = ?', [contactId]);
    if (existingContact.length === 0) {
      throw new Error('جهة الاتصال غير موجودة');
    }
    
    // حذف جهة الاتصال
    await db.query('DELETE FROM contacts WHERE id = ?', [contactId]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting contact ${contactId}:`, error);
    throw error;
  }
}
