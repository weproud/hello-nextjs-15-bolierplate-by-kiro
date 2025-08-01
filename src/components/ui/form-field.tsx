/**
 * Enhanced FormField Component
 *
 * 재사용 가능한 폼 필드 컴포넌트로 라벨, 입력, 에러 메시지를 통합 관리합니다.
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from './label'
import { FormError } from './form-error'

export interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  optional?: boolean
  className?: string
  children: React.ReactNode
  htmlFor?: string
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
      ...props
    },
    ref
  ) => {
    const fieldId = htmlFor || React.useId()

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              error && 'text-destructive'
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-destructive" aria-label="required">
                *
              </span>
            )}
            {optional && (
              <span className="ml-1 text-muted-foreground text-xs">
                (optional)
              </span>
            )}
          </Label>
        )}

        <div className="relative">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                id: fieldId,
                'aria-invalid': !!error,
                'aria-describedby': error
                  ? `${fieldId}-error`
                  : helperText
                    ? `${fieldId}-helper`
                    : undefined,
                ...child.props,
              })
            }
            return child
          })}
        </div>

        {error && (
          <FormError id={`${fieldId}-error`} message={error} type="error" />
        )}

        {helperText && !error && (
          <p id={`${fieldId}-helper`} className="text-sm text-muted-foreground">
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
        <div className="flex items-top space-x-2">
          <Checkbox {...checkboxProps} />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor={checkboxProps?.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
              {fieldProps.required && (
                <span className="ml-1 text-destructive" aria-label="required">
                  *
                </span>
              )}
            </Label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </FormField>
    )
  }
)

CheckboxField.displayName = 'CheckboxField'

export { FormField, InputField, TextareaField, SelectField, CheckboxField }
