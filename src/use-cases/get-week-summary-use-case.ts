import { db } from '@/db'
import { goalCompletions, goals } from '@/db/schema'
import dayjs from 'dayjs'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

export async function getWeekSummary() {
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

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql /*sql*/`
          DATE(${goalCompletions.createdAt})
        `.as('completedAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  )

  const goalsCompleteByWeekDay = db.$with('goals_complete_by_week_day').as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql /* sql */`
            JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', ${goalsCompletedInWeek.id},
                'title', ${goalsCompletedInWeek.title},
                'completedAt', ${goalsCompletedInWeek.completedAt}
                
              )
            )
        `.as('completions'),
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
  )

  type GoalsPerDay = Record<
    string,
    {
      id: string
      title: string
      completedAt: string
    }[]
  >

  const result = await db
    .with(goalsCreateUpWeek, goalsCompletedInWeek, goalsCompleteByWeekDay)
    .select({
      completed:
        sql /* sql */`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
          Number
        ),
      total:
        sql /* sql */`(SELECT SUM(${goalsCreateUpWeek.desiredWeeklyFrequency}) FROM ${goalsCreateUpWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql /* sql */<GoalsPerDay>`JSON_OBJECT_AGG(
        ${goalsCompleteByWeekDay.completedAtDate},
        ${goalsCompleteByWeekDay.completions}
      ) `,
    })
    .from(goalsCompleteByWeekDay)

  return {
    summary: result[0],
  }
}
