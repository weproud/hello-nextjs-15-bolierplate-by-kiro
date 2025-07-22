'use client'

import {
  SelectableCard,
  SelectableCardHeader,
  SelectableCardTitle,
  SelectableCardDescription,
} from '@/components/ui/selectable-card'
import { CheckCircle, Shield, Zap } from 'lucide-react'

export function FeaturesSection() {
  return (
    <div className="grid md:grid-cols-3 gap-8 mb-16">
      <SelectableCard
        onSelectionChange={selected =>
          console.log('체계적인 관리 선택:', selected)
        }
      >
        <SelectableCardHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <SelectableCardTitle>체계적인 관리</SelectableCardTitle>
          <SelectableCardDescription>
            프로젝트를 단계별로 나누어 체계적으로 관리하세요
          </SelectableCardDescription>
        </SelectableCardHeader>
      </SelectableCard>

      <SelectableCard
        onSelectionChange={selected =>
          console.log('안전한 인증 선택:', selected)
        }
      >
        <SelectableCardHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <SelectableCardTitle>안전한 인증</SelectableCardTitle>
          <SelectableCardDescription>
            Google OAuth를 통한 안전하고 간편한 로그인
          </SelectableCardDescription>
        </SelectableCardHeader>
      </SelectableCard>

      <SelectableCard
        onSelectionChange={selected => console.log('빠른 성능 선택:', selected)}
      >
        <SelectableCardHeader>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <SelectableCardTitle>빠른 성능</SelectableCardTitle>
          <SelectableCardDescription>
            최신 기술 스택으로 구현된 빠르고 반응성 좋은 UI
          </SelectableCardDescription>
        </SelectableCardHeader>
      </SelectableCard>
    </div>
  )
}
