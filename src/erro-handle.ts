import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'
import { ClientErro } from './use-cases/_erros/client-erro'

type FastifyErroHandle = FastifyInstance['errorHandler']

export const erroHandle: FastifyErroHandle = (error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Error during validation',
      error: error.flatten().fieldErrors,
    })
  }

  if (error instanceof ClientErro) {
    return reply.status(400).send({
      error: error.message,
    })
  }

  return reply.status(500).send({ message: 'Internal serve error' })
}
