export default function Logo() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Circle background */}
      <circle cx="100" cy="100" r="95" fill="black" />

      {/* Simplified rabbit, sitting flush at bottom */}
      <g transform="translate(25,40) scale(1.2)" fill="white">
        <path d="M110 60C110 50 120 40 130 50C140 60 135 75 125 78C135 85 140 95 135 110C130 125 115 135 95 135C75 135 60 125 55 110C50 95 60 80 75 75C65 65 65 50 75 45C85 40 100 45 105 55Z"/>
        {/* Rabbit eye */}
        <circle cx="122" cy="70" r="5" fill="black" />
      </g>
    </svg>
  );
}
