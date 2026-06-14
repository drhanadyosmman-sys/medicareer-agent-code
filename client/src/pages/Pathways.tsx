import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Clock } from 'lucide-react';
import { store } from '@/lib/store';

export default function Pathways() {
  const countries = store.getCountries();
  const activeCountries = countries.filter(c => c.status === 'active');
  const comingSoonCountries = countries.filter(c => c.status === 'coming-soon');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-navy text-white">
        <div className="container">
          <div className="max-w-2xl">
            <div className="gold-line" />
            <h1 className="font-serif text-4xl lg:text-5xl mb-4">Global Career Pathways</h1>
            <p className="text-white/70 text-lg leading-relaxed">
              We support doctors and medical professionals from around the world in securing international career opportunities. Choose your destination country to begin.
            </p>
          </div>
        </div>
      </section>

      {/* Active Pathways */}
      <section className="py-16">
        <div className="container">
          <h2 className="font-serif text-2xl text-navy mb-8">Active Pathways</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCountries.map(country => (
              country.pathways.filter(p => p.status === 'active').map(pathway => (
                <Card key={pathway.id} className="border-0 shadow-sm hover:shadow-lg transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h3 className="font-serif text-lg text-navy">{country.name}</h3>
                        <p className="text-sm text-muted-foreground">{pathway.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 bg-teal/10 text-teal text-xs font-medium px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal" />
                        Active — Accepting Applications
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      Professional application support for {pathway.type.toLowerCase()} seeking positions in {country.name}.
                    </p>
                    <Link href={`/uk-doctors`}>
                      <Button className="w-full bg-navy hover:bg-navy/90 text-white btn-press group-hover:bg-teal group-hover:shadow-md transition-all">
                        View Pathway <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-ivory">
        <div className="container">
          <h2 className="font-serif text-2xl text-navy mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-8">We are developing pathways for these countries. Register your interest to be notified when they launch.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comingSoonCountries.map(country => (
              <Card key={country.id} className="border-0 shadow-sm bg-white/70">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{country.flag}</span>
                    <h3 className="font-medium text-navy">{country.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    Coming Soon
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center">
          <h2 className="font-serif text-3xl text-navy mb-4">Ready to Start with UK Doctor Jobs?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">Our UK pathway is fully operational. Begin your assessment today.</p>
          <Link href="/apply">
            <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press">
              Start Your Assessment <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
