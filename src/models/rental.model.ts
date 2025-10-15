import mongoose, { Document, Schema, Model } from 'mongoose';

// 1. Define nested interfaces for electricity, water, etc.
interface UtilityUsage {
  startReading: number;
  endReading: number;
  consumption: number;
  rate: number;
  amount: number;
}

// 2. Define the Rental document interface
export interface IRentalModel extends Document {
  userId: mongoose.Types.ObjectId;
  propertyName: string;
  address?: string;
  month: Date;
  rentAmount: number;
  electricity: UtilityUsage;
  water: UtilityUsage;
  internet: number;
  parking: number;
  garbage: number;
  bonus: number;
  total: number;
  notes?: string;
  isPaid: boolean;
  paymentDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// 3. Define the schema
const RentalSchema = new Schema<IRentalModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    propertyName: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    month: {
      type: Date,
      required: true
    },
    rentAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    electricity: {
      startReading: { type: Number, default: 0 },
      endReading: { type: Number, default: 0 },
      consumption: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    water: {
      startReading: { type: Number, default: 0 },
      endReading: { type: Number, default: 0 },
      consumption: { type: Number, default: 0 },
      rate: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    internet: {
      type: Number,
      default: 0
    },
    parking: {
      type: Number,
      default: 0
    },
    garbage: {
      type: Number,
      default: 0
    },
    bonus: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    },
    notes: {
      type: String
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paymentDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// 4. Add indexes
RentalSchema.index({ userId: 'ascending', month: 'descending' });
RentalSchema.index({ userId: 'ascending', propertyName: 'ascending', month: 'descending' });

// 5. Export the model
const Rental: Model<IRentalModel> = mongoose.models.Rental as Model<IRentalModel>
  || mongoose.model<IRentalModel>('Rental', RentalSchema);
export default Rental;
