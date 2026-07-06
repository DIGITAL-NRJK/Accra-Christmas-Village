type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="64" height="64" rx="14" fill="#D9A832" />
      <path
        d="M18 46c8-21 16-28 28-28"
        stroke="#071A15"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M20 38c7-10 13-16 22-19"
        stroke="#F8FAF6"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="m39.4 11.6 2.5 7.1 7.5 1.6-6.1 4.6.8 7.6-6.3-4.3-7 3.1 2.1-7.4-5.1-5.7 7.6-.3 3.5-6.9Z"
        fill="#0F7B4B"
        stroke="#071A15"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      <path
        d="M17 49h30"
        stroke="#071A15"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="M16 29h8M32 46V30"
        stroke="#071A15"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}
