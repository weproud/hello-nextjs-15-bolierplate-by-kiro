import { SimpleFormExample } from '@/components/forms/simple-form-example'
import { ContactForm } from '@/components/forms/contact-form'
import { ContactFormSafeAction } from '@/components/forms/contact-form-safe-action'
import { ProjectForm } from '@/components/forms/project-form'
import { SurveyForm } from '@/components/forms/survey-form'
import { MultiStepForm } from '@/components/forms/multi-step-form'
import { ComprehensiveFormExample } from '@/components/forms/comprehensive-form-example'

export default function FormsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Form Examples</h1>
          <p className="text-xl text-muted-foreground">
            React Hook Form + Zod를 활용한 다양한 폼 예제들
          </p>
        </div>

        <div className="space-y-16">
          {/* Simple Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Simple Form</h2>
              <p className="text-muted-foreground">
                기본적인 프로젝트 생성 폼 예제
              </p>
            </div>
            <SimpleFormExample />
          </section>

          {/* Contact Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Contact Form</h2>
              <p className="text-muted-foreground">기본적인 문의 폼 예제</p>
            </div>
            <ContactForm />
          </section>

          {/* Next-Safe-Action Contact Form */}
          <section className="border-2 border-blue-200 rounded-lg p-6 bg-blue-50/30">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-blue-800">
                🚀 Next-Safe-Action Contact Form
              </h2>
              <p className="text-blue-600">
                next-safe-action을 사용한 개선된 문의 폼 예제
              </p>
            </div>
            <ContactFormSafeAction />
          </section>

          {/* Project Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Project Form</h2>
              <p className="text-muted-foreground">
                자동 저장 기능이 포함된 프로젝트 생성 폼
              </p>
            </div>
            <ProjectForm />
          </section>

          {/* Survey Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Survey Form</h2>
              <p className="text-muted-foreground">
                인터랙티브한 설문조사 폼 예제
              </p>
            </div>
            <SurveyForm />
          </section>

          {/* Multi-Step Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">Multi-Step Form</h2>
              <p className="text-muted-foreground">
                단계별 진행이 가능한 회원가입 폼
              </p>
            </div>
            <MultiStepForm />
          </section>

          {/* Comprehensive Form */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Comprehensive Form
              </h2>
              <p className="text-muted-foreground">
                조건부 필드와 고급 기능을 포함한 종합 폼 예제
              </p>
            </div>
            <ComprehensiveFormExample />
          </section>
        </div>
      </div>
    </div>
  )
}
