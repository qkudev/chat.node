import { NextFunction, Request, Response, Router } from 'express'
import { model as UserModel } from './model'

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

router.get('', list)
router.get('/:userId', userById)
