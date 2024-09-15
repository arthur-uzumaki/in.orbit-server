import fastify from 'fastify'
import cors from '@fastify/cors'
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
} from 'fastify-type-provider-zod'
import { createGoalRoute } from './routes/create-goal-route'
import { getWeekPendingGoalRoute } from './routes/get-week-pending-goal-route'
import { createGoalCompletionRoute } from './routes/create-goal-completion-route'
import { getWeekSummaryRoute } from './routes/get-week-summary-route'
import { env } from '@/env'

import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { erroHandle } from '@/erro-handle'

const app = fastify()

app.register(fastifySwagger, {
  swagger: {
    consumes: ['application/json'],
    produces: ['application/json'],
    info: {
      title: 'In.orbit',
      description: 'Especificação da API para o back-en aplicação In.orbit',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(fastifySwaggerUi, {
  prefix: '/docs',
})

app.setErrorHandler(erroHandle)

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(cors, {
  origin: env.BASE_URL_WEB,
  methods: ['GET', 'POST'],
})

app.register(createGoalRoute)
app.register(getWeekPendingGoalRoute)
app.register(createGoalCompletionRoute)
app.register(getWeekSummaryRoute)

app
  .listen({
    port: 3333,
    host: '0.0.0.0',
  })
  .then(() => {
    console.log('Running http://localhost:3333')
  })
