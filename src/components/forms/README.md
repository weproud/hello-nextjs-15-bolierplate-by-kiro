# Form System Documentation

This comprehensive form system integrates React Hook Form with Zod validation to provide a robust, type-safe, and user-friendly form handling solution.

## 🚀 Next-Safe-Action Integration

We've successfully integrated **next-safe-action** for enhanced type safety and better developer experience:

### Key Benefits

- **End-to-end Type Safety**: From client form to server action
- **Automatic Validation**: Zod schemas automatically applied on server
- **Simplified Error Handling**: Automatic field error mapping
- **Better DX**: Less boilerplate, more safety

### Quick Example

```tsx
// Server Action (src/lib/actions/form-actions.ts)
export const submitContact = action
  .schema(contactSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput is fully typed and validated!
    return { message: 'Success!' }
  })

// Client Usage
const formAction = useFormAction(submitContact, {
  form,
  showToast: true,
  onSuccess: () => form.reset(),
})

const onSubmit = data => {
  formAction.execute(data) // Type-safe execution
}
```

## Features

- **🚀 Next-Safe-Action Integration** - Type-safe server actions with automatic validation
- **Type-safe validation** with Zod schemas
- **Real-time validation** with debouncing
- **Multi-step forms** with progressive validation
- **Conditional fields** based on form values
- **Auto-save functionality** with status indicators
- **Server action integration** with Next.js
- **Comprehensive error handling** with field-level and form-level errors
- **Accessibility compliant** form components
- **Optimistic updates** for better UX

## 🚀 Next-Safe-Action Integration

We've successfully integrated **next-safe-action** for enhanced type safety and better developer experience:

### Key Benefits

- **End-to-end Type Safety**: From client form to server action
- **Automatic Validation**: Zod schemas automatically applied on server
- **Simplified Error Handling**: Automatic field error mapping
- **Better DX**: Less boilerplate, more safety

### Quick Example

```tsx
// Server Action (src/lib/actions/form-actions.ts)
export const submitContact = action
  .schema(contactSchema)
  .action(async ({ parsedInput }) => {
    // parsedInput is fully typed and validated!
    return { message: 'Success!' }
  })

// Client Usage
const formAction = useFormAction(submitContact, {
  form,
  showToast: true,
  onSuccess: () => form.reset(),
})

const onSubmit = data => {
  formAction.execute(data) // Type-safe execution
}
```

## Core Components

### 1. Enhanced Form (`EnhancedForm`)

The main form wrapper that provides all the advanced functionality.

```tsx
import {
  EnhancedForm,
  EnhancedFormField,
} from '@/components/forms/enhanced-form'
import { useFormWithValidation } from '@/hooks/use-form'
import { contactSchema } from '@/lib/validations/common'

function MyForm() {
  const form = useFormWithValidation(contactSchema, {
    defaultValues: { name: '', email: '' },
  })

  return (
    <EnhancedForm
      form={form}
      onSubmit={handleSubmit}
      serverAction={submitContact}
      autoSave={true}
      showSummaryErrors={true}
    >
      <EnhancedFormField form={form} name="name" label="Name" required>
        {field => <Input {...field} />}
      </EnhancedFormField>
    </EnhancedForm>
  )
}
```

#### Props

- `form`: React Hook Form instance with Zod validation
- `onSubmit`: Client-side submit handler
- `serverAction`: Optional Next.js server action
- `autoSave`: Enable auto-save functionality
- `autoSaveDelay`: Delay in ms for auto-save (default: 2000)
- `showSummaryErrors`: Show error summary at top of form
- `resetOnSuccess`: Reset form after successful submission

### 2. Enhanced Form Field (`EnhancedFormField`)

Individual form field wrapper with validation and error handling.

```tsx
<EnhancedFormField
  form={form}
  name="email"
  label="Email Address"
  required
  validateOnBlur={true}
  validateOnChange={false}
  description="We'll never share your email"
>
  {field => <Input type="email" {...field} />}
</EnhancedFormField>
```

#### Props

- `form`: React Hook Form instance
- `name`: Field name (type-safe)
- `label`: Field label
- `required`: Show required indicator
- `validateOnBlur`: Validate when field loses focus
- `validateOnChange`: Validate on every change
- `debounceMs`: Debounce delay for real-time validation
- `description`: Help text for the field

