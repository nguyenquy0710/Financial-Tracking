import { Schema } from 'mongoose';

export default function softDeletePlugin(schema: Schema) {
  // Mặc định thêm isDeleted: false vào các truy vấn .find(), .count(), v.v.
  const applyNotDeletedFilter = function (this: any, next: Function) {
    if (!this.getQuery().hasOwnProperty('isDeleted')) {
      this.where({ isDeleted: false });
    }
    next();
  };

  schema.pre('find', applyNotDeletedFilter);
  schema.pre('findOne', applyNotDeletedFilter);
  schema.pre('countDocuments', applyNotDeletedFilter);
  schema.pre('findOneAndUpdate', applyNotDeletedFilter); // Optional

  // Tùy chọn thêm: một method để "xóa mềm"
  schema.methods.softDelete = async function () {
    this.isDeleted = true;
    await this.save();
  };
}
