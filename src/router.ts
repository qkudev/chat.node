import { NextFunction, Router, Request, Response } from 'express'
import SwaggerUi from 'swagger-ui-express'

import docs from './swagger.json'
import { errorHandler } from './middlewares'
import * as User from './services/user'
import { PUBLIC_KEY, PRIME, GENERATOR, PRIME_LENGTH, ENCODING } from './utils/constants'

const settings = {
  public_key: PUBLIC_KEY,
  prime: PRIME,
  length: PRIME_LENGTH,
  generator: GENERATOR,
  encoding: ENCODING
}

const router = Router()

router.use('/swagger', SwaggerUi.serve)
router.get('/swagger', SwaggerUi.setup(docs))

router.use('', User.router)

router.get('/settings', function (req: Request, res: Response, next: NextFunction) {
  res.status(200).json({ ...settings })
  return next()
})

router.use(errorHandler)

export default router
