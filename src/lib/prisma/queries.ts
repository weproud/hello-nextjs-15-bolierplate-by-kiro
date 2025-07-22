import { prisma } from './client'
import type { User, Project } from '@prisma/client'

// User queries
export const userQueries = {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    })
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  async createUser(data: {
    name?: string
    email: string
    image?: string
  }): Promise<User> {
    return prisma.user.create({
      data,
    })
  },

  async updateUser(
    id: string,
    data: Partial<Pick<User, 'name' | 'email' | 'image'>>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    })
  },

  async deleteUser(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    })
  },
}

// Project queries
export const projectQueries = {
  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
      include: {
        user: true,
      },
    })
  },

  async findByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
    })
  },

  async createProject(data: {
    title: string
    description?: string
    userId: string
  }): Promise<Project> {
    return prisma.project.create({
      data,
      include: {
        user: true,
      },
    })
  },

  async updateProject(
    id: string,
    data: Partial<Pick<Project, 'title' | 'description'>>
  ): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        user: true,
      },
    })
  },

  async deleteProject(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    })
  },
}

// Generic queries
export const genericQueries = {
  async count(model: 'user' | 'project'): Promise<number> {
    switch (model) {
      case 'user':
        return prisma.user.count()
      case 'project':
        return prisma.project.count()
      default:
        throw new Error(`Unknown model: ${model}`)
    }
  },

  async exists(model: 'user' | 'project', id: string): Promise<boolean> {
    let result
    switch (model) {
      case 'user':
        result = await prisma.user.findUnique({ where: { id } })
        break
      case 'project':
        result = await prisma.project.findUnique({ where: { id } })
        break
      default:
        throw new Error(`Unknown model: ${model}`)
    }
    return result !== null
  },
}
