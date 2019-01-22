import { Document, Schema, model as Model } from 'mongoose'
import paginate from 'mongoose-paginate'

export interface IUser extends Document {
  createdAt: Date
  updatedAt: Date
}

export const schema = new Schema({
  _id: {
    type: String,
    required: true,
    unique: true
  }
},
  {
    timestamps: true,
    id: false,
    _id: false,
    autoIndex: false
  })

schema.plugin(paginate)

export const model = Model<IUser>('User', schema)
