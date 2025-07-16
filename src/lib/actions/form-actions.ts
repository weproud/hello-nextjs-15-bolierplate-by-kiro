'use server'

import { revalidatePath } from 'next/cache'
import { action } from '@/lib/safe-action'

import {
  contactSchema,
  projectSchema,
  registerSchema,
  profileSchema,
  feedbackSchema,
  teamInviteSchema,
} from '@/lib/validations/common'

// Project creation action using next-safe-action
export const createProject = action
  .schema(projectSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual database operation
    // For now, simulate a successful creation
    await new Promise(resolve => setTimeout(resolve, 1000))

    const project = {
      id: Math.random().toString(36).substring(2, 11),
      ...parsedInput,
      createdAt: new Date(),
    }

    // Revalidate the projects page
    revalidatePath('/projects')

    return project
  })

// Contact form submission action using next-safe-action
export const submitContact = action
  .schema(contactSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual email sending or database storage
    // For now, simulate a successful submission
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('Contact form submitted:', parsedInput)

    return { message: '문의가 성공적으로 전송되었습니다.' }
  })

// User registration action using next-safe-action
export const registerUser = action
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual user creation logic
    // For now, simulate a successful registration
    await new Promise(resolve => setTimeout(resolve, 1000))

    const user = {
      id: Math.random().toString(36).substring(2, 11),
      name: parsedInput.name,
      email: parsedInput.email,
      createdAt: new Date(),
    }

    return user
  })

// Profile update action using next-safe-action
export const updateProfile = action
  .schema(profileSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual profile update logic
    await new Promise(resolve => setTimeout(resolve, 800))

    revalidatePath('/profile')

    return parsedInput
  })

// Feedback submission action using next-safe-action
export const submitFeedback = action
  .schema(feedbackSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual feedback storage logic
    await new Promise(resolve => setTimeout(resolve, 1200))

    const feedback = {
      id: Math.random().toString(36).substring(2, 11),
      ...parsedInput,
      createdAt: new Date(),
      status: 'pending',
    }

    return feedback
  })

// Team invite action using next-safe-action
export const inviteTeamMember = action
  .schema(teamInviteSchema)
  .action(async ({ parsedInput }) => {
    // TODO: Replace with actual team invite logic
    await new Promise(resolve => setTimeout(resolve, 1000))

    const invite = {
      id: Math.random().toString(36).substring(2, 11),
      ...parsedInput,
      status: 'pending',
      createdAt: new Date(),
    }

    return invite
  })
