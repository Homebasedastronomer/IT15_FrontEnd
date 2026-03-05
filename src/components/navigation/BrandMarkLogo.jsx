function BrandMarkLogo() {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label="UMroll logo">
      <defs>
        <linearGradient id="umroll-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8ed8ff" />
          <stop offset="1" stopColor="#1e7dd9" />
        </linearGradient>
        <linearGradient id="umroll-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#19458b" />
          <stop offset="1" stopColor="#0f2b5e" />
        </linearGradient>
      </defs>

      <path d="M8 14v22c0 7 5.7 12 12.7 12H29V37.4h-8.3a2.9 2.9 0 0 1-2.7-3V14Z" fill="url(#umroll-b)" />
      <path d="M31.3 48V22a8 8 0 0 1 14.2-5l6.8 9 5.2-5.2A8 8 0 0 1 63 18v30h-9.9V24.7l-7.6 7.5a4.8 4.8 0 0 1-7.2-.6l-3.1-4.3V48Z" fill="url(#umroll-a)" />
      <path d="M38 40.5h8.8l10-10h-5.2L47 35h-8.9Z" fill="#133a78" opacity="0.95" />

      <path d="M44.5 16 62 4.5l-4 9.7" fill="none" stroke="url(#umroll-a)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27.5 35.5 37 41.3" fill="none" stroke="#6cc7ff" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="25.4" cy="34.2" r="3.8" fill="#8ed8ff" stroke="#123b79" strokeWidth="1.8" />
      <circle cx="39.3" cy="42.7" r="3.4" fill="#8ed8ff" stroke="#123b79" strokeWidth="1.8" />
    </svg>
  )
}

export default BrandMarkLogo
