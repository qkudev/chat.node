import { Request, Response, NextFunction } from 'express'

interface XError extends Error {
  code?: number
  name: string
  message: string
}

export default function (err: XError, req: Request, res: Response, next: NextFunction) {
  if (!err) return next()

  switch (err.name) {
    case 'BadRequest': {
      res.status(400).json({ code: 400, message: err.message || 'BAD_REQUEST' })
      break
    }
    case 'Unauthorized': {
      res.status(401).json({ code: 401, message: err.message || 'UNAUTHORIZED' })
      break
    }
    case 'Forbidden': {
      res.status(403).json({ code: 403, message: err.message || 'FORBIDDEN' })
      break
    }
    case 'NotFound': {
      res.status(404).json({ code: 404, message: err.message || 'NOT_FOUND' })
      break
    }
    default:
      res.status(err.code || 500).json({
        code: err.code || 500,
        message: err.message || 'INTERNAL_SERVER_ERROR'
      })
  }

  console.error(JSON.stringify(err))
  return next(err)
}
