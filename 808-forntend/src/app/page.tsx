import Link from "next/link";
import { ClientAnimations } from "../components/client-animations";

// Static background component (no animations to avoid SSR issues)
const StaticBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Gradient background */}
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"></div>

    {/* Static decorative elements */}
    <div className="absolute inset-0">
      <div className="absolute top-20 left-20 h-2 w-2 rounded-full bg-white/20"></div>
      <div className="absolute top-40 right-32 h-1 w-1 rounded-full bg-white/30"></div>
      <div className="absolute bottom-32 left-1/4 h-1 w-1 rounded-full bg-white/25"></div>
      <div className="absolute top-1/3 right-20 h-2 w-2 rounded-full bg-white/15"></div>
      <div className="absolute bottom-20 right-1/3 h-1 w-1 rounded-full bg-white/20"></div>
    </div>

    {/* Static orbs */}
    <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl"></div>
    <div className="absolute top-3/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
    <div className="absolute top-1/2 left-1/2 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
  </div>
);

// Hero section with stunning design
const Hero = () => (
  <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
    <StaticBackground />
    <ClientAnimations />

    <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
      <div className="mx-auto max-w-4xl">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm border border-white/20">
          <span className="mr-2">🎵</span>
          Powered by Gemini AI
        </div>

        {/* Main heading with gradient text */}
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl mb-8">
          <span className="bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Voice AI
          </span>
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Revolution
          </span>
        </h1>

        <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
          Transform text into lifelike speech with cutting-edge AI. Create natural conversations,
          multi-speaker content, and professional voiceovers with unprecedented quality.
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full hover:from-purple-500 hover:to-blue-500 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <span className="relative z-10">Start Creating</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
          </Link>

          <Link
            href="/docs"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            Explore Features
            <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: "Voices Available", value: "30+" },
            { label: "Languages", value: "10+" },
            { label: "Audio Quality", value: "24kHz" },
            { label: "Response Time", value: "<2s" },
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-sm bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
      <svg className="h-6 w-6 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    </div>
  </div>
);

