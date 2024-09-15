import type { FastifyInstance } from 'fastify'

import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { createGoalUseCases } from '@/use-cases/create-goal-use-case'

export async function createGoalRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/goals',
    {
      schema: {
        summary: 'create-goal',
        tags: ['goal'],
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7),
        }),
        response: {
          201: z.object({
            goalId: z.string().cuid2(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, desiredWeeklyFrequency } = request.body

      const result = await createGoalUseCases({
        title,
        desiredWeeklyFrequency,
      })

      reply.status(201).send({ goalId: result.goal.id })
    }
  )
}
