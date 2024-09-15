import { db } from '@/db'
import { goalCompletions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { and, count, eq, gte, lte, sql } from 'drizzle-orm'

dayjs.extend(weekOfYear)

export async function getWeekPendingGoalUseCase() {
  const lastDayOfWeek = dayjs().endOf('week').toDate()
  const firstDayOfWeek = dayjs().startOf('week').toDate()

  const goalsCreateUpWeek = db.$with('goals_create_up_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, lastDayOfWeek))
  )

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as('completionCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const pendingGoal = await db
    .with(goalsCreateUpWeek, goalCompletionCounts)
    .select({
      id: goalsCreateUpWeek.id,
      title: goalsCreateUpWeek.title,
      desiredWeeklyFrequency: goalsCreateUpWeek.desiredWeeklyFrequency,
      completionCount: sql /*sql*/`
        COALESCE(${goalCompletionCounts.completionCount}, 0 ) `.mapWith(Number),
    })
    .from(goalsCreateUpWeek)
    .leftJoin(
      goalCompletionCounts,
      eq(goalCompletionCounts.goalId, goalsCreateUpWeek.id)
    )

  return {
    pendingGoal,
  }
}
