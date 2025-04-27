'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, LineChart, PieChart, Calendar, Download } from 'lucide-react'
import Link from 'next/link'

export default function ReportsPage() {
  // بيانات تجريبية للرسوم البيانية
  const salesData = {
    months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'],
    values: [45000, 60000, 52000, 75000, 85000]
  }
  
  const dealsByStage = [
    { stage: 'جهات اتصال جديدة', count: 12 },
    { stage: 'اجتماع أولي', count: 8 },
    { stage: 'تقديم عرض', count: 5 },
    { stage: 'مفاوضات', count: 3 },
    { stage: 'صفقة مغلقة', count: 6 }
  ]
  
  const activityData = {
    days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    calls: [5, 8, 12, 7, 10, 4, 2],
    emails: [10, 15, 8, 12, 9, 6, 3],
    meetings: [2, 3, 4, 1, 2, 0, 0]
  }
  
  const teamPerformance = [
    { name: 'محمد أحمد', deals: 8, value: 120000 },
    { name: 'سارة خالد', deals: 6, value: 95000 },
    { name: 'أحمد علي', deals: 5, value: 85000 }
  ]

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b p-4">
        <h1 className="text-2xl font-bold">التقارير والإحصائيات</h1>
      </header>
      
      <div className="p-4 flex-1 overflow-hidden">
        <Tabs defaultValue="sales" className="h-full flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="sales">المبيعات</TabsTrigger>
            <TabsTrigger value="activity">النشاط</TabsTrigger>
            <TabsTrigger value="performance">أداء الفريق</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales" className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">إجمالي المبيعات الشهرية</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                  <BarChart className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  إجمالي المبيعات للأشهر الخمسة الماضية
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">توزيع الصفقات حسب المرحلة</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                  <PieChart className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  عدد الصفقات في كل مرحلة من مراحل المبيعات
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">تفاصيل الصفقات</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right p-3 font-medium">المرحلة</th>
                    <th className="text-right p-3 font-medium">عدد الصفقات</th>
                    <th className="text-right p-3 font-medium">النسبة</th>
                  </tr>
                </thead>
                <tbody>
                  {dealsByStage.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="p-3">{item.stage}</td>
                      <td className="p-3">{item.count}</td>
                      <td className="p-3">
                        {Math.round((item.count / dealsByStage.reduce((acc, curr) => acc + curr.count, 0)) * 100)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="p-3">المجموع</td>
                    <td className="p-3">{dealsByStage.reduce((acc, curr) => acc + curr.count, 0)}</td>
                    <td className="p-3">100%</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity" className="flex-1 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">نشاط الفريق الأسبوعي</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                  <LineChart className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  عدد الاتصالات والرسائل والاجتماعات خلال الأسبوع
                </div>
              </Card>
              
              <Card className="p-4">
                <h3 className="text-lg font-medium mb-4">المهام القادمة</h3>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                  <Calendar className="h-16 w-16 text-muted-foreground" />
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  المهام المجدولة للأسبوع القادم
                </div>
              </Card>
            </div>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">ملخص النشاط</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right p-3 font-medium">اليوم</th>
                    <th className="text-right p-3 font-medium">الاتصالات</th>
                    <th className="text-right p-3 font-medium">الرسائل</th>
                    <th className="text-right p-3 font-medium">الاجتماعات</th>
                    <th className="text-right p-3 font-medium">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.days.map((day, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="p-3">{day}</td>
                      <td className="p-3">{activityData.calls[index]}</td>
                      <td className="p-3">{activityData.emails[index]}</td>
                      <td className="p-3">{activityData.meetings[index]}</td>
                      <td className="p-3">
                        {activityData.calls[index] + activityData.emails[index] + activityData.meetings[index]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="flex-1 overflow-auto">
            <Card className="p-4 mb-4">
              <h3 className="text-lg font-medium mb-4">أداء فريق المبيعات</h3>
              <div className="h-64 flex items-center justify-center bg-muted/20 rounded-md">
                <BarChart className="h-16 w-16 text-muted-foreground" />
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                قيمة الصفقات المغلقة لكل عضو في الفريق
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">تفاصيل أداء الفريق</h3>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 ml-2" />
                  تصدير
                </Button>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-right p-3 font-medium">الاسم</th>
                    <th className="text-right p-3 font-medium">عدد الصفقات</th>
                    <th className="text-right p-3 font-medium">قيمة الصفقات</th>
                    <th className="text-right p-3 font-medium">متوسط قيمة الصفقة</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member, index) => (
                    <tr key={index} className="border-b hover:bg-muted/30">
                      <td className="p-3">{member.name}</td>
                      <td className="p-3">{member.deals}</td>
                      <td className="p-3">{member.value.toLocaleString()} ريال</td>
                      <td className="p-3">{Math.round(member.value / member.deals).toLocaleString()} ريال</td>
                    </tr>
                  ))}
                  <tr className="font-medium">
                    <td className="p-3">المجموع</td>
                    <td className="p-3">{teamPerformance.reduce((acc, curr) => acc + curr.deals, 0)}</td>
                    <td className="p-3">
                      {teamPerformance.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()} ريال
                    </td>
                    <td className="p-3">
                      {Math.round(
                        teamPerformance.reduce((acc, curr) => acc + curr.value, 0) / 
                        teamPerformance.reduce((acc, curr) => acc + curr.deals, 0)
                      ).toLocaleString()} ريال
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
