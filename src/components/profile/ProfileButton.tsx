/**
 * Profile button component that opens the profile modal
 */

import React from 'react';
import { User } from 'lucide-react';
import type { UserProfile } from '../../types/user';

interface ProfileButtonProps {
  user?: UserProfile;
  onOpenModal: () => void;
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({ user, onOpenModal }) => {
  return (
    <button
      onClick={onOpenModal}
      className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 transition-colors"
      aria-label="Open profile"
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-8 h-8 rounded-full object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary-light/20 dark:bg-primary-dark/20 flex items-center justify-center">
          <User className="w-5 h-5 text-primary-light dark:text-primary-dark" />
        </div>
      )}
    </button>
  );
}