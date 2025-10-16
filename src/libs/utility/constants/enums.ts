export enum UserRoles {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export enum PaymentMode {
  ONLINE = 'online',
  COD = 'cod',
  CARD = 'pm_card_visa',
}

export enum PaymentStatus {
  PENDING = 'pending',
  CANCEL = 'cancel',
  SUCCESS = 'confirm',
}

export enum TimeFrame {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}
