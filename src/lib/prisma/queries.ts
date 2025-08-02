import { userRepository, projectRepository } from '@/lib/repositories'
import type { User, Project } from '@prisma/client'

// User queries - 이제 Repository 패턴을 사용합니다
export const userQueries = {
  async findById(id: string): Promise<User | null> {
    return userRepository.findById(id)
  },

  async findByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email)
  },

  async createUser(data: {
    name?: string
    email: string
    image?: string
  }): Promise<User> {
    return userRepository.create(data)
  },

  async updateUser(
    id: string,
    data: Partial<Pick<User, 'name' | 'email' | 'image'>>
  ): Promise<User> {
    return userRepository.update(id, data)
  },

  async deleteUser(id: string): Promise<User> {
    return userRepository.delete(id)
  },
}

// Project queries - 이제 Repository 패턴을 사용합니다
export const projectQueries = {
  async findById(id: string): Promise<Project | null> {
    return projectRepository.findById(id, {
      user: true,
    })
  },

  async findByUserId(userId: string): Promise<Project[]> {
    return projectRepository.findMany({
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
    return projectRepository.create(
      {
        title: data.title,
        description: data.description,
        user: {
          connect: { id: data.userId },
        },
      },
      {
        user: true,
      }
    )
  },

  async updateProject(
    id: string,
    data: Partial<Pick<Project, 'title' | 'description'>>
  ): Promise<Project> {
    return projectRepository.update(id, data, {
      user: true,
    })
  },

  async deleteProject(id: string): Promise<Project> {
    return projectRepository.delete(id)
  },
}

// Generic queries - 이제 Repository 패턴을 사용합니다
export const genericQueries = {
  async count(model: 'user' | 'project'): Promise<number> {
    switch (model) {
      case 'user':
        return userRepository.count()
      case 'project':
        return projectRepository.count()
      default:
        throw new Error(`Unknown model: ${model}`)
    }
  },

  async exists(model: 'user' | 'project', id: string): Promise<boolean> {
    switch (model) {
      case 'user':
        return userRepository.exists({ id })
      case 'project':
        return projectRepository.exists({ id })
      default:
        throw new Error(`Unknown model: ${model}`)
    }
  },
}
