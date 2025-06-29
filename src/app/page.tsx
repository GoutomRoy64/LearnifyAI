"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, ArrowRight, BrainCircuit, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg font-bold">LearnBoostAI</span>
          </Link>
          <Button asChild>
            <Link href="/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 text-center md:py-32 bg-primary/5">
          <div className="container">
            <h1 className="font-headline text-4xl font-bold tracking-tighter md:text-6xl">
              Supercharge Your Learning with AI
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              LearnBoostAI is an intelligent platform for creating, taking, and evaluating quizzes, with AI-powered feedback to help you master any subject.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/login">
                  Start Learning Now
                </Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Image showcase */}
        <section className="py-12 md:py-24">
            <div className="container">
                <div className="mx-auto max-w-5xl">
                    <Card className="overflow-hidden shadow-2xl">
                        <Image
                            src="https://placehold.co/1200x600.png"
                            alt="LearnBoostAI Dashboard"
                            width={1200}
                            height={600}
                            className="w-full"
                            data-ai-hint="dashboard analytics"
                        />
                    </Card>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section className="py-12 bg-card md:py-24">
          <div className="container">
            <div className="mb-12 text-center">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">An All-in-One Learning Platform</h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                Whether you're a student eager to learn or a teacher shaping minds, we have the tools for you.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="text-center transition-shadow hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">For Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Take engaging quizzes, track your progress, and get instant, AI-powered feedback to understand and improve upon your mistakes.</p>
                </CardContent>
              </Card>
              <Card className="text-center transition-shadow hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                    <Edit className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="font-headline">For Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Effortlessly create custom quizzes, manage your courses, and monitor student performance with our intuitive dashboard.</p>
                </CardContent>
              </Card>
              <Card className="text-center transition-shadow hover:shadow-xl">
                <CardHeader>
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                     <BrainCircuit className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-headline">AI-Powered Explanations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Don't just know you're wrong—understand why. Our AI tutor provides clear explanations for incorrect answers.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex items-center justify-center py-6">
          <p className="text-sm text-muted-foreground">
            © {year} LearnBoostAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