### 3. Form Section (`FormSection`)

Organize form fields into logical sections.

```tsx
<FormSection
  title="Personal Information"
  description="Enter your personal details"
  collapsible={true}
  defaultExpanded={true}
>
  {/* Form fields */}
</FormSection>
```

### 4. Conditional Form Field (`ConditionalFormField`)

Show/hide fields based on form values.

```tsx
<ConditionalFormField
  form={form}
  condition={values => values.userType === 'business'}
>
  <EnhancedFormField name="companyName" label="Company Name">
    {field => <Input {...field} />}
  </EnhancedFormField>
</ConditionalFormField>
```

### 5. Form Validation Status (`FormValidationStatus`)

Display form completion progress and validation status.

```tsx
<FormValidationStatus form={form} showProgress={true} />
```

## Hooks

### 1. `useFormWithValidation`

Basic form hook with Zod validation.

```tsx
const form = useFormWithValidation(schema, {
  defaultValues: {
    /* ... */
  },
  mode: 'onChange',
})
```

### 2. `useProgressiveForm`

For multi-step forms with step-by-step validation.

```tsx
const form = useProgressiveForm(schema, options)

// Validate specific step
const isValid = await form.validateStep(['field1', 'field2'])

// Get errors for specific step
const stepErrors = form.getStepErrors(['field1', 'field2'])
```

### 3. `useFormAction`

Handle server actions with forms.

```tsx
const formAction = useFormAction(serverAction, {
  form,
  showToast: true,
  successMessage: 'Success!',
  onSuccess: data => console.log(data),
})

// Execute the action
formAction.execute(formData)
```

### 4. `useAutoSaveForm`

Form with automatic saving functionality.

```tsx
const form = useAutoSaveForm(
  schema,
  async data => {
    // Auto-save logic
    await saveToServer(data)
  },
  {
    autoSaveDelay: 2000,
    enableAutoSave: true,
  }
)
```

## Validation Utilities

### 1. `createValidationHelper`

Create consistent validation between client and server.

```tsx
import { createValidationHelper } from '@/lib/validations/form-utils'

const validator = createValidationHelper(schema)

// Validate form data
const result = validator.validateFormData(formData)

// Validate single field
const fieldResult = validator.validateField('email', 'test@example.com')

// Get field error
const error = validator.getFieldError(errors, 'email')
```

### 2. `createEnhancedValidationHelper`

Advanced validation with additional features.

```tsx
const validator = createEnhancedValidationHelper(schema)

// Async field validation
const result = await validator.validateFieldAsync('email', value, 300)

// Validate multiple fields
const results = validator.validateFields({
  email: 'test@example.com',
  name: 'John Doe',
})

// Get validation summary
const summary = validator.getValidationSummary(formData)
```

## Server Actions

### 1. `createTypedFormAction`

Create type-safe server actions with validation.

```tsx
export const submitContact = createTypedFormAction(
  contactSchema,
  async data => {
    // Process validated data
    const result = await saveContact(data)
    return result
  },
  {
    successMessage: 'Contact saved successfully!',
    errorMessage: 'Failed to save contact',
    revalidatePaths: ['/contacts'],
  }
)
```

### 2. Built-in Actions

Pre-built server actions for common use cases:

- `createProject` - Create a new project
- `submitContact` - Submit contact form
- `registerUser` - User registration
- `updateProfile` - Update user profile
- `submitFeedback` - Submit feedback
- `inviteTeamMember` - Invite team member

## Validation Schemas

### Common Schemas

Pre-built Zod schemas for common form fields:

```tsx
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  contactSchema,
  projectSchema,
  registerSchema,
} from '@/lib/validations/common'
```

### Custom Schemas

Create custom validation schemas:

```tsx
// Create schemas in dedicated validation files
// src/lib/validations/my-schemas.ts
import { z } from 'zod'

export const customSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.date().min(new Date(), 'Due date must be in the future'),
})

export type CustomInput = z.infer<typeof customSchema>

// Then import in your component
import { customSchema, type CustomInput } from '@/lib/validations/my-schemas'
```

## Error Handling

### Form Error Components

