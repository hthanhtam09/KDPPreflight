import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="group flex min-w-0 shrink items-center gap-1 rounded-full outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/40"
      aria-label="KDPPreflight home"
    >
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
        <Image
          src="/logo-nav.png"
          alt=""
          width={60}
          height={60}
          className="h-[50px] w-[50px] sm:h-[60px] sm:w-[60px] object-contain brightness-105 transition group-hover:brightness-125"
          priority
        />
      </div>
      <div className="min-w-0">
        <span className="block truncate text-base font-semibold leading-tight tracking-tight text-foreground sm:text-xl lg:text-xl md:text-lg group-hover:text-primary transition-colors duration-150">
          KDPPreflight
        </span>
      </div>
    </Link>
  )
}
