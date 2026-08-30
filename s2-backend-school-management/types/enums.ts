export enum StudentStatus {
  ENROLLED = 'ENROLLED',
  PENDING = 'PENDING',
  GRADUATED = 'GRADUATED',
  SUSPENDED = 'SUSPENDED',
}

export enum PaymentStatus {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
  PARTIAL = 'PARTIAL',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}

export enum DocumentType {
  DIPLOMA = 'DIPLOMA',
  ID = 'ID',
  TRANSCRIPT = 'TRANSCRIPT',
  CERTIFICATE = 'CERTIFICATE',
  OTHER = 'OTHER',
}

export enum ActivityType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  DOCUMENT = 'DOCUMENT',
  APPLICATION = 'APPLICATION',
  PAYMENT = 'PAYMENT',
  SYSTEM = 'SYSTEM',
}
