'use client'

import React from 'react';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  const { user, loading, signIn, signOut } = useAuth()

  const handleAuthAction = async () => {
    if (user) {
      await signOut()
    } else {
      await signIn()
    }
  }

  return (
    <header className={`w-full border-b border-border bg-background ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <Logo />
        
        {/* Right side - Auth button */}
        <Button 
          variant="outline" 
          onClick={handleAuthAction}
          disabled={loading}
        >
          {loading ? 'Loading...' : user ? 'Sign out' : 'Sign in'}
        </Button>
      </div>
    </header>
  );
}
