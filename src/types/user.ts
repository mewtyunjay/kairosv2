/**
 * Type definitions for user profile and preferences
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface CategoryPreference {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
}