export function SingaporeSkyline() {
  return (
    <svg viewBox="0 0 760 360" role="img" aria-labelledby="skylineTitle skylineDesc" className="h-full w-full">
      <title id="skylineTitle">Singapore skyline illustration</title>
      <desc id="skylineDesc">A refined line illustration of Singapore landmarks and a waterfront skyline.</desc>
      <defs>
        <linearGradient id="skylineWash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EEF4F8" />
          <stop offset="100%" stopColor="#FFF7DF" />
        </linearGradient>
      </defs>
      <rect width="760" height="360" rx="8" fill="url(#skylineWash)" />
      <path d="M0 286C108 260 188 273 288 286C418 304 542 305 760 264V360H0V286Z" fill="#FFFFFF" />
      <path
        d="M65 252h640M92 252v-62h28v62M135 252v-92h44v92M200 252v-126l32-28 31 28v126M292 252v-88h36v88M355 252V107h98v145M371 107l15-42h36l16 42M483 252v-116h42v116M552 252V91h72v161M552 91c30 27 48 27 72 0M640 252v-74h30v74"
        fill="none"
        stroke="#12365F"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M340 77c65-38 156-42 232-8" stroke="#D9A528" strokeWidth="3" strokeLinecap="round" opacity=".75" />
      <path d="M48 284c126-30 244-28 366 0s221 27 304-4" stroke="#D9A528" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="116" r="35" fill="none" stroke="#12365F" strokeWidth="4" opacity=".72" />
      <path d="M75 116h70M110 81v70M86 91c19 18 29 50 24 60M134 91c-19 18-29 50-24 60" stroke="#12365F" strokeWidth="3" opacity=".72" />
      <path d="M530 54c72 4 123 27 166 68" stroke="#D9A528" strokeWidth="2" strokeDasharray="5 9" opacity=".8" />
    </svg>
  );
}
