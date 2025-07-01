"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Diamond, Lightbulb, TrendingUp, ListChecks, Users, MonitorSmartphone, GraduationCap, Facebook, Twitter, Linkedin } from 'lucide-react';
import { useState, useEffect } from 'react';

const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
  { href: '#contact', label: 'Contact' },
];

const featureCards = [
    {
        icon: Lightbulb,
        title: 'AI-Powered Explanations',
        description: 'Get instant, clear explanations for incorrect answers, helping you understand concepts better.',
    },
    {
        icon: TrendingUp,
        title: 'Performance Analytics',
        description: 'Track your progress with detailed analytics and get personalized recommendations.',
    },
    {
        icon: ListChecks,
        title: 'Manageable Quizzes',
        description: 'Teachers can easily create, edit, and manage quizzes for their students.',
    },
    {
        icon: Users,
        title: 'Multiple User Roles',
        description: 'Dedicated dashboards for Students, Teachers, and Guardians to support the learning journey.',
    },
    {
        icon: MonitorSmartphone,
        title: 'Interactive & Engaging',
        description: 'A modern and fun interface to keep students motivated and engaged in learning.',
    },
    {
        icon: GraduationCap,
        title: 'Personalized Learning',
        description: 'AI suggests topics and materials based on your performance, creating a unique learning path.',
    },
]

export default function LandingPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Diamond className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold text-gray-900 tracking-wide">LearnifyAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
                 <Link key={link.label} href={link.href} className="text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                    {link.label}
                </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
                <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative text-white bg-gradient-to-br from-primary to-secondary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Smarter Learning, Instant Feedback
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100">
                    LearnifyAI is an AI-powered platform that makes learning engaging and effective with interactive quizzes and personalized explanations.
                </p>
                <div className="mt-10">
                    <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100 shadow-lg px-8 py-6 text-base font-semibold">
                        <Link href="/signup">
                            Get Started for Free
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Choose LearnifyAI?</h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featureCards.map((feature, index) => (
                <Card key={index} className="text-center bg-white shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200/80 rounded-xl">
                  <CardHeader className="items-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                        <feature.icon className="h-7 w-7 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-gray-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="md:col-span-1">
                     <h3 className="text-xl font-bold text-white mb-3">LearnifyAI</h3>
                     <p className="text-sm text-gray-400">Enhancing education with the power of Artificial Intelligence.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-white tracking-wider mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                        <li><Link href="#features" className="text-sm hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="#pricing" className="text-sm hover:text-white transition-colors">Pricing</Link></li>
                        <li><Link href="https://goutomroy64.github.io/Portfolio_V1" className="text-sm hover:text-white transition-colors">About Us</Link></li>
                    </ul>
                </div>
                <div>
                     <h4 className="font-semibold text-white tracking-wider mb-4">Follow Us</h4>
                     <div className="flex items-center gap-4">
                        <Link href="https://www.facebook.com/GoutomRoy64" aria-label="Facebook"><Facebook className="h-6 w-6 hover:text-white transition-colors"/></Link>
                        <Link href="#" aria-label="Twitter"><Twitter className="h-6 w-6 hover:text-white transition-colors"/></Link>
                        <Link href="#" aria-label="LinkedIn"><Linkedin className="h-6 w-6 hover:text-white transition-colors"/></Link>
                     </div>
                </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                <p className="text-sm text-gray-500">
                    © {year} LearnifyAI. All Rights Reserved.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
}
