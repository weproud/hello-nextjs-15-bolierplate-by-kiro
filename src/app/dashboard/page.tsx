import { ProtectedRoute } from '@/components/auth/protected-route'
import { getCurrentUser } from '@/lib/session'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { signOut } from '@/lib/auth'

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">대시보드</h1>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/' })
              }}
            >
              <Button type="submit" variant="outline">
                로그아웃
              </Button>
            </form>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>환영합니다!</CardTitle>
              <CardDescription>성공적으로 로그인되었습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>이름:</strong> {user?.name || '이름 없음'}
                </p>
                <p>
                  <strong>이메일:</strong> {user?.email || '이메일 없음'}
                </p>
                <p>
                  <strong>사용자 ID:</strong> {user?.id || 'ID 없음'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
