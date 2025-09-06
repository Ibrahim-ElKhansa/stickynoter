'use client'

import React from 'react';
import { Plus } from 'lucide-react';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/atoms/Button';
import { SaveStatus } from '@/components/molecules/SaveStatus';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarProps {
  className?: string;
  onAddNote?: () => void;
}

export function Navbar({ className = '', onAddNote }: NavbarProps) {
  const { user, authLoading, signIn, signOut } = useAuth()

  const handleAuthAction = async () => {
    if (user) {
      await signOut()
    } else {
      await signIn()
    }
  }

  return (
    <header className={`w-full border-b border-red-900/20 bg-stone-900 shadow-lg ${className}`}>
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left side - Logo */}
        <Logo />
        
        {/* Center - Add Note button and Save Status */}
        <div className="flex items-center gap-4">
          <Button 
            variant="default"
            onClick={onAddNote}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-red-700"
          >
            <Plus size={18} />
            Add Note
          </Button>
          <SaveStatus />
        </div>
        
        {/* Right side - Auth button */}
        <Button 
          variant="outline" 
          onClick={handleAuthAction}
          disabled={authLoading}
          className="border-red-700/50 text-red-300 hover:bg-red-900/30 hover:text-red-200 hover:border-red-600"
        >
          {authLoading ? 'Loading...' : user ? 'Sign out' : 'Sign in'}
        </Button>
      </div>
    </header>
  );
}
