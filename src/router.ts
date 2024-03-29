import { NextFunction, Request, Response, Router } from 'express'
import SwaggerUi from 'swagger-ui-express'

import docs from './swagger.json'
import { errorHandler } from './middlewares'
import * as User from './services/user'
import { ENCODING, GENERATOR, PRIME, PRIME_LENGTH, PUBLIC_KEY, validateHexKey, cipher, AES256 } from './utils'

async function signUp (req: Request, res: Response, next: NextFunction) {
  const value = req.body.pub_key
  const secretHex = cipher.computeSecret(value, 'hex', 'hex')

  if (!validateHexKey(value)) {
    return next({ name: 'BadRequest', message: 'BAD_PUBLIC_KEY' })
  }

  try {
    if (await User.model.findById(value)) {
      return next({ name: 'BadRequest', message: 'PUBLIC_KEY_ALREADY_IN_USE' })
    }

    const user = await User.model.create({ _id: value })
    if (!user) {
      return next({ name: 'InternalServerError' })
    }

    const data = {
      user: user.toJSON(),
      server_public_key: {
        value: PUBLIC_KEY,
        prime: PRIME,
        length: PRIME_LENGTH
      }
    }
    const encrypted = AES256.encrypt(secretHex, JSON.stringify(data))
    res.status(201).json({ user: user.toJSON() })
    return next()
  } catch (e) {
    return next(e)
  }
}

function getSettings (req: Request, res: Response, next: NextFunction) {
  res.status(200).json({ ...settings })
  return next()
}

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

router.use('/users', User.router)
router.post('/auth/signup', signUp)
router.get('/settings', getSettings)
router.post('/test', (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  res.status(200).end()
})

router.use(errorHandler)

export default router
