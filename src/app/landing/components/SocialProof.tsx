'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Users, TrendingUp, Award, Quote } from 'lucide-react';

const stats = [
  {
    value: '94%',
    label: 'učencev izboljša ocene',
    description: 'za 1-2 stopnji',
    icon: TrendingUp,
    color: 'text-green-600'
  },
  {
    value: '87%',
    label: 'učiteljev poroča o večji',
    description: 'motivaciji učencev',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    value: '10.000+',
    label: 'aktivnih učencev',
    description: 'mesečno',
    icon: Award,
    color: 'text-purple-600'
  },
  {
    value: '24/7',
    label: 'AI podpora',
    description: 'kadarkoli potrebujete',
    icon: Star,
    color: 'text-orange-600'
  }
];

const testimonials = [
  {
    quote: '"Sensei mi pomaga razumeti matematiko bolje kot katerikoli učitelj. Prilagaja se mojim potrebam in nikoli ne obupam več."',
    author: 'Ana Kovač',
    role: '3. letnik gimnazije',
    avatar: 'A',
    rating: 5
  },
  {
    quote: '"Končno vidim, kje moji učenci težave in kako jim pomagati. AI predloge so revolucionarne za moje poučevanje."',
    author: 'Prof. Marko Novak',
    role: 'Matematika, Srednja šola',
    avatar: 'M',
    rating: 5
  },
  {
    quote: '"Iz knjig in zapiskov sam ustvarjam učne načrte. Sensei mi pomaga pri študiju medicine na popolnoma nov način."',
    author: 'Luka Žagar',
    role: 'Študent medicine',
    avatar: 'L',
    rating: 5
  }
];

export function SocialProof() {
  return (
    <section
      className="py-20 lg:py-32 bg-white dark:bg-slate-900"
      aria-labelledby="social-proof-heading"
    >
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-20">
          <h2
            id="social-proof-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Dokazana učinkovitost
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12">
            Rezultati, ki govorijo sami zase. AI Learning Sensei spreminja način učenja po vsem svetu.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-lg bg-slate-50 dark:bg-slate-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <CardContent className="p-6 lg:p-8">
                    <div className={`w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {stat.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.description}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Kaj pravijo naši uporabniki
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Prave zgodbe iz resničnega življenja
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="relative border-0 shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                <CardContent className="p-6 lg:p-8">
                  {/* Quote icon */}
                  <div className="absolute top-4 right-4 opacity-20">
                    <Quote className="w-8 h-8 text-slate-400" />
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.author}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust badges */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-6 bg-slate-100 dark:bg-slate-800 px-8 py-4 rounded-full">
              <Badge variant="secondary" className="px-3 py-1">
                🔒 GDPR Compliant
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                🛡️ SSL Encrypted
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                ⭐ 4.9/5 Rating
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}