import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { store } from '@/lib/store';

export default function Pricing() {
  const packages = store.getPackages().filter(p => p.active);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 bg-navy text-white">
        <div className="container text-center">
          <div className="gold-line mx-auto flex justify-center" />
          <h1 className="font-serif text-4xl lg:text-5xl mb-4">Transparent Pricing</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto leading-relaxed">
            Choose the level of support that matches your needs. All packages include personalised attention from our career consultancy team.
          </p>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`border-0 shadow-sm hover:shadow-lg transition-all relative flex flex-col ${pkg.popular ? 'ring-2 ring-teal shadow-md' : ''}`}>
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-teal text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    Most Popular
                  </div>
                )}
                <CardContent className="p-6 pt-8 flex flex-col flex-1">
                  <h3 className="font-serif text-lg text-navy mb-1">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-navy">£{pkg.price}</span>
                    <span className="text-sm text-muted-foreground">GBP</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {pkg.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/apply">
                    <Button className={`w-full btn-press ${pkg.popular ? 'bg-teal hover:bg-teal/90 text-white' : 'bg-navy hover:bg-navy/90 text-white'}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-ivory">
        <div className="container max-w-3xl text-center">
          <p className="text-muted-foreground leading-relaxed">
            All prices are one-time payments. We do not charge recurring fees. Our service does not guarantee employment — we prepare, match, and support your application process professionally to maximise your chances of being shortlisted for interviews.
          </p>
          <div className="mt-8">
            <Link href="/apply">
              <Button size="lg" className="bg-teal hover:bg-teal/90 text-white btn-press">
                Begin Your Free Assessment <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
