import { NextRequest, NextResponse } from 'next/server'
import { GET, POST } from '@/app/api/tasks/route'
import { PATCH } from '@/app/api/tasks/[id]/toggle/route'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

// Mock NextResponse.json to return a proper testable response
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: (body: any, init?: ResponseInit) => ({
      json: async () => body,
      status: init?.status || 200,
      statusText: init?.statusText || '',
      headers: new Headers(init?.headers),
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    }),
  },
}));

// Create a helper function to create mock NextRequest
function createMockNextRequest(url: string, init?: RequestInit): any {
  const urlObj = new URL(url);
  return {
    url,
    nextUrl: urlObj,
    method: init?.method || 'GET',
    headers: new Headers(init?.headers),
    json: async () => {
      if (init?.body && typeof init.body === 'string') {
        return JSON.parse(init.body);
      }
      return {};
    },
  };
}

jest.mock('@/lib/prisma', () => ({
  prisma: {
    task: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
  },
}

describe('Tasks API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/tasks', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/tasks')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should fetch tasks with pagination', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockTasks = [
        { id: '1', title: 'Task 1', done: false, createdAt: new Date(), userId: 'user-123' },
        { id: '2', title: 'Task 2', done: true, createdAt: new Date(), userId: 'user-123' },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.task.count as jest.Mock).mockResolvedValue(2)

      const request = createMockNextRequest('http://localhost:3000/api/tasks?page=1&pageSize=10')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toEqual(mockTasks)
      expect(data.page).toBe(1)
      expect(data.pageSize).toBe(10)
      expect(data.total).toBe(2)
      expect(data.totalPages).toBe(1)
    })

    it('should filter tasks by search query', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockTasks = [
        { id: '1', title: 'Important task', done: false, createdAt: new Date(), userId: 'user-123' },
      ]

      ;(prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks)
      ;(prisma.task.count as jest.Mock).mockResolvedValue(1)

      const request = createMockNextRequest('http://localhost:3000/api/tasks?q=important')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.items).toHaveLength(1)
      expect(prisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'important', mode: 'insensitive' },
          }),
        })
      )
    })
  })

  describe('POST /api/tasks', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'New task' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should create a new task', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockTask = {
        id: '1',
        title: 'New task',
        done: false,
        createdAt: new Date(),
        userId: 'user-123',
      }

      ;(prisma.task.create as jest.Mock).mockResolvedValue(mockTask)

      const request = createMockNextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: 'New task' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toEqual(mockTask)
    })

    it('should return 400 for empty title', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const request = createMockNextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: '' }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input')
    })

    it('should return 400 for title exceeding 200 characters', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const longTitle = 'a'.repeat(201)
      const request = createMockNextRequest('http://localhost:3000/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title: longTitle }),
      })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid input')
    })
  })

  describe('PATCH /api/tasks/[id]/toggle', () => {
    it('should return 401 if user is not authenticated', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/tasks/1/toggle', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 404 if task does not exist', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)
      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(null)

      const request = createMockNextRequest('http://localhost:3000/api/tasks/1/toggle', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Task not found')
    })

    it('should return 403 if task belongs to different user', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockTask = {
        id: '1',
        title: 'Task 1',
        done: false,
        createdAt: new Date(),
        userId: 'different-user-id',
      }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)

      const request = createMockNextRequest('http://localhost:3000/api/tasks/1/toggle', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })

    it('should toggle task done status', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(mockSession)

      const mockTask = {
        id: '1',
        title: 'Task 1',
        done: false,
        createdAt: new Date(),
        userId: 'user-123',
      }

      const updatedTask = { ...mockTask, done: true }

      ;(prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask)
      ;(prisma.task.update as jest.Mock).mockResolvedValue(updatedTask)

      const request = createMockNextRequest('http://localhost:3000/api/tasks/1/toggle', {
        method: 'PATCH',
      })
      const response = await PATCH(request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.done).toBe(true)
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { done: true },
      })
    })
  })
})
