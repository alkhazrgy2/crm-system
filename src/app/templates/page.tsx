'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, Plus, MessageSquare, Code } from 'lucide-react'
import Link from 'next/link'

export default function TemplatesPage() {
  // بيانات تجريبية للقوالب
  const templates = [
    {
      id: 1,
      name: 'ترحيب بالعميل الجديد',
      type: 'message',
      content: 'مرحباً {{customer_name}}، شكراً لتواصلك معنا. يسعدنا خدمتك ومساعدتك في {{service_type}}. كيف يمكننا مساعدتك اليوم؟',
      createdBy: 'محمد أحمد',
      createdAt: '2025-04-10',
      usageCount: 45
    },
    {
      id: 2,
      name: 'متابعة العرض',
      type: 'email',
      content: 'عزيزي {{customer_name}}،\n\nأتمنى أن تكون بخير. أود متابعة العرض الذي قدمناه لكم بخصوص {{deal_name}}.\n\nهل لديكم أي استفسارات أو ملاحظات حول العرض؟\n\nنتطلع للتواصل معكم قريباً.\n\nمع خالص التحية،\n{{user_name}}',
      createdBy: 'سارة خالد',
      createdAt: '2025-04-15',
      usageCount: 32
    },
    {
      id: 3,
      name: 'تأكيد موعد الاجتماع',
      type: 'message',
      content: 'مرحباً {{customer_name}}، هذه رسالة لتأكيد موعد الاجتماع يوم {{meeting_date}} الساعة {{meeting_time}}. نتطلع للقائكم.',
      createdBy: 'أحمد علي',
      createdAt: '2025-04-18',
      usageCount: 28
    },
    {
      id: 4,
      name: 'شكر بعد الاجتماع',
      type: 'email',
      content: 'عزيزي {{customer_name}}،\n\nأشكرك على وقتك الثمين في اجتماعنا اليوم. لقد كان اجتماعاً مثمراً وناقشنا العديد من النقاط المهمة حول {{meeting_topic}}.\n\nسنقوم بإرسال ملخص الاجتماع والخطوات التالية قريباً.\n\nمع خالص التحية،\n{{user_name}}',
      createdBy: 'محمد أحمد',
      createdAt: '2025-04-20',
      usageCount: 15
    },
    {
      id: 5,
      name: 'تذكير بالدفع',
      type: 'message',
      content: 'مرحباً {{customer_name}}، نود تذكيركم بأن الدفعة المستحقة بقيمة {{payment_amount}} ريال لـ {{service_name}} ستكون مستحقة بتاريخ {{due_date}}. شكراً لتعاونكم.',
      createdBy: 'سارة خالد',
      createdAt: '2025-04-22',
      usageCount: 20
    }
  ]

  // بيانات تجريبية للروبوتات
  const bots = [
    {
      id: 1,
      name: 'روبوت الترحيب التلقائي',
      description: 'يرسل رسالة ترحيب تلقائية للعملاء الجدد',
      trigger: 'عند إضافة عميل جديد',
      actions: ['إرسال رسالة'],
      isActive: true,
      createdBy: 'محمد أحمد',
      createdAt: '2025-04-12'
    },
    {
      id: 2,
      name: 'متابعة العروض',
      description: 'يرسل رسالة متابعة بعد 3 أيام من إرسال العرض',
      trigger: 'بعد 3 أيام من إرسال العرض',
      actions: ['إرسال رسالة', 'إنشاء مهمة'],
      isActive: true,
      createdBy: 'سارة خالد',
      createdAt: '2025-04-16'
    },
    {
      id: 3,
      name: 'تذكير بالمهام',
      description: 'يرسل تذكيراً للمسؤول قبل موعد المهمة بيوم',
      trigger: 'قبل موعد المهمة بيوم',
      actions: ['إرسال إشعار'],
      isActive: false,
      createdBy: 'أحمد علي',
      createdAt: '2025-04-19'
    }
  ]

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">القوالب والأتمتة</h1>
      </header>
      
      <div className="p-4 flex-1 overflow-hidden">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="templates">القوالب</TabsTrigger>
            <TabsTrigger value="bots">الروبوتات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث عن قالب..." className="pr-10" />
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 ml-2" />
                  تصفية
                </Button>
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء قالب
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        template.type === 'message' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {template.type === 'message' ? 'رسالة' : 'بريد'}
                      </span>
                    </div>
                    
                    <div className="bg-muted/50 p-2 rounded-md text-sm mb-3 flex-1 overflow-hidden">
                      <div className="line-clamp-4">{template.content}</div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      <div>تم الإنشاء بواسطة: {template.createdBy}</div>
                      <div>تاريخ الإنشاء: {new Date(template.createdAt).toLocaleDateString('ar-SA')}</div>
                      <div>عدد الاستخدامات: {template.usageCount}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 ml-2" />
                        استخدام
                      </Button>
                      <Button variant="ghost" size="sm">
                        تعديل
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="bots" className="flex-1 overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <div className="relative w-64">
                <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="بحث عن روبوت..." className="pr-10" />
              </div>
              
              <div className="flex gap-2">
                <Button size="sm">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء روبوت
                </Button>
              </div>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bots.map((bot) => (
                  <Card key={bot.id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{bot.name}</h3>
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        bot.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {bot.isActive ? 'نشط' : 'غير نشط'}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{bot.description}</p>
                    
                    <div className="mb-3">
                      <div className="text-sm mb-1">
                        <span className="font-medium">المشغل: </span>
                        <span className="text-muted-foreground">{bot.trigger}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">الإجراءات: </span>
                        <span className="text-muted-foreground">{bot.actions.join('، ')}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      <div>تم الإنشاء بواسطة: {bot.createdBy}</div>
                      <div>تاريخ الإنشاء: {new Date(bot.createdAt).toLocaleDateString('ar-SA')}</div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">
                        <Code className="h-4 w-4 ml-2" />
                        تعديل
                      </Button>
                      <Button variant={bot.isActive ? "destructive" : "default"} size="sm">
                        {bot.isActive ? 'إيقاف' : 'تشغيل'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
