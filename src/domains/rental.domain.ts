import AbsBaseDomain from '@/abstracts/absBase.domain';
import RentalSchema, { IRentalDetailModel } from '@/models/rentalDetail.model';

export default class RentalDomain extends AbsBaseDomain {

  // Call the parent constructor
  constructor() {
    super();
  }

  // Clean up resources when the domain is destroyed
  protected onDestroy(): void {
    this.logger.info(`${this.constructor.name} cleaned up resources`);
  }

  async getRentalById(id: string): Promise<IRentalDetailModel | null> {
    try {
      // Logic to retrieve a rental by its ID
      const rental = await RentalSchema.findById(id).lean<IRentalDetailModel>().exec();
      return rental as IRentalDetailModel | null;
    } catch (error) {
      console.error('Error retrieving rental by ID:', error);
      return null;
    }
  }

  async createRental(data: Partial<IRentalDetailModel>): Promise<IRentalDetailModel> {
    // Logic to create a new rental
    const rental = new RentalSchema(data);
    await rental.save();
    return rental.toObject() as unknown as IRentalDetailModel;
  }

  async updateRental(id: string, data: Partial<IRentalDetailModel>): Promise<IRentalDetailModel | null> {
    // Logic to update an existing rental
    const rental = await RentalSchema.findByIdAndUpdate(id, data, { new: true }).lean<IRentalDetailModel>().exec();
    if (rental) {
      return rental as IRentalDetailModel;
    }
    return null;
  }

  async deleteRental(id: string): Promise<boolean> {
    // Logic to delete a rental
    const result = await RentalSchema.findByIdAndDelete(id).exec();
    if (result) {
      return true;
    }
    return false;
  }
}

// ================= Exporting Instance =================
export const rentalDomain: RentalDomain = new RentalDomain();
