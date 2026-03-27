'use client';

import { HeroSection } from './components/HeroSection';
import { ValueProposition } from './components/ValueProposition';
import { FeaturesSection } from './components/FeaturesSection';
import { SocialProof } from './components/SocialProof';
import { Footer } from './components/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValueProposition />
      <FeaturesSection />
      <SocialProof />
      <Footer />
    </div>
  );
}