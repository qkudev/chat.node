import { Router, Request, Response, NextFunction } from 'express'

import * as User from './controllers'
import { model as UserModel } from './model'
import { XError } from '../../utils'

async function signUp (req: Request, res: Response, next: NextFunction) {
  const value = req.body.pub_key
  const { username } = req.body
  if (!value) {
    return next(XError(400, 'PUB_KEY_IS_REQUIRED'))
  }

  try {
    const user = await UserModel.create({ _id: value, username })
    if (!user) {
      return next(XError(400, 'KEY_ALREADY_USED'))
    }

    res.status(201).json({ user })
    return next()
  } catch (e) {
    return next(e)
  }
}

async function list (req: Request, res: Response, next: NextFunction) {
  try {
    const result = await UserModel.find({})
    res.status(200).json({ page: result })
    return next()
  } catch (e) {
    return next(e)
  }
}

async function userById (req: Request, res: Response, next: NextFunction) {
  const { userId } = req.params

  try {
    const user = await UserModel.findById(userId)
    res.status(200).json({ user })
    return next()
  } catch (e) {
    return next(e)
  }
}

export const router = Router()

router.post('/auth/signup', signUp)
router.get('/users', list)
router.get('/:userId', userById)
