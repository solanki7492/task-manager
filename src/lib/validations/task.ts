import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').max(200, 'Title must be 200 characters or less'),
})

export const taskQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['all', 'pending', 'completed']).optional().default('all'),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type TaskQueryInput = z.infer<typeof taskQuerySchema>
