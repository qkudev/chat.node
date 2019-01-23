// Returns true if string is hex-string and it's length is 512, false otherwise
export function validateHexKey (key: string): boolean {
  return /[a-fA-F0-9]{512}$/.test(key)
}

export function XError (code: number, message?: string) {
  let name = 'InternalServerError'
  let defaultMessage = 'INTERNAL_SERVER_ERROR'

  switch (code) {
    case 400: {
      name = 'BadRequestError'
      defaultMessage = 'BAD_REQUEST'
      break
    }
    case 401: {
      name = 'UnauthorizedError'
      defaultMessage = 'UNAUTHORIZED'
      break
    }
    case 402: {
      name = 'PaymentRequiredError'
      defaultMessage = 'PAYMENT_REQUIRED'
      break
    }
    case 403: {
      name = 'ForbiddenError'
      defaultMessage = 'FORBIDDEN'
      break
    }
    case 404: {
      name = 'NotFoundError'
      defaultMessage = 'NOT_FOUND'
      break
    }
    case 405: {
      name = 'MethodNotAllowedError'
      defaultMessage = 'METHOD_NOT_ALLOWED'
      break
    }
    case 419: {
      name = 'SessionExpirationError'
      defaultMessage = 'TOKEN_EXPIRED'
      break
    }
  }
  return {
    code,
    message: message || defaultMessage,
    name
  }
}
