export type Composition = {
  name: string;
  strengthValue: number | string;
  strengthUnit: string;
};

export type Medicine = {
  id: string;
  userId: string;
  profileId: string;
  profileName?: string;
  name: string;
  imageUrl?: string;
  dosage?: string;
  quantity: number;
  expiryDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  composition?: Composition[];
  form?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
};

export type Schedule = {
  id: string;
  medicineId: string;
  profileId: string;
  userId: string;
  timeOfDay: string; // HH:mm:ss
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'CUSTOM';
  isActive: boolean;
  createdAt: string;
};

export type GlobalMedicine = {
  id: string;
  name: string;
  brandName?: string;
  genericName?: string;
  dosageForm?: string;
  strength?: string;
  manufacturer?: string;
  description?: string;
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  warnings?: string[];
  interactions?: string[];
  storageInstructions?: string;
  category?: string;
  atcCode?: string;
  fdaApprovalDate?: string;
  createdAt: string;
  updatedAt: string;
};
