export interface RentalModel {
  id: string;
  tenantName: string;
  propertyAddress: string;
  rentAmount: number;
  leaseStartDate: Date;
  leaseEndDate: Date;
  isActive: boolean;
}

export default RentalModel;
