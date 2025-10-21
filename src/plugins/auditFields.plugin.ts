import { Schema } from 'mongoose';

export default function auditFieldsPlugin(schema: Schema) {
  // Gán createdBy khi tạo
  schema.pre('save', function (next) {
    if (this.isNew && this._userId) {
      this.createdBy = this._userId;
    }
    this.updatedBy = this._userId;
    next();
  });

  // Hỗ trợ update với context truyền vào
  schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
    const userId = this.getOptions()?.userId;
    if (userId) {
      this.set({ updatedBy: userId });
    }
    next();
  });
}
