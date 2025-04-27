'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Lock, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/20">
      <Card className="w-full max-w-md p-6">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">تسجيل الدخول</TabsTrigger>
            <TabsTrigger value="register">إنشاء حساب</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">مرحباً بعودتك</h1>
                <p className="text-muted-foreground">قم بتسجيل الدخول للوصول إلى نظام إدارة علاقات العملاء</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="البريد الإلكتروني" className="pr-10" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type="password" placeholder="كلمة المرور" className="pr-10" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="ml-2" />
                    <label htmlFor="remember" className="text-sm text-muted-foreground">تذكرني</label>
                  </div>
                  <Link href="/auth/forgot-password" className="text-sm text-primary hover:underline">
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                
                <Button className="w-full" asChild>
                  <Link href="/">تسجيل الدخول</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="register">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">إنشاء حساب جديد</h1>
                <p className="text-muted-foreground">قم بإنشاء حساب للوصول إلى نظام إدارة علاقات العملاء</p>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="الاسم الكامل" className="pr-10" />
                </div>
                
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="البريد الإلكتروني" className="pr-10" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type="password" placeholder="كلمة المرور" className="pr-10" />
                </div>
                
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input type="password" placeholder="تأكيد كلمة المرور" className="pr-10" />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" className="ml-2" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground">
                    أوافق على <Link href="#" className="text-primary hover:underline">الشروط والأحكام</Link>
                  </label>
                </div>
                
                <Button className="w-full" asChild>
                  <Link href="/">إنشاء حساب</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
