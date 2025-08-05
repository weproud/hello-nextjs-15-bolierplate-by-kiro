/**
 * Form Components Index
 *
 * 폼 관련 컴포넌트들을 중앙에서 관리하고 내보냅니다.
 * Tree shaking을 위해 개별 export를 사용합니다.
 */

// =============================================================================
// Enhanced Form Components
// =============================================================================
export {
  EnhancedForm,
  FormTemplates,
  type EnhancedFormComponent,
  type EnhancedFormProps,
  type FormFieldConfig,
} from '@/components/forms/enhanced-form'

// =============================================================================
// Project Form Components
// =============================================================================
export {
  CreateProjectForm,
  EditProjectForm,
  ProjectFormEnhanced,
} from '@/components/forms/project-form-enhanced'

// Legacy project form (호환성을 위해 유지)
export { ProjectForm } from '@/components/forms/project-form'

// =============================================================================
// Advanced Form Components
// =============================================================================
export { AdvancedForm } from '@/components/forms/advanced-form'
export { AdvancedSafeActionExamples } from '@/components/forms/advanced-safe-action-examples'
export { ComprehensiveFormExample } from '@/components/forms/comprehensive-form-example'
export { ContactForm } from '@/components/forms/contact-form'
export { ContactFormSafeAction } from '@/components/forms/contact-form-safe-action'
export { FormFieldComponents } from '@/components/forms/form-field-components'
export { FormLazy } from '@/components/forms/form-lazy'
export { FormStaticContent } from '@/components/forms/form-static-content'
export { MultiStepForm } from '@/components/forms/multi-step-form'
export { SafeActionExample } from '@/components/forms/safe-action-example'
export { SimpleFormExample } from '@/components/forms/simple-form-example'
export { SurveyForm } from '@/components/forms/survey-form'

// =============================================================================
// Basic UI Form Components (Re-exported from UI)
// =============================================================================
export {
  CheckboxField,
  FormField,
  InputField,
  SelectField,
  TextareaField,
} from '@/components/ui/form-field'

export {
  FieldValidationIndicator,
  FormError,
  FormErrorList,
  FormErrorSummary,
  FormFieldError,
  FormProgress,
} from '@/components/ui/form-error'