```tsx
import {
  FormError,
  FormErrorList,
  FormErrorSummary,
  FieldValidationIndicator
} from '@/components/ui/form-error'

// Single error
<FormError message="This field is required" type="error" />

// Error list
<FormErrorList errors={['Error 1', 'Error 2']} />

// Error summary
<FormErrorSummary errors={formErrors} showFieldNames={true} />

// Validation indicator
<FieldValidationIndicator
  isValid={true}
  isValidating={false}
  error="Invalid email"
/>
```

## Examples

### 1. Simple Form

```tsx
function SimpleForm() {
  const form = useFormWithValidation(projectSchema)

  return (
    <EnhancedForm form={form} onSubmit={handleSubmit}>
      <EnhancedFormField form={form} name="title" label="Title" required>
        {field => <Input {...field} />}
      </EnhancedFormField>
    </EnhancedForm>
  )
}
```

### 2. Multi-Step Form

```tsx
function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const form = useProgressiveForm(multiStepSchema)

  const handleNext = async () => {
    const isValid = await form.validateStep(getStepFields(currentStep))
    if (isValid) setCurrentStep(currentStep + 1)
  }

  return (
    <EnhancedForm form={form} onSubmit={handleSubmit}>
      {currentStep === 1 && <Step1Fields />}
      {currentStep === 2 && <Step2Fields />}
      <Button onClick={handleNext}>Next</Button>
    </EnhancedForm>
  )
}
```

### 3. Conditional Form

```tsx
function ConditionalForm() {
  const form = useFormWithValidation(conditionalSchema)

  return (
    <EnhancedForm form={form} onSubmit={handleSubmit}>
      <EnhancedFormField form={form} name="userType" label="User Type">
        {field => (
          <select {...field}>
            <option value="individual">Individual</option>
            <option value="business">Business</option>
          </select>
        )}
      </EnhancedFormField>

      <ConditionalFormField
        form={form}
        condition={values => values.userType === 'business'}
      >
        <EnhancedFormField form={form} name="companyName" label="Company">
          {field => <Input {...field} />}
        </EnhancedFormField>
      </ConditionalFormField>
    </EnhancedForm>
  )
}
```

### 4. Auto-Save Form

```tsx
function AutoSaveForm() {
  const form = useAutoSaveForm(
    schema,
    async data => {
      await saveToServer(data)
    },
    { autoSaveDelay: 1000 }
  )

  return (
    <EnhancedForm
      form={form}
      onSubmit={handleSubmit}
      autoSave={true}
      onAutoSave={handleAutoSave}
    >
      {/* Form fields */}
    </EnhancedForm>
  )
}
```

## Best Practices

1. **Use TypeScript**: All components are fully typed for better DX
2. **Validate early**: Use `validateOnBlur` for better UX
3. **Provide feedback**: Use toast notifications and error summaries
4. **Progressive enhancement**: Start with basic forms, add features as needed
5. **Consistent schemas**: Reuse validation schemas between client and server
6. **Accessibility**: All components follow WCAG guidelines
7. **Performance**: Use debouncing for real-time validation
8. **Error handling**: Provide clear, actionable error messages

## Troubleshooting

### Common Issues

1. **TypeScript errors**: Ensure schemas match form field names exactly
2. **Validation not working**: Check that schema is properly imported
3. **Server actions failing**: Verify FormData conversion in server actions
4. **Auto-save not triggering**: Ensure form is valid and dirty

### Debug Tools

Use the debug information in development:

```tsx
<details>
  <summary>Debug Info</summary>
  <pre>{JSON.stringify(form.formState, null, 2)}</pre>
  <pre>{JSON.stringify(form.watch(), null, 2)}</pre>
</details>
```

## Migration Guide

### From Basic React Hook Form

1. Replace `useForm` with `useFormWithValidation`
2. Add Zod schema for validation
3. Replace form wrapper with `EnhancedForm`
4. Replace field components with `EnhancedFormField`

### From Other Form Libraries

1. Convert validation rules to Zod schemas
2. Update field components to use render props pattern
3. Replace submit handlers with server actions where appropriate
4. Add error handling components

## Contributing

When adding new form components or features:

1. Follow the existing patterns and naming conventions
2. Add proper TypeScript types
3. Include comprehensive examples
4. Update this documentation
5. Add tests for new functionality
