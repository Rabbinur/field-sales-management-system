export type UserRole =
  | "SOFTWARE_SUPER_ADMIN"
  | "MOTHER_COMPANY_ADMIN"
  | "DEALERSHIP_ADMIN"
  | "SALES_REPRESENTATIVE";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";
export type MembershipStatus = "ACTIVE" | "INACTIVE";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface IMembership {
  _id: string;
  userId: string;
  role: UserRole;
  businessId?: string;
  dealershipId?: string;
  allowedDealershipIds?: string[];
  permissions: string[];
  status: MembershipStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISession {
  _id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  createdAt: Date;
  lastActivityAt: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  role: UserRole;
  dealershipId?: string;
  allowedDealershipIds?: string[];
}

export interface AuthContext {
  user: {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
  };
  role: UserRole;
  membership: {
    id: string;
    role: UserRole;
    businessId?: string;
    dealershipId?: string;
    allowedDealershipIds?: string[];
    permissions: string[];
  };
  sessionId: string;
}
