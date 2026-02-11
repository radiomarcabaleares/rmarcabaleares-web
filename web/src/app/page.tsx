import LiveBroadcast from '@/components/home/LiveBroadcast';
import BentoGrid from '@/components/home/BentoGrid';
import CorporateBanner from '@/components/home/CorporateBanner';
import FutbolBalearSection from '@/components/home/FutbolBalearSection';
import HorizontalBannerAd from '@/components/home/HorizontalBannerAd';
import NewsGrid from '@/components/home/NewsGrid';
import LateralAds from '@/components/layout/LateralAds';

export default function HomePage() {
  return (
    <LateralAds>
      <div className="space-y-6">
        {/* Live Broadcast */}
        <LiveBroadcast />

        {/* Featured News Bento Grid */}
        <BentoGrid />

        {/* Corporate Banner + Ad Space */}
        <CorporateBanner />
        <HorizontalBannerAd position="horizontal_1" />

        {/* Fútbol Balear: YouTube + category news */}
        <FutbolBalearSection />

        {/* Corporate Banner + Ad Space */}
        <CorporateBanner />
        <HorizontalBannerAd position="horizontal_2" />

        {/* Polideportivo News Grid */}
        <NewsGrid />
      </div>
    </LateralAds>
  );
}
