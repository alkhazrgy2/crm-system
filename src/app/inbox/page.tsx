'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Search, Filter, User } from 'lucide-react'
import Link from 'next/link'

export default function InboxPage() {
  // هذه بيانات تجريبية للمحادثات
  const conversations = [
    {
      id: 1,
      customer: 'أحمد محمد',
      lastMessage: 'شكراً لكم على المتابعة، سأفكر في العرض وأرد عليكم قريباً.',
      time: 'منذ 5 دقائق',
      unread: true,
      channel: 'whatsapp'
    },
    {
      id: 2,
      customer: 'سارة أحمد',
      lastMessage: 'هل يمكنني الحصول على معلومات إضافية عن المنتج؟',
      time: 'منذ 30 دقيقة',
      unread: true,
      channel: 'instagram'
    },
    {
      id: 3,
      customer: 'محمد علي',
      lastMessage: 'تم استلام الطلب، شكراً لكم.',
      time: 'منذ ساعتين',
      unread: false,
      channel: 'email'
    },
    {
      id: 4,
      customer: 'فاطمة حسن',
      lastMessage: 'أحتاج إلى مساعدة في تفعيل الحساب.',
      time: 'منذ 3 ساعات',
      unread: false,
      channel: 'whatsapp'
    },
    {
      id: 5,
      customer: 'خالد عبدالله',
      lastMessage: 'متى سيتم شحن الطلب؟',
      time: 'منذ 5 ساعات',
      unread: false,
      channel: 'instagram'
    }
  ]

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">صندوق الوارد</h1>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* قائمة المحادثات */}
        <div className="w-1/3 border-l overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث في المحادثات..." className="pr-10" />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="px-4 pt-4">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">الكل</TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex-1">واتساب</TabsTrigger>
              <TabsTrigger value="instagram" className="flex-1">انستغرام</TabsTrigger>
              <TabsTrigger value="email" className="flex-1">البريد</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm text-muted-foreground">5 محادثات</span>
            <Button variant="ghost" size="sm">
              <Filter className="h-4 w-4 ml-2" />
              تصفية
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id} 
                className={`p-4 border-b hover:bg-muted/50 cursor-pointer ${conversation.unread ? 'bg-muted/30 font-medium' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium">{conversation.customer}</span>
                  <span className="text-xs text-muted-foreground">{conversation.time}</span>
                </div>
                <div className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</div>
                <div className="flex items-center mt-2">
                  <div className={`h-2 w-2 rounded-full mr-2 ${
                    conversation.channel === 'whatsapp' ? 'bg-green-500' : 
                    conversation.channel === 'instagram' ? 'bg-purple-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-xs capitalize">{conversation.channel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* منطقة المحادثة */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-medium mb-2">لم يتم تحديد محادثة</h2>
              <p className="text-muted-foreground mb-4">اختر محادثة من القائمة للبدء</p>
            </div>
          </div>
        </div>
        
        {/* معلومات العميل */}
        <div className="w-1/4 border-r overflow-y-auto">
          <div className="p-6 text-center border-b">
            <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-1">معلومات العميل</h2>
            <p className="text-muted-foreground">اختر محادثة لعرض معلومات العميل</p>
          </div>
        </div>
      </div>
    </div>
  )
}
