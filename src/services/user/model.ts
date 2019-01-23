import { Document, Schema, model as Model } from 'mongoose'
import paginate from 'mongoose-paginate'
const otplib = require('otplib')

import { PRIME, GENERATOR } from '../../utils/constants'
import { redis } from '../../index'

export interface IUser extends Document {
  createdAt: Date
  updatedAt: Date

  username?: string
  otp?: string
  prime?: string
  generator?: string
}

export const schema = new Schema(
  {
    _id: {
      type: String,
      required: true,
      unique: true
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
      default: otplib.authenticator.generateSecret
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

export const model = Model<IUser>('User', schema)
