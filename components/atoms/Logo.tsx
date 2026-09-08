import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center ${className}`}>
      {/*
        Decorative: the wordmark beside it already names the link. With an alt
        of "StickyNoter Logo" the link's accessible name read
        "StickyNoter Logo StickyNoter".
      */}
      <Image
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        priority
        className="object-contain"
      />
      <span className="ml-2 font-bold text-red-300">StickyNoter</span>
    </Link>
  );
}