// Features section with modern design
const Features = () => {
  const features = [
    {
      name: "Natural Voice Synthesis",
      description: "Advanced Gemini TTS creates human-like speech with natural intonation, rhythm, and emotion.",
      icon: "🎤",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Multi-Speaker Conversations",
      description: "Create dynamic conversations with multiple voices, perfect for podcasts and interactive content.",
      icon: "👥",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "30+ Premium Voices",
      description: "Choose from a diverse collection of voices with different tones, accents, and personalities.",
      icon: "🎭",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Developer-Friendly API",
      description: "Integrate powerful voice technology with our simple, well-documented REST API.",
      icon: "⚡",
      gradient: "from-orange-500 to-red-500",
    },
    {
      name: "Real-time Processing",
      description: "Generate high-quality audio in seconds with our optimized processing pipeline.",
      icon: "🚀",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      name: "Enterprise Ready",
      description: "Scalable infrastructure with 99.9% uptime and enterprise-grade security.",
      icon: "🛡️",
      gradient: "from-teal-500 to-blue-500",
    },
  ];

  return (
    <div className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-purple-600 mb-4">
            ✨ Powerful Features
          </h2>
          <p className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            Everything you need for
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"> perfect speech</span>
          </p>
          <p className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI with an intuitive interface to deliver
            exceptional voice quality for any application.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

              {/* Icon */}
              <div className="relative">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} text-white text-2xl mb-6`}>
                  {feature.icon}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.name}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover effect border */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                   style={{ padding: '1px' }}>
                <div className="h-full w-full rounded-2xl bg-white"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Testimonials section with modern design
const Testimonials = () => (
  <div className="relative py-24 sm:py-32 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
    {/* Background decoration */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl"></div>
    </div>

    <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4">
          Loved by <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">creators</span> worldwide
        </h2>
        <p className="text-lg leading-8 text-gray-300">
          Join thousands of satisfied users who've transformed their content with 808 Voice
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {[
          {
            content: "808 Voice has revolutionized our podcast production. The natural-sounding voices and multi-speaker capabilities have saved us countless hours.",
            author: "Sarah Johnson",
            role: "Podcast Producer",
            avatar: "👩‍💼",
            rating: 5,
          },
          {
            content: "The API integration was seamless, and the voice quality is outstanding. Our players love the dynamic character interactions in our latest game.",
            author: "Michael Chen",
            role: "Game Developer",
            avatar: "👨‍💻",
            rating: 5,
          },
          {
            content: "Perfect for educational content. The clear pronunciation and natural intonation make complex topics more engaging for our students.",
            author: "Dr. Emily Rodriguez",
            role: "Educational Creator",
            avatar: "👩‍🏫",
            rating: 5,
          },
        ].map((testimonial, index) => (
          <div key={index} className="group relative">
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              {/* Stars */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                "{testimonial.content}"
              </p>

              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <p className="text-base font-semibold text-white">{testimonial.author}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// CTA section with modern design
const CTA = () => (
  <div className="relative py-24 sm:py-32 bg-gradient-to-b from-white to-gray-50">
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        </div>

        <div className="relative">
          <h2 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
            Ready to <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">revolutionize</span> your content?
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-300">
            Join thousands of creators and developers using 808 Voice to bring their content to life with AI-powered speech synthesis.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-purple-900 transition-all duration-300 bg-white rounded-full hover:bg-gray-100 hover:scale-105 shadow-lg hover:shadow-white/25"
            >
              <span className="relative z-10">Start Creating Free</span>
              <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>

            <Link
              href="/docs"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border border-white/20 rounded-full hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              View Documentation
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Free tier available</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Setup in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Modern Footer
const Footer = () => (
  <footer className="bg-black">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-1 md:col-span-2">
          <div className="text-white font-bold text-2xl mb-4">808 Voice</div>
          <p className="text-gray-400 text-sm max-w-md">
            Transform text into lifelike speech with cutting-edge AI. The future of voice technology is here.
          </p>
          <div className="flex space-x-4 mt-6">
            {[
              { name: "Twitter", icon: "🐦", href: "#" },
              { name: "GitHub", icon: "🐙", href: "#" },
              { name: "Discord", icon: "💬", href: "#" },
              { name: "YouTube", icon: "📺", href: "#" },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="text-2xl hover:scale-110 transition-transform duration-200"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-white font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
            <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
            <li><a href="/docs" className="hover:text-white transition-colors">API Docs</a></li>
            <li><a href="/changelog" className="hover:text-white transition-colors">Changelog</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
            <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
            <li><a href="/careers" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p className="text-xs text-gray-400">
          &copy; 2024 808 Voice, Inc. All rights reserved.
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a href="/privacy" className="text-xs text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="/terms" className="text-xs text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          <a href="/cookies" className="text-xs text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
        </div>
      </div>
    </div>
  </footer>
);

// Navigation Component
const Navigation = () => (
  <header className="absolute inset-x-0 top-0 z-50">
    <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
      <div className="flex lg:flex-1">
        <Link href="/" className="-m-1.5 p-1.5">
          <span className="text-white font-bold text-2xl">808 Voice</span>
        </Link>
      </div>

      <div className="hidden lg:flex lg:gap-x-8">
        <Link href="/features" className="text-sm font-semibold leading-6 text-white/80 hover:text-white transition-colors">
          Features
        </Link>
        <Link href="/pricing" className="text-sm font-semibold leading-6 text-white/80 hover:text-white transition-colors">
          Pricing
        </Link>
        <Link href="/docs" className="text-sm font-semibold leading-6 text-white/80 hover:text-white transition-colors">
          Documentation
        </Link>
      </div>

      <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
        <Link href="/login" className="text-sm font-semibold leading-6 text-white/80 hover:text-white transition-colors px-4 py-2">
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
        >
          Sign up
        </Link>
      </div>
    </nav>
  </header>
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}