import { db } from '@/lib/db';

export async function getConversations(filters?: {
  customerId?: number;
  channel?: string;
  status?: string;
  assignedTo?: number;
}) {
  try {
    let query = `
      SELECT 
        c.id, 
        c.customer_id, 
        c.channel, 
        c.status, 
        c.subject, 
        c.assigned_to,
        c.created_at,
        c.last_message_at,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.avatar as customer_avatar,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM conversations c
      JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    if (filters) {
      if (filters.customerId) {
        query += ' AND c.customer_id = ?';
        queryParams.push(filters.customerId);
      }
      
      if (filters.channel) {
        query += ' AND c.channel = ?';
        queryParams.push(filters.channel);
      }
      
      if (filters.status) {
        query += ' AND c.status = ?';
        queryParams.push(filters.status);
      }
      
      if (filters.assignedTo) {
        query += ' AND c.assigned_to = ?';
        queryParams.push(filters.assignedTo);
      }
    }
    
    query += ' ORDER BY c.last_message_at DESC';
    
    const conversations = await db.query(query, queryParams);
    
    // جلب آخر رسالة لكل محادثة
    for (const conversation of conversations) {
      const lastMessage = await db.query(`
        SELECT 
          m.id,
          m.content,
          m.sender_type,
          m.sender_id,
          m.created_at
        FROM messages m
        WHERE m.conversation_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1
      `, [conversation.id]);
      
      conversation.last_message = lastMessage[0] || null;
      
      // جلب عدد الرسائل غير المقروءة
      const unreadCount = await db.query(`
        SELECT COUNT(*) as count
        FROM messages m
        LEFT JOIN message_reads mr ON m.id = mr.message_id
        WHERE m.conversation_id = ? AND m.sender_type = 'customer' AND mr.message_id IS NULL
      `, [conversation.id]);
      
      conversation.unread_count = unreadCount[0].count;
    }
    
    return conversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw new Error('فشل في جلب بيانات المحادثات');
  }
}

export async function getConversationById(id: number) {
  try {
    const conversation = await db.query(`
      SELECT 
        c.id, 
        c.customer_id, 
        c.channel, 
        c.status, 
        c.subject, 
        c.assigned_to,
        c.created_at,
        c.last_message_at,
        cu.first_name as customer_first_name,
        cu.last_name as customer_last_name,
        cu.email as customer_email,
        cu.phone as customer_phone,
        cu.company as customer_company,
        cu.avatar as customer_avatar,
        u.first_name as assigned_first_name,
        u.last_name as assigned_last_name
      FROM conversations c
      JOIN customers cu ON c.customer_id = cu.id
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ?
    `, [id]);
    
    if (conversation.length === 0) {
      return null;
    }
    
    // جلب الرسائل للمحادثة
    const messages = await db.query(`
      SELECT 
        m.id,
        m.sender_type,
        m.sender_id,
        m.content,
        m.attachments,
        m.created_at,
        CASE 
          WHEN m.sender_type = 'user' THEN u.first_name || ' ' || u.last_name
          WHEN m.sender_type = 'customer' THEN cu.first_name || ' ' || cu.last_name
          ELSE 'النظام'
        END as sender_name,
        CASE 
          WHEN m.sender_type = 'user' THEN u.avatar
          WHEN m.sender_type = 'customer' THEN cu.avatar
          ELSE NULL
        END as sender_avatar
      FROM messages m
      LEFT JOIN users u ON m.sender_type = 'user' AND m.sender_id = u.id
      LEFT JOIN customers cu ON m.sender_type = 'customer' AND m.sender_id = cu.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `, [id]);
    
    // تحديث حالة قراءة الرسائل
    for (const message of messages) {
      if (message.sender_type === 'customer') {
        await db.query(`
          INSERT OR IGNORE INTO message_reads (message_id, user_id, read_at)
          VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [message.id, conversation[0].assigned_to]);
      }
    }
    
    return {
      ...conversation[0],
      messages
    };
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    throw new Error('فشل في جلب بيانات المحادثة');
  }
}

