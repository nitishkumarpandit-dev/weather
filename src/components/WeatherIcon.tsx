import Image from "next/image";

interface WeatherIconProps {
  iconCode: string;
  alt: string;
  size?: number;
}

export default function WeatherIcon({
  iconCode,
  alt,
  size = 50,
}: WeatherIconProps) {
  return (
    <Image
      src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
      alt={alt}
      width={size}
      height={size}
      className="inline-block"
    />
  );
}
