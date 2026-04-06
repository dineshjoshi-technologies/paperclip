'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, Shield, Users, Calendar, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PricingTier {
  name: string;
  price: number;
  annualPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    description: 'Perfect for trying things out',
    features: [
      '1 website',
      'AI-powered builder',
      'Basic templates',
      'Community support',
      '5 pages per site',
    ],
    buttonText: 'Start Free',
  },
  {
    name: 'Starter',
    price: 9,
    annualPrice: 86,
    description: 'For individuals getting started',
    features: [
      '5 websites',
      'AI-powered builder',
      'All templates',
      'Priority support',
      'Unlimited pages',
      'Custom domain',
      'SSL certificate',
    ],
    buttonText: 'Get Started',
  },
  {
    name: 'Pro',
    price: 19,
    annualPrice: 182,
    description: 'For growing businesses',
    features: [
      '25 websites',
      'AI-powered builder',
      'All templates',
      'Priority support',
      'Unlimited pages',
      'Custom domains',
      'SSL certificate',
      'Remove branding',
      'Analytics',
      'API access',
    ],
    popular: true,
    buttonText: 'Go Pro',
  },
  {
    name: 'Agency',
    price: 49,
    annualPrice: 470,
    description: 'For teams and agencies',
    features: [
      'Unlimited websites',
      'AI-powered builder',
      'All templates',
      'Dedicated support',
      'Unlimited pages',
      'Custom domains',
      'SSL certificate',
      'White-label',
      'Advanced analytics',
      'Full API access',
      'Team collaboration',
      'SSO integration',
    ],
    buttonText: 'Contact Sales',
  },
];

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, you\'ll receive credit towards future billing.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and UPI payments for India-based customers.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Our Free plan lets you try the platform indefinitely. No credit card required. Upgrade when you\'re ready for more features.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, contact support within 30 days for a full refund.',
  },
  {
    question: 'What happens when my site exceeds the limit?',
    answer: 'We\'ll notify you before reaching limits. You can upgrade your plan or archive old sites to stay within your tier\'s limits.',
  },
  {
    question: 'Do you offer enterprise pricing?',
    answer: 'Yes! For organizations with specific needs, we offer custom enterprise plans. Contact our sales team for a custom quote.',
  },
];

const comparison = {
  name: 'Features',
  features: [
    { name: 'Websites', free: '1', starter: '5', pro: '25', agency: 'Unlimited' },
    { name: 'AI Builder', free: true, starter: true, pro: true, agency: true },
    { name: 'Templates', free: 'Basic', starter: 'All', pro: 'All', agency: 'All' },
    { name: 'Custom Domain', free: false, starter: true, pro: true, agency: true },
    { name: 'SSL Certificate', free: false, starter: true, pro: true, agency: true },
    { name: 'Remove Branding', free: false, starter: false, pro: true, agency: true },
    { name: 'Analytics', free: false, starter: false, pro: true, agency: true },
    { name: 'API Access', free: false, starter: false, pro: true, agency: true },
    { name: 'White Label', free: false, starter: false, pro: false, agency: true },
    { name: 'Team Members', free: '1', starter: '2', pro: '5', agency: 'Unlimited' },
    { name: 'Priority Support', free: false, starter: true, pro: true, agency: true },
    { name: 'SSO', free: false, starter: false, pro: false, agency: true },
  ],
};

function CheckIcon() {
  return (
    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
  );
}

function XIcon() {
  return (
    <X className="w-5 h-5 text-zinc-300 dark:text-zinc-600 flex-shrink-0" />
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left"
      >
        <span className="font-medium text-zinc-900 dark:text-zinc-100">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-zinc-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-500" />
        )}
      </button>
      {isOpen && (
        <p className="pb-5 text-zinc-600 dark:text-zinc-400">{answer}</p>
      )}
    </div>
  );
}

