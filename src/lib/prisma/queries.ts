import { prisma } from './client'
import type { User, Project, Phase } from '@prisma/client'

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
        phases: true,
      },
    })
  },

  async findByUserId(userId: string): Promise<Project[]> {
    return prisma.project.findMany({
      where: { userId },
      include: {
        phases: true,
      },
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
        phases: true,
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
        phases: true,
      },
    })
  },

  async deleteProject(id: string): Promise<Project> {
    return prisma.project.delete({
      where: { id },
    })
  },
}

// Phase queries
export const phaseQueries = {
  async findById(id: string): Promise<Phase | null> {
    return prisma.phase.findUnique({
      where: { id },
      include: {
        project: true,
      },
    })
  },

  async findByProjectId(projectId: string): Promise<Phase[]> {
    return prisma.phase.findMany({
      where: { projectId },
      orderBy: {
        createdAt: 'asc',
      },
    })
  },

  async createPhase(data: {
    title: string
    description?: string
    projectId: string
  }): Promise<Phase> {
    return prisma.phase.create({
      data,
      include: {
        project: true,
      },
    })
  },

  async updatePhase(
    id: string,
    data: Partial<Pick<Phase, 'title' | 'description'>>
  ): Promise<Phase> {
    return prisma.phase.update({
      where: { id },
      data,
      include: {
        project: true,
      },
    })
  },

  async deletePhase(id: string): Promise<Phase> {
    return prisma.phase.delete({
      where: { id },
    })
  },
}

// Generic queries
export const genericQueries = {
  async count(model: 'user' | 'project' | 'phase'): Promise<number> {
    switch (model) {
      case 'user':
        return prisma.user.count()
      case 'project':
        return prisma.project.count()
      case 'phase':
        return prisma.phase.count()
      default:
        throw new Error(`Unknown model: ${model}`)
    }
  },

  async exists(
    model: 'user' | 'project' | 'phase',
    id: string
  ): Promise<boolean> {
    let result
    switch (model) {
      case 'user':
        result = await prisma.user.findUnique({ where: { id } })
        break
      case 'project':
        result = await prisma.project.findUnique({ where: { id } })
        break
      case 'phase':
        result = await prisma.phase.findUnique({ where: { id } })
        break
      default:
        throw new Error(`Unknown model: ${model}`)
    }
    return result !== null
  },
}
