import React from 'react';
import { Logo } from '@/components/atoms/Logo';
import { Button } from '@/components/atoms/Button';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className = '' }: NavbarProps) {
  return (
    <header className={`w-full border-b border-border bg-background ${className}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left side - Logo */}
        <Logo />
        
        {/* Right side - Sign in button */}
        <div>
          <Button variant="outline">
            Sign in
          </Button>
        </div>
      </div>
    </header>
  );
}
