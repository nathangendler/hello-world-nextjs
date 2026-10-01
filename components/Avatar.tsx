import Image from "next/image";

export function Avatar({
  url,
  name,
  size,
}: {
  url: string | null;
  name: string;
  size: number;
}) {
  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className="flex items-center justify-center rounded-full bg-gray-200 font-semibold text-gray-700"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}