export async function createConversation(conversationData: {
  customer_id: number;
  channel: string;
  subject?: string;
  assigned_to?: number;
  initial_message?: string;
}) {
  try {
    const { customer_id, channel, subject, assigned_to, initial_message } = conversationData;
    
    // التحقق من وجود العميل
    const existingCustomer = await db.query('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (existingCustomer.length === 0) {
      throw new Error('العميل غير موجود');
    }
    
    // إنشاء المحادثة الجديدة
    const result = await db.query(
      `INSERT INTO conversations (
        customer_id, channel, subject, assigned_to, last_message_at
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [customer_id, channel, subject || null, assigned_to || null]
    );
    
    const conversationId = result.lastID;
    
    // إذا كانت هناك رسالة أولية، قم بإضافتها
    if (initial_message) {
      await db.query(
        `INSERT INTO messages (
          conversation_id, sender_type, sender_id, content, created_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [conversationId, 'user', assigned_to || 1, initial_message]
      );
    }
    
    // تحديث آخر تواصل مع العميل
    await db.query(
      'UPDATE customers SET last_contact = CURRENT_TIMESTAMP WHERE id = ?',
      [customer_id]
    );
    
    return { id: conversationId };
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
}

export async function updateConversation(id: number, conversationData: {
  status?: string;
  subject?: string;
  assigned_to?: number;
}) {
  try {
    // التحقق من وجود المحادثة
    const existingConversation = await db.query('SELECT id FROM conversations WHERE id = ?', [id]);
    if (existingConversation.length === 0) {
      throw new Error('المحادثة غير موجودة');
    }
    
    // إنشاء استعلام التحديث ديناميكياً
    const updateFields = [];
    const updateValues = [];
    
    for (const [key, value] of Object.entries(conversationData)) {
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
      `UPDATE conversations SET ${updateFields.join(', ')} WHERE id = ?`,
      [...updateValues, id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating conversation ${id}:`, error);
    throw error;
  }
}

export async function addMessage(conversationId: number, messageData: {
  sender_type: string;
  sender_id: number;
  content: string;
  attachments?: string;
}) {
  try {
    const { sender_type, sender_id, content, attachments } = messageData;
    
    // التحقق من وجود المحادثة
    const existingConversation = await db.query('SELECT customer_id FROM conversations WHERE id = ?', [conversationId]);
    if (existingConversation.length === 0) {
      throw new Error('المحادثة غير موجودة');
    }
    
    // إضافة الرسالة الجديدة
    const result = await db.query(
      `INSERT INTO messages (
        conversation_id, sender_type, sender_id, content, attachments, created_at
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [conversationId, sender_type, sender_id, content, attachments || null]
    );
    
    // تحديث وقت آخر رسالة في المحادثة
    await db.query(
      'UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?',
      [conversationId]
    );
    
    // تحديث آخر تواصل مع العميل
    await db.query(
      'UPDATE customers SET last_contact = CURRENT_TIMESTAMP WHERE id = ?',
      [existingConversation[0].customer_id]
    );
    
    return { id: result.lastID };
  } catch (error) {
    console.error(`Error adding message to conversation ${conversationId}:`, error);
    throw error;
  }
}

export async function markMessageAsRead(messageId: number, userId: number) {
  try {
    await db.query(`
      INSERT OR IGNORE INTO message_reads (message_id, user_id, read_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `, [messageId, userId]);
    
    return { success: true };
  } catch (error) {
    console.error(`Error marking message ${messageId} as read:`, error);
    throw error;
  }
}

export async function closeConversation(id: number) {
  try {
    await db.query(
      'UPDATE conversations SET status = "closed", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error closing conversation ${id}:`, error);
    throw error;
  }
}

export async function reopenConversation(id: number) {
  try {
    await db.query(
      'UPDATE conversations SET status = "active", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error reopening conversation ${id}:`, error);
    throw error;
  }
}
