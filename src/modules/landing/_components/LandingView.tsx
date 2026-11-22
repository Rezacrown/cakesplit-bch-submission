import { CartoonStoryReel } from "./CartoonStoryReel";
import { ClosingStampCta } from "./ClosingStampCta";
import { FeatureStoryboard } from "./FeatureStoryboard";
import { WavyInkDivider } from "./InkOrnaments";
import { LandingHero } from "./LandingHero";

export function LandingView() {
  return (
    <div className="pb-6">
      <LandingHero />
      <WavyInkDivider />
      <CartoonStoryReel />
      <WavyInkDivider />
      <FeatureStoryboard />
      <ClosingStampCta />
    </div>
  );
}
