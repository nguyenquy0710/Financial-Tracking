import AbsBaseDomain from '@/abstracts/absBase.domain';
import RentalPropertySchema, { IRentalModel } from '@/models/rental.model';
import { Types } from 'mongoose';

export default class RentalPropertyDomain extends AbsBaseDomain {

  constructor() {
    super();
  }

  protected onDestroy(): void {
    this.logger.info(`${this.constructor.name} cleaned up resources`);
  }

  /**
   * Get rental property by ID
   */
  async getRentalPropertyById(id: string): Promise<IRentalModel | null> {
    try {
      const property = await RentalPropertySchema.findById(id).lean<IRentalModel>().exec();
      return property as IRentalModel | null;
    } catch (error) {
      this.logger.error('Error retrieving rental property by ID:', error);
      return null;
    }
  }

  /**
   * Get all rental properties for a user
   */
  async getRentalPropertiesByUserId(userId: string | Types.ObjectId): Promise<IRentalModel[]> {
    try {
      const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const properties = await RentalPropertySchema.findByUserId(userObjectId);
      return properties as IRentalModel[];
    } catch (error) {
      this.logger.error('Error retrieving rental properties by user ID:', error);
      return [];
    }
  }

  /**
   * Get active rental properties for a user
   */
  async getActiveRentalProperties(userId: string | Types.ObjectId): Promise<IRentalModel[]> {
    try {
      const userObjectId = typeof userId === 'string' ? new Types.ObjectId(userId) : userId;
      const properties = await RentalPropertySchema.findActiveProperties(userObjectId);
      return properties as IRentalModel[];
    } catch (error) {
      this.logger.error('Error retrieving active rental properties:', error);
      return [];
    }
  }

  /**
   * Create a new rental property
   */
  async createRentalProperty(data: Partial<IRentalModel>): Promise<IRentalModel> {
    const property = new RentalPropertySchema(data);
    await property.save();
    return property.toObject() as unknown as IRentalModel;
  }

  /**
   * Update a rental property
   */
  async updateRentalProperty(id: string, data: Partial<IRentalModel>): Promise<IRentalModel | null> {
    const property = await RentalPropertySchema.findByIdAndUpdate(id, data, { new: true }).lean<IRentalModel>().exec();
    if (property) {
      return property as IRentalModel;
    }
    return null;
  }

  /**
   * Delete a rental property (soft delete)
   */
  async deleteRentalProperty(id: string): Promise<boolean> {
    const result = await RentalPropertySchema.findByIdAndUpdate(
      id,
      { isDeleted: true, isActive: false },
      { new: true }
    ).exec();
    return !!result;
  }

  /**
   * Deactivate a rental property (mark as no longer active)
   */
  async deactivateRentalProperty(id: string, endDate?: Date): Promise<boolean> {
    const updateData: any = { isActive: false };
    if (endDate) {
      updateData.endDate = endDate;
    }
    const result = await RentalPropertySchema.findByIdAndUpdate(id, updateData, { new: true }).exec();
    return !!result;
  }
}

// Export singleton instance
export const rentalPropertyDomain: RentalPropertyDomain = new RentalPropertyDomain();
