import { type VariantProps } from 'class-variance-authority'
import { Eye, EyeOff } from 'lucide-react'
import * as React from 'react'

import { enhancedInputVariants } from '@/components/ui/variants'
import { cn } from '@/lib/utils'

export interface InputProps
  extends Omit<React.ComponentProps<'input'>, 'size'>,
    VariantProps<typeof enhancedInputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      size,
      state,
      leftIcon,
      rightIcon,
      error,
      helperText,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)

    React.useEffect(() => {
      if (type === 'password') {
        setInputType(showPassword ? 'text' : 'password')
      } else {
        setInputType(type)
      }
    }, [type, showPassword])

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword(!showPassword)
    }, [showPassword])

    const inputState = error ? 'error' : state

    const inputElement = (
      <input
        ref={ref}
        type={inputType}
        data-slot='input'
        className={cn(
          enhancedInputVariants({ variant, size, state: inputState }),
          leftIcon && 'pl-10',
          (rightIcon || type === 'password') && 'pr-10',
          className
        )}
        aria-invalid={!!error}
        aria-describedby={
          error
            ? `${props.id}-error`
            : helperText
              ? `${props.id}-helper`
              : undefined
        }
        {...props}
      />
    )

    if (!leftIcon && !rightIcon && type !== 'password') {
      return (
        <div className='space-y-1'>
          {inputElement}
          {error && (
            <p id={`${props.id}-error`} className='text-sm text-destructive'>
              {error}
            </p>
          )}
          {helperText && !error && (
            <p
              id={`${props.id}-helper`}
              className='text-sm text-muted-foreground'
            >
              {helperText}
            </p>
          )}
        </div>
      )
    }

    return (
      <div className='space-y-1'>
        <div className='relative'>
          {leftIcon && (
            <div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4'>
              {leftIcon}
            </div>
          )}
          {inputElement}
          {type === 'password' && (
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm [&>svg]:size-4'
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff aria-hidden='true' />
              ) : (
                <Eye aria-hidden='true' />
              )}
            </button>
          )}
          {rightIcon && type !== 'password' && (
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4'>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${props.id}-error`} className='text-sm text-destructive'>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className='text-sm text-muted-foreground'
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input, enhancedInputVariants as inputVariants }
