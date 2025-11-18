import mongoose, { Document, Schema, Model, Types } from 'mongoose';

import auditFieldsPlugin from '@/plugins/auditFields.plugin';
import softDeletePlugin from '@/plugins/mongooseSoftDelete.plugin';

// Giao diện cơ bản cho mọi model
export default interface IAbsBaseModel extends Document {
  // Thời gian tạo và cập nhật
  createdAt?: Date;
  updatedAt?: Date;

  // Thông tin người tạo và người cập nhật
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;

  // Trạng thái xóa mềm
  isDeleted?: boolean;
}

// Tùy chọn thêm cho schema
interface BaseSchemaOptions {
  softDelete?: boolean; // Có bật xóa mềm không
  auditFields?: boolean; // Có thêm trường audit không
  schemaOptions?: Record<string, any>; // Cho phép ghi đè options của mongoose.Schema
  customToObject?: (obj: any) => any; // Cho phép truyền vào hàm xử lý override khi gọi .toObjectCustom()
  toJSON?: Record<string, any>; // Tùy chọn toJSON của schema
  toObject?: Record<string, any>; // Tùy chọn toObject của schema
  [key: string]: any; // Các tùy chọn khác
}

// Hàm tạo schema cơ bản tùy biến
export function createBaseSchema<T extends Document = IAbsBaseModel>(
  definition: Record<string, any>,
  options: BaseSchemaOptions = {}
): Schema<T> {
  const { softDelete = true, auditFields = false, schemaOptions = {}, customToObject,
    toJSON = {},
    toObject = {},
    ...selfOptions
  } = options;

  // Kết hợp các options schema mặc định và tùy chỉnh từ tham số
  Object.assign(schemaOptions, {
    // Mặc định luôn có timestamps
    timestamps: true,
  });

  // Kết hợp các options schema
  if (toJSON !== undefined && Object.keys(toJSON).length > 0)
    Object.assign(schemaOptions, { toJSON });

  if (toObject !== undefined && Object.keys(toObject).length > 0)
    Object.assign(schemaOptions, { toObject });

  // Thêm các trường option
  const extraFields: Record<string, any> = {};

  // Trường xóa mềm
  if (softDelete) {
    // extraFields.isDeleted = { type: Boolean, default: false };
    Object.assign(extraFields, { isDeleted: { type: Boolean, default: false } });
  }

  // Thông tin người tạo và người cập nhật
  if (auditFields) {
    // extraFields.createdBy = { type: Types.ObjectId, ref: 'User', default: null };
    // extraFields.updatedBy = { type: Types.ObjectId, ref: 'User', default: null };

    Object.assign(extraFields, {
      createdBy: { type: Types.ObjectId, ref: 'User', default: null },
      updatedBy: { type: Types.ObjectId, ref: 'User', default: null },
    });
  }

  // Kết hợp định nghĩa schema với các trường bổ sung này vào definition ban đầu
  Object.assign(definition, extraFields);

  // Tạo schema với các trường bổ sung
  const schema = new Schema<T>(
    {
      ...definition,
    },
    {
      ...schemaOptions,
    }
  );

  // Gắn plugins tương ứng
  if (softDelete) schema.plugin(softDeletePlugin);
  if (auditFields) schema.plugin(auditFieldsPlugin);

  // Mặc định xử lý khi gọi .toObjectCustom()
  schema.method('toObjectCustom', function (this: T) {
    let obj = this.toObject({ virtuals: true });

    // Chuyển _id → id
    obj.id = obj._id?.toString?.();
    delete obj._id;

    // Xóa các field mặc định
    delete obj.__v;
    delete obj.isDeleted;
    delete obj.createdBy;
    delete obj.updatedBy;

    // Gọi hàm override nếu có
    if (typeof customToObject === 'function') {
      obj = customToObject(obj);
    }

    return obj;
  });

  return schema;
}
