import { Document, model as Model, Schema } from 'mongoose'
import paginate from 'mongoose-paginate'
import crypto from 'crypto'
import { GENERATOR, PRIME } from '../../utils'
import { authenticator } from 'otplib'

export interface IUser extends Document {
  createdAt: Date
  updatedAt: Date

  otp: string
  prime?: string
  generator?: string

  generateOtp: () => string
}

export const schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true,
      validate: /[a-fA-F0-9]{64}$/,
      lowercase: true
    },
    generator: {
      type: String,
      required: true,
      default: GENERATOR
    },
    prime: {
      type: String,
      required: true,
      default: PRIME
    },
    otp: {
      type: String,
      required: true,
      // 64-length hex string
      default: () => crypto.randomBytes(32).toString('hex')
    }
  },
  {
    timestamps: true,
    id: false,
    _id: false,
    autoIndex: false
  }
)

schema.plugin(paginate)

schema.methods.generateOtp = function () {
  const user = this as IUser
  return authenticator.generate(user.otp)
}

export const model = Model<IUser>('User', schema)
