import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function PostDetailLoading() {
  return (
    <div className='container max-w-4xl mx-auto px-4 py-6 md:py-8'>
      {/* 뒤로 가기 버튼 스켈레톤 */}
      <div className='mb-6'>
        <Skeleton className='h-5 w-32' />
      </div>

      <article className='space-y-8'>
        {/* 포스트 헤더 스켈레톤 */}
        <header className='space-y-6'>
          <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
            <div className='flex-1 min-w-0'>
              {/* 제목 스켈레톤 */}
              <Skeleton className='h-8 sm:h-10 md:h-12 w-full mb-4' />
              <Skeleton className='h-8 sm:h-10 md:h-12 w-3/4 mb-4' />

              {/* 배지 스켈레톤 */}
              <Skeleton className='h-6 w-16 mb-4' />
            </div>

            {/* 액션 버튼 스켈레톤 */}
            <div className='flex items-center gap-2 sm:flex-shrink-0'>
              <Skeleton className='h-8 w-16' />
              <Skeleton className='h-8 w-16' />
            </div>
          </div>

          {/* 작성자 정보 카드 스켈레톤 */}
          <Card className='bg-muted/50'>
            <CardContent className='p-4 sm:p-6'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <div className='flex items-center gap-3'>
                    {/* 아바타 스켈레톤 */}
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <div>
                      <Skeleton className='h-4 w-24 mb-1' />
                      <Skeleton className='h-3 w-32' />
                    </div>
                  </div>
                </div>

                {/* 날짜 정보 스켈레톤 */}
                <div className='text-left sm:text-right'>
                  <Skeleton className='h-4 w-16 mb-1' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </CardContent>
          </Card>
        </header>

        {/* 구분선 */}
        <div className='border-t border-border' />

        {/* 포스트 내용 스켈레톤 */}
        <section className='space-y-4'>
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-3/4' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />

          <div className='py-4'>
            <Skeleton className='h-6 w-1/2 mb-2' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
          </div>

          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-4/5' />
          <Skeleton className='h-4 w-full' />
        </section>
      </article>

      {/* 하단 네비게이션 스켈레톤 */}
      <div className='mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <Skeleton className='h-5 w-24' />
          <Skeleton className='h-8 w-20' />
        </div>
      </div>
    </div>
  )
}
