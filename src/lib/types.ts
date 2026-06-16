export type Prospect = {
  id: string;
  name: string;
  country: string;
  status: string;
  seller: string;
  vendorIds: number[];
  category: string;
  nextContact: string;
  lastContact: string;
  updatedAt: string;
  createdAt: string;
  contactPerson?: string;
};

export type Deal = {
  id: string;
  name: string;
  country: string;
  category: string;
  fase: string;
  estadoKpi: string;
  contactPerson: string;
  buyerPerson: string;
  email: string;
  email1: string;
  vendor: string;
  lastContact: string;
  nextAction: string;
  targetMonth: string;
  targetValue: string;
  lastNotes: string;
  updatedAt: string;
};
