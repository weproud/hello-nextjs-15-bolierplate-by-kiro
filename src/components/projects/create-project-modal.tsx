'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ProjectForm } from '@/components/forms/project-form'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (project?: any) => void
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateProjectModalProps) {
  const handleSuccess = (project?: any) => {
    onOpenChange(false)
    onSuccess?.(project)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>새 프로젝트 만들기</DialogTitle>
          <DialogDescription>
            새로운 프로젝트를 만들어 목표를 체계적으로 관리해보세요.
          </DialogDescription>
        </DialogHeader>
        <ProjectForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          showCard={false}
        />
      </DialogContent>
    </Dialog>
  )
}
