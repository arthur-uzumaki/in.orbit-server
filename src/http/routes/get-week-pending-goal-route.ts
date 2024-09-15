import { getWeekPendingGoalUseCase } from '@/use-cases/get-week-pending-goal-use-case'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getWeekPendingGoalRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/pending-goals',
    {
      schema: {
        summary: 'get-week-pending-goal',
        tags: ['goal'],
      },
    },
    async () => {
      const { pendingGoal } = await getWeekPendingGoalUseCase()
      return {
        pendingGoal,
      }
    }
  )
}
