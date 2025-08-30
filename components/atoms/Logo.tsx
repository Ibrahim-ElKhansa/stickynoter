import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="StickyNoter Logo"
        width={32}
        height={32}
        className="object-contain"
      />
      <span className="ml-2 font-bold text-primary">StickyNoter</span>
    </Link>
  );
}
