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
  const { user, authLoading, authError, signIn, signOut } = useAuth()

  const handleAuthAction = async () => {
    if (user) {
      await signOut()
    } else {
      await signIn()
    }
  }

  return (
    <header
      className={`w-full shrink-0 border-b border-red-900/20 bg-stone-900 shadow-lg ${className}`}
    >
      <a
        href="#sticky-canvas"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-red-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to canvas
      </a>

      <nav
        aria-label="Main"
        className="container mx-auto flex min-h-20 flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2"
      >
        {/*
          The credit sits under the logo because the canvas fills the rest of
          the screen and there is no footer to hold it.
        */}
        <div className="flex flex-col">
          <Logo />
          <a
            href="https://ibrahimelkhansa.com"
            className="ml-10 text-xs text-stone-400 underline-offset-2 hover:text-stone-200 hover:underline"
          >
            Built by Ibrahim El Khansa
          </a>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="default" onClick={onAddNote}>
            <Plus aria-hidden="true" />
            Add Note
          </Button>
          <SaveStatus />
        </div>

        <div className="flex flex-col items-end gap-1">
          {/*
            aria-busy rather than disabled. `disabled` removed the only auth
            control from the tab order with no announcement, so during a slow
            or failed session restore it simply vanished for keyboard users.
          */}
          <Button
            variant="outline"
            onClick={handleAuthAction}
            aria-busy={authLoading}
          >
            {authLoading ? 'Loading...' : user ? 'Sign out' : 'Sign in'}
          </Button>
          {authError ? (
            <p role="alert" className="max-w-60 text-right text-xs text-red-300">
              {authError}
            </p>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
