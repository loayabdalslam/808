import Link from "next/link";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                808 Voice
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-6xl">
              Powerful Features for
              <span className="text-purple-600"> Voice Creation</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Discover the advanced capabilities that make 808 Voice the leading platform for AI-powered speech synthesis.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Natural Voice Synthesis",
                description: "Generate human-like speech with natural intonation and emotion using advanced AI models.",
                icon: "🎤",
              },
              {
                title: "30+ Premium Voices",
                description: "Choose from a diverse library of high-quality voices with different accents and personalities.",
                icon: "🎭",
              },
              {
                title: "Multi-Speaker Support",
                description: "Create conversations with multiple speakers for podcasts, audiobooks, and interactive content.",
                icon: "👥",
              },
              {
                title: "Real-time Processing",
                description: "Generate audio in seconds with our optimized processing pipeline and cloud infrastructure.",
                icon: "⚡",
              },
              {
                title: "Developer API",
                description: "Integrate voice synthesis into your applications with our simple and powerful REST API.",
                icon: "🔧",
              },
              {
                title: "Enterprise Security",
                description: "Bank-level security with encryption, compliance, and enterprise-grade infrastructure.",
                icon: "🛡️",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators using 808 Voice to bring their content to life.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Creating Free
          </Link>
        </div>
      </div>
    </div>
  );
}
