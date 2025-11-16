import mongoose, { Document, Schema, Model } from 'mongoose';
import { createBaseSchema } from '@/abstracts/absBase.model';

// Define the RentalProperty document interface
export interface IRentalModel extends Document {
  userId: mongoose.Types.ObjectId;
  roomCode: string; // Mã phòng
  propertyName: string; // Tên phòng
  address?: string; // Địa chỉ
  initialElectricityReading: number; // Chỉ số điện ban đầu
  initialWaterReading: number; // Chỉ số nước ban đầu
  electricityRate: number; // Đơn giá điện
  waterRate: number; // Đơn giá nước
  rentAmount: number; // Tiền nhà cố định hàng tháng
  internetFee?: number; // Phí internet cố định
  parkingFee?: number; // Phí gửi xe cố định
  garbageFee?: number; // Phí rác cố định
  startDate: Date; // Ngày bắt đầu thuê
  endDate?: Date; // Ngày kết thúc thuê (nếu đã trả phòng)
  isActive: boolean; // Còn đang thuê hay không
  notes?: string; // Ghi chú
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  isDeleted?: boolean;
}

// Create the schema
const rentalSchema = createBaseSchema<IRentalModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    roomCode: {
      type: String,
      required: [true, 'Room code is required'],
      trim: true,
      maxlength: [50, 'Room code cannot exceed 50 characters']
    },
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
      maxlength: [200, 'Property name cannot exceed 200 characters']
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters']
    },
    initialElectricityReading: {
      type: Number,
      required: [true, 'Initial electricity reading is required'],
      min: [0, 'Initial electricity reading cannot be negative'],
      default: 0
    },
    initialWaterReading: {
      type: Number,
      required: [true, 'Initial water reading is required'],
      min: [0, 'Initial water reading cannot be negative'],
      default: 0
    },
    electricityRate: {
      type: Number,
      required: [true, 'Electricity rate is required'],
      min: [0, 'Electricity rate cannot be negative'],
      default: 0
    },
    waterRate: {
      type: Number,
      required: [true, 'Water rate is required'],
      min: [0, 'Water rate cannot be negative'],
      default: 0
    },
    rentAmount: {
      type: Number,
      required: [true, 'Rent amount is required'],
      min: [0, 'Rent amount cannot be negative'],
      default: 0
    },
    internetFee: {
      type: Number,
      min: [0, 'Internet fee cannot be negative'],
      default: 0
    },
    parkingFee: {
      type: Number,
      min: [0, 'Parking fee cannot be negative'],
      default: 0
    },
    garbageFee: {
      type: Number,
      min: [0, 'Garbage fee cannot be negative'],
      default: 0
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    softDelete: true,
    auditFields: true,
    schemaOptions: {
      collection: 'rental'
    }
  }
);

// Add indexes
rentalSchema.index({ userId: 'ascending', isActive: 'descending', createdAt: 'descending' });
rentalSchema.index({ userId: 'ascending', roomCode: 'ascending' });

// Add static methods
rentalSchema.statics.findByUserId = async function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, isDeleted: { $ne: true } })
    .sort({ isActive: -1, createdAt: -1 });
};

rentalSchema.statics.findActiveProperties = async function (userId: mongoose.Types.ObjectId) {
  return this.find({ userId, isActive: true, isDeleted: { $ne: true } })
    .sort({ createdAt: -1 });
};

// Define static methods interface
export interface IRentalStatic extends Model<IRentalModel> {
  findByUserId(userId: mongoose.Types.ObjectId): Promise<IRentalModel[]>;
  findActiveProperties(userId: mongoose.Types.ObjectId): Promise<IRentalModel[]>;
}

// Export the model
const Rental: IRentalStatic =
  mongoose.models.Rental as IRentalStatic ||
  mongoose.model<IRentalModel, IRentalStatic>('Rental', rentalSchema);

export default Rental;
