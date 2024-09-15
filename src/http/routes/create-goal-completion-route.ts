import type { FastifyInstance } from 'fastify'

import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import z from 'zod'
import { createGoalCompletionUseCase } from '@/use-cases/create-goal-completion-use-case'

export async function createGoalCompletionRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/completions',
    {
      schema: {
        summary: 'create-goal-completion',
        tags: ['goal'],
        body: z.object({
          goalId: z.string().cuid2(),
        }),
      },
    },
    async (request, replay) => {
      const { goalId } = request.body

      await createGoalCompletionUseCase({
        goalId,
      })

      replay.status(204)
    }
  )
}
