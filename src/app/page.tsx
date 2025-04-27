'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 sm:p-24">
      <h1 className="text-4xl font-bold mb-6 text-center">نظام إدارة علاقات العملاء</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        مرحباً بك في النموذج الأولي لنظام إدارة علاقات العملاء المشابه لـ Kommo. هذا النظام يساعدك على إدارة علاقاتك مع العملاء بكفاءة عبر قنوات متعددة.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">صندوق الوارد الموحد</h2>
          <p className="mb-6">إدارة جميع محادثاتك مع العملاء من مكان واحد، بغض النظر عن القناة المستخدمة.</p>
          <Button asChild className="mt-auto">
            <Link href="/inbox">استكشاف صندوق الوارد</Link>
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">إدارة العملاء</h2>
          <p className="mb-6">تنظيم قاعدة بيانات العملاء وتتبع جميع التفاعلات والمعلومات المتعلقة بهم.</p>
          <Button asChild className="mt-auto">
            <Link href="/customers">إدارة العملاء</Link>
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">مسارات المبيعات</h2>
          <p className="mb-6">تتبع الصفقات وإدارة مسار المبيعات بطريقة مرئية وفعالة.</p>
          <Button asChild className="mt-auto">
            <Link href="/pipelines">عرض مسارات المبيعات</Link>
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">إدارة المهام</h2>
          <p className="mb-6">تنظيم المهام والتذكيرات المتعلقة بالعملاء والصفقات.</p>
          <Button asChild className="mt-auto">
            <Link href="/tasks">إدارة المهام</Link>
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">القوالب والأتمتة</h2>
          <p className="mb-6">إنشاء قوالب للرسائل وأتمتة العمليات المتكررة لتوفير الوقت.</p>
          <Button asChild className="mt-auto">
            <Link href="/templates">إدارة القوالب</Link>
          </Button>
        </Card>
        
        <Card className="p-6 flex flex-col items-center text-center">
          <h2 className="text-2xl font-semibold mb-4">التقارير والإحصائيات</h2>
          <p className="mb-6">تحليل أداء المبيعات والفريق من خلال تقارير وإحصائيات مفصلة.</p>
          <Button asChild className="mt-auto">
            <Link href="/reports">عرض التقارير</Link>
          </Button>
        </Card>
      </div>
    </main>
  )
}
