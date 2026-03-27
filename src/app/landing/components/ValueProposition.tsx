'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Users, BookOpen, TrendingUp, Target, Award } from 'lucide-react';
import Link from 'next/link';

export function ValueProposition() {
  return (
    <section
      className="py-20 lg:py-32 bg-white dark:bg-slate-900"
      aria-labelledby="value-proposition-heading"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2
            id="value-proposition-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6"
          >
            Kdo lahko uporablja AI Learning Sensei?
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            Platforma, ki služi tako učencem kot učiteljem z revolucionarnim pristopom k učenju
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          {/* For Students */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Za učence
              </CardTitle>
              <CardDescription className="text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Dosežite boljše rezultate z osebnim AI tutorjem
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Boljše ocene</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Povprečno izboljšanje za 1-2 stopnji z prilagojenim učenjem</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Prilagojeno učenje</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">AI se prilagaja vašemu stilu in tempu učenja</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Samostojno učenje</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Naložite svoja gradiva in Sensei ustvari učne načrte</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Sledenje napredku</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Vizualizacije in grafi vašega učnega napredka</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/register">
                  <Button className="w-full min-h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 transition-colors touch-manipulation">
                    Začni učiti zdaj
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* For Teachers */}
          <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-950 hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
                Za učitelje
              </CardTitle>
              <CardDescription className="text-base lg:text-lg text-slate-600 dark:text-slate-300">
                Revolucionirajte svoje poučevanje z AI pomočjo
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Manj administracije</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Avtomatizirajte rutinska opravila in se osredotočite na učenje</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Boljša vključenost</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Prilagojeno učenje poveča motivacijo in rezultate učencev</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpen className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Natančno sledenje</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Podrobni vpogledi v napredek vsakega učenca</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <Award className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">AI pomoč</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Inteligentne predloge za načrtovanje in intervencije</p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Link href="/dashboard/teacher">
                  <Button className="w-full min-h-12 text-base font-semibold bg-purple-600 hover:bg-purple-700 transition-colors touch-manipulation">
                    Začni poučevati
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}