function PricingCard({ tier, isAnnual }: { tier: PricingTier; isAnnual: boolean }) {
  const price = isAnnual ? tier.annualPrice : tier.price;
  const period = isAnnual ? '/year' : '/month';

  return (
    <div
      className={`relative flex flex-col p-6 rounded-2xl border ${
        tier.popular
          ? 'border-zinc-900 dark:border-zinc-100 ring-2 ring-zinc-900 dark:ring-zinc-100'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{tier.name}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{tier.description}</p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
          {price === 0 ? 'Free' : `$${price}`}
        </span>
        {price > 0 && (
          <span className="text-lg text-zinc-600 dark:text-zinc-400">{period}</span>
        )}
      </div>

      <ul className="flex-1 space-y-3 mb-6">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckIcon />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        variant={tier.popular ? 'primary' : 'secondary'}
        className="w-full"
        size="lg"
      >
        {tier.buttonText}
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <nav className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-xl text-zinc-900 dark:text-zinc-50">
            DJ Technologies
          </a>
          <div className="flex items-center gap-6">
            <a href="/#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Features
            </a>
            <a href="/pricing" className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
              Pricing
            </a>
            <a href="/auth/login" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Login
            </a>
            <a href="/auth/register" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
              Choose the plan that fits your needs. All plans include our AI-powered website builder.
            </p>

            <div className="inline-flex items-center gap-4 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !isAnnual
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isAnnual
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Annual <span className="text-green-600 dark:text-green-400 ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {tiers.map((tier) => (
              <PricingCard key={tier.name} tier={tier} isAnnual={isAnnual} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mb-16">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              30-day money-back guarantee • No questions asked
            </span>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-16 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl mx-4 md:mx-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">
            Compare Plans
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700">
                  <th className="text-left py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Features
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Free
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Starter
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Pro
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                    Agency
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.features.map((feature) => (
                  <tr key={feature.name} className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-4 px-4 text-zinc-700 dark:text-zinc-300">{feature.name}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.free === 'boolean' ? (
                        feature.free ? <CheckIcon /> : <XIcon />
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{feature.free}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.starter === 'boolean' ? (
                        feature.starter ? <CheckIcon /> : <XIcon />
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{feature.starter}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.pro === 'boolean' ? (
                        feature.pro ? <CheckIcon /> : <XIcon />
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{feature.pro}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof feature.agency === 'boolean' ? (
                        feature.agency ? <CheckIcon /> : <XIcon />
                      ) : (
                        <span className="text-zinc-600 dark:text-zinc-400">{feature.agency}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-zinc-900 dark:text-zinc-50 mb-12">
            Frequently Asked Questions
          </h2>

          <div>
            {faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-16 mb-8">
          <div className="bg-zinc-900 dark:bg-zinc-100 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white dark:text-zinc-900 mb-4">
              Need a Custom Solution?
            </h2>
            <p className="text-zinc-300 dark:text-zinc-600 mb-8 max-w-xl mx-auto">
              For large teams and enterprises, we offer custom pricing, dedicated support, and tailored solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <Users className="w-4 h-4 mr-2" />
                Team Pricing
              </Button>
              <a
                href="mailto:sales@djtechnologies.in"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full font-medium border border-zinc-700 text-white hover:bg-zinc-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Sales
              </a>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 py-8 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span>Need annual billing? Contact us for custom enterprise agreements.</span>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">DJ Technologies</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">AI Automation, Software Development, Hosting & Infrastructure, Digital Systems</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="/#features" className="hover:text-zinc-900 dark:hover:text-zinc-100">Features</a></li>
                <li><a href="/pricing" className="hover:text-zinc-900 dark:hover:text-zinc-100">Pricing</a></li>
                <li><a href="/admin/templates" className="hover:text-zinc-900 dark:hover:text-zinc-100">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">About</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Contact</a></li>
                <li><a href="/admin/support" className="hover:text-zinc-900 dark:hover:text-zinc-100">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-500 text-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
            © 2026 DJ Technologies. Building the future of digital creation.
          </div>
        </div>
      </footer>
    </div>
  );
}
