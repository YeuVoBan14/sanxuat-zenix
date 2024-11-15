export default function MenuAdd({
  width,
  height,
}: {
  width: string;
  height: string;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_496_88798)">
        <path
          d="M4 5H14"
          stroke="#1E90FF"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 9H14"
          stroke="#1E90FF"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M4 13H10"
          stroke="#1E90FF"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 11v4M10 13h4"
          stroke="#1E90FF"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_496_88798">
          <rect width="18" height="18" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
