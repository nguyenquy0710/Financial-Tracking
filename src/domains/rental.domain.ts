import RentalSchema, { IRentalModel } from '@/models/rental.model';

export default class RentalDomain {
  constructor() {
  }

  async getRentalById(id: string): Promise<IRentalModel | null> {
    // Logic to retrieve a rental by its ID
    const rental = await RentalSchema.findById(id).lean<IRentalModel>().exec();
    return rental as IRentalModel | null;
  }

  async createRental(data: Partial<IRentalModel>): Promise<IRentalModel> {
    // Logic to create a new rental
    const rental = new RentalSchema(data);
    await rental.save();
    return rental.toObject() as unknown as IRentalModel;
  }

  async updateRental(id: string, data: Partial<IRentalModel>): Promise<IRentalModel | null> {
    // Logic to update an existing rental
    const rental = await RentalSchema.findByIdAndUpdate(id, data, { new: true }).lean<IRentalModel>().exec();
    if (rental) {
      return rental as IRentalModel;
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
