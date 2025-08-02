/**
 * Enhanced FormField Component
 *
 * 재사용 가능한 폼 필드 컴포넌트로 라벨, 입력, 에러 메시지를 통합 관리합니다.
 * useFormWithAction 훅과 완벽하게 통합되어 작동합니다.
 */

import { cn } from '@/lib/utils'
import * as React from 'react'
import { type FieldError } from 'react-hook-form'
import { FieldValidationIndicator, FormError } from './form-error'
import { Label } from './label'

export interface FormFieldProps {
  label?: string
  error?: string | FieldError
  helperText?: string
  required?: boolean
  optional?: boolean
  className?: string
  children: React.ReactNode
  htmlFor?: string
  // 새로운 기능들
  showValidationIndicator?: boolean
  isValidating?: boolean
  isValid?: boolean
  tooltip?: string
  size?: 'sm' | 'md' | 'lg'
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      optional = false,
      className,
      children,
      htmlFor,
      showValidationIndicator = false,
      isValidating = false,
      isValid,
      tooltip,
      size = 'md',
      ...props
    },
    ref
  ) => {
    const fieldId = htmlFor || React.useId()

    // 에러 메시지 추출 (FieldError 객체 또는 문자열 처리)
    const errorMessage = typeof error === 'string' ? error : error?.message

    // 크기별 스타일
    const sizeStyles = {
      sm: 'space-y-1',
      md: 'space-y-2',
      lg: 'space-y-3',
    }

    return (
      <div ref={ref} className={cn(sizeStyles[size], className)} {...props}>
        {label && (
          <div className='flex items-center justify-between'>
            <Label
              htmlFor={fieldId}
              className={cn(
                'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
                errorMessage && 'text-destructive',
                size === 'sm' && 'text-xs',
                size === 'lg' && 'text-base'
              )}
            >
              {label}
              {required && (
                <span className='ml-1 text-destructive' aria-label='필수 입력'>
                  *
                </span>
              )}
              {optional && (
                <span
                  className='ml-1 text-muted-foreground text-xs'
                  aria-label='선택 입력'
                >
                  (선택사항)
                </span>
              )}
              {tooltip && (
                <span
                  className='ml-1 text-muted-foreground cursor-help focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm'
                  title={tooltip}
                  role='button'
                  tabIndex={0}
                  aria-label={`도움말: ${tooltip}`}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      // 툴팁 표시 로직 (필요시 구현)
                    }
                  }}
                >
                  ⓘ
                </span>
              )}
            </Label>

            {showValidationIndicator && (
              <FieldValidationIndicator
                isValid={isValid}
                isValidating={isValidating}
                error={errorMessage}
                className='ml-2'
              />
            )}
          </div>
        )}

        <div className='relative'>
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                id: fieldId,
                'aria-invalid': !!errorMessage,
                'aria-describedby': errorMessage
                  ? `${fieldId}-error`
                  : helperText
                    ? `${fieldId}-helper`
                    : undefined,
                className: cn(
                  child.props.className,
                  errorMessage && 'border-destructive focus:border-destructive',
                  isValid && 'border-green-500 focus:border-green-500'
                ),
                ...child.props,
              })
            }
            return child
          })}
        </div>

        {errorMessage && (
          <FormError
            id={`${fieldId}-error`}
            message={errorMessage}
            type='error'
          />
        )}

        {helperText && !errorMessage && (
          <p
            id={`${fieldId}-helper`}
            className={cn(
              'text-muted-foreground',
              size === 'sm' ? 'text-xs' : 'text-sm'
            )}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

// Compound components for specific field types
interface InputFieldProps extends Omit<FormFieldProps, 'children'> {
  inputProps?: React.ComponentProps<'input'>
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const InputField = React.forwardRef<HTMLDivElement, InputFieldProps>(
  ({ inputProps, leftIcon, rightIcon, ...fieldProps }, ref) => {
    const { Input } = require('./input')

    return (
      <FormField ref={ref} {...fieldProps}>
        <Input leftIcon={leftIcon} rightIcon={rightIcon} {...inputProps} />
      </FormField>
    )
  }
)

InputField.displayName = 'InputField'

interface TextareaFieldProps extends Omit<FormFieldProps, 'children'> {
  textareaProps?: React.ComponentProps<'textarea'>
}

const TextareaField = React.forwardRef<HTMLDivElement, TextareaFieldProps>(
  ({ textareaProps, ...fieldProps }, ref) => {
    const { Textarea } = require('./textarea')

    return (
      <FormField ref={ref} {...fieldProps}>
        <Textarea {...textareaProps} />
      </FormField>
    )
  }
)

TextareaField.displayName = 'TextareaField'

interface SelectFieldProps extends Omit<FormFieldProps, 'children'> {
  selectProps?: any
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

const SelectField = React.forwardRef<HTMLDivElement, SelectFieldProps>(
  ({ selectProps, placeholder, options, ...fieldProps }, ref) => {
    const {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } = require('./select')

    return (
      <FormField ref={ref} {...fieldProps}>
        <Select {...selectProps}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options?.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormField>
    )
  }
)

SelectField.displayName = 'SelectField'

interface CheckboxFieldProps
  extends Omit<FormFieldProps, 'children' | 'label'> {
  checkboxProps?: any
  label: string
  description?: string
}

const CheckboxField = React.forwardRef<HTMLDivElement, CheckboxFieldProps>(
  ({ checkboxProps, label, description, ...fieldProps }, ref) => {
    const { Checkbox } = require('./checkbox')

    return (
      <FormField ref={ref} {...fieldProps} label={undefined}>
        <div className='flex items-top space-x-2'>
          <Checkbox {...checkboxProps} />
          <div className='grid gap-1.5 leading-none'>
            <Label
              htmlFor={checkboxProps?.id}
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              {label}
              {fieldProps.required && (
                <span className='ml-1 text-destructive' aria-label='required'>
                  *
                </span>
              )}
            </Label>
            {description && (
              <p className='text-xs text-muted-foreground'>{description}</p>
            )}
          </div>
        </div>
      </FormField>
    )
  }
)

CheckboxField.displayName = 'CheckboxField'

export { CheckboxField, FormField, InputField, SelectField, TextareaField }

// 편의를 위한 기본 내보내기
export default FormField
