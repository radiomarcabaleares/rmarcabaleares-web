import Image from 'next/image';
import { BRAND } from '@/lib/constants/brand';

export default function CorporateBanner() {
  return (
    <section className="py-8">
      <div className="relative w-full h-16 md:h-20 bg-white rounded-lg overflow-hidden shadow border border-gray-200">
        {/* Red triangle — left */}
        <div
          className="absolute inset-y-0 left-0 w-28 md:w-36 bg-marca-red"
          style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}
        />

        {/* Blue triangle — right */}
        <div
          className="absolute inset-y-0 right-0 w-28 md:w-36 bg-radio-blue"
          style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}
        />

        {/* Center Logo */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <Image
            src={BRAND.logos.horizontal}
            alt={BRAND.name}
            width={300}
            height={75}
            className="h-9 md:h-12 w-auto"
          />
        </div>
      </div>
    </section>
  );
}
