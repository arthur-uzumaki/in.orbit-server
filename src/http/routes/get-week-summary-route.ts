import { getWeekSummary } from '@/use-cases/get-week-summary-use-case'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

export async function getWeekSummaryRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/summary',
    {
      schema: {
        summary: 'get-week-summary',
        tags: ['goal'],
      },
    },
    async () => {
      const { summary } = await getWeekSummary()

      return {
        summary,
      }
    }
  )
}
