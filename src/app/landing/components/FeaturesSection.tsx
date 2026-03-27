'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Target,
  BarChart3,
  Upload,
  Users,
  Zap,
  BookOpen,
  Award,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Interaktivno učenje',
    description: 'AI prilagaja vsebino vašemu znanju v realnem času. Sensei analizira vaše odgovore in prilagaja težavnost vprašanj.',
    badge: 'AI-powered',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Target,
    title: 'Prilagojeni kvizi',
    description: 'Inteligentni testi, ki se učijo iz vaših odgovorov. Vsak kviz je unikaten in prilagojen vašim šibkim točkam.',
    badge: 'Adaptive',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: BarChart3,
    title: 'Vizualizacija znanja',
    description: 'Grafi in zemljevidi, ki prikazujejo vaš napredek. Vidite, kje ste močni in kje potrebujete več vaj.',
    badge: 'Analytics',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Upload,
    title: 'Pametno nalaganje',
    description: 'AI analizira vaše gradiva in ustvari učne načrte. Podprite PDF-je, slike, zapiske in celo ročno napisana besedila.',
    badge: 'Smart',
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Zap,
    title: 'Fokusirano učenje',
    description: 'Sensei identificira šibke točke in jih okrepi. Namesto ponavljanja vsega se osredotočite na kar resnično potrebujete.',
    badge: 'Focused',
    color: 'from-indigo-500 to-purple-500'
  },
  {
    icon: Users,
    title: 'Skupinsko učenje',
    description: 'Peer mentoring z AI moderacijo. Učite se skupaj z drugimi učenci pod vodstvom Sensei.',
    badge: 'Social',
    color: 'from-teal-500 to-cyan-500'
  }
];

export function FeaturesSection() {
  return (
    <section
      className="py-20 lg:py-32 bg-slate-50 dark:bg-slate-800"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Revolucionarne funkcije</span>
          </div>

          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Kaj naredi AI Learning Sensei posebnega?
          </h2>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Kombinacija najsodobnejše AI tehnologije z dokazanimi pedagoškimi metodami
            za najboljše učne rezultate
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl bg-white dark:bg-slate-900 transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {feature.badge}
                    </Badge>
                  </div>

                  <CardTitle className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <CardDescription className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Hover effect overlay */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-full shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Pridružite se 10.000+ učencem in učiteljem
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}