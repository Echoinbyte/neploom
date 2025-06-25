export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface RedirectData {
  redirectTo?: string;
}

export interface AuthData extends RedirectData {
  user?: {
    id: string;
    email: string;
    loomer_name: string;
  };
  verification_code?: string;
  requires_verification?: boolean;
}

export interface ValidationErrorData extends RedirectData {
  validationErrors?: Array<{
    code: string;
    message: string;
    path: Array<string | number>;
  }>;
}

// Type-specific response interfaces
export type AuthResponse = ApiResponse<AuthData>;
export type ValidationErrorResponse = ApiResponse<ValidationErrorData>;
export type RedirectResponse = ApiResponse<RedirectData>;
