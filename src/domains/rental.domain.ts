import RentalModel from '@/models/rental.model';

import RentalSchema from '../models/Rental';

export class RentalDomain {
  constructor() {
    // Initialization code if needed
  }

  async getRentalById(id: string): Promise<RentalModel | null> {
    // Logic to retrieve a rental by its ID
    const rental = await RentalSchema.findById(id).lean<RentalModel>().exec();
    return rental as RentalModel | null;
  }

  async createRental(data: Partial<RentalModel>): Promise<RentalModel> {
    // Logic to create a new rental
    const rental = new RentalSchema(data);
    await rental.save();
    return rental.toObject() as unknown as RentalModel;
  }

  async updateRental(id: string, data: Partial<RentalModel>): Promise<RentalModel | null> {
    // Logic to update an existing rental
    const rental = await RentalSchema.findByIdAndUpdate(id, data, { new: true }).lean<RentalModel>().exec();
    if (rental) {
      return rental as RentalModel;
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
