export interface User {
  name: string;
  email: string;
}

export interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend?: string;
  CTC?: string;
  duration?: string;
  description?: string;
  createdAt?: string;
  createAt?: string;
  aboutCompany?: string;
  aboutJob?: string;
  whoCanApply?: string;
  perks?: string;
  AdditionalInfo?: string;
  numberOfOpening?: string;
  startDate?: string;
  Experience?: string;
}

export interface Internship {
  _id: string;
  title: string;
  company: string;
  location: string;
  category: string;
  stipend: string;
  duration?: string;
  description?: string;
  createdAt?: string;
  aboutCompany?: string;
  aboutInternship?: string;
  whoCanApply?: string;
  perks?: string;
  additionalInfo?: string;
  numberOfOpening?: string;
  startDate?: string;
}

export interface Application {
  _id: string;
  company: string;
  category: string;
  user: User;
  status: string;
  createdAt: string;
  applicationId?: string;
}
