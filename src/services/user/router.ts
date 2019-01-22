import { Router, Request, Response, NextFunction } from 'express'

import * as Key from './controllers'
import { model as KeyModel } from './model'

async function signUp (req: Request, res: Response, next: NextFunction) {
  const value  = req.body.pub_key as string

  try {
    const key = await Key.create(value)
    if (!key) return next({ name: 'BadRequest', message: 'KEY_ALREADY_EXISTS'})

    res.status(201).json({ key })
    return next()
  } catch (e) {
    return next(e)
  }
}

async function list (req: Request, res: Response, next: NextFunction) {
  const { page, limit } = req.query

  try {
    const result = await KeyModel.find({})
    res.status(200).json({ page: result })
    return next()
  } catch (e) {
    return next(e)
  }
}

export const router = Router()
router.post('/auth/signup', signUp)
router.get('/users', list)
