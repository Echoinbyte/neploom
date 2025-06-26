export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface AuthData {
  user?: {
    id: string;
    email: string;
    loomer_name: string;
  };
  verification_code?: string;
  requires_verification?: boolean;
}

export interface ValidationErrorData {
  validationErrors?: Array<{
    code: string;
    message: string;
    path: Array<string | number>;
  }>;
}

// Type-specific response interfaces
export type AuthResponse = ApiResponse<AuthData>;
export type ValidationErrorResponse = ApiResponse<ValidationErrorData>;
