import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Getting Started
              </div>
              <ul className="space-y-1 ml-4">
                <li><a href="#introduction" className="text-purple-600 hover:text-purple-800">Introduction</a></li>
                <li><a href="#authentication" className="text-gray-600 hover:text-gray-900">Authentication</a></li>
                <li><a href="#quick-start" className="text-gray-600 hover:text-gray-900">Quick Start</a></li>
              </ul>

              <div className="text-sm font-semibold text-gray-900 uppercase tracking-wide mt-6">
                API Reference
              </div>
              <ul className="space-y-1 ml-4">
                <li><a href="#tts-endpoint" className="text-gray-600 hover:text-gray-900">Text-to-Speech</a></li>
                <li><a href="#multi-speaker" className="text-gray-600 hover:text-gray-900">Multi-Speaker</a></li>
                <li><a href="#voices" className="text-gray-600 hover:text-gray-900">Available Voices</a></li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-lg max-w-none">
              <h1 id="introduction">808 Voice API Documentation</h1>
              <p className="text-xl text-gray-600">
                Welcome to the 808 Voice API documentation. This guide will help you integrate our powerful voice synthesis capabilities into your applications.
              </p>

              <h2 id="authentication">Authentication</h2>
              <p>All API requests require authentication using an API key. Include your API key in the Authorization header:</p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                <code>Authorization: Bearer YOUR_API_KEY</code>
              </div>

              <h2 id="quick-start">Quick Start</h2>
              <p>Here's a simple example to generate speech from text:</p>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                <pre>{`curl -X POST http://localhost:8000/tts \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
    "text": "Hello, world!",
    "voice": "Zephyr"
  }'`}</pre>
              </div>

              <h2 id="tts-endpoint">Text-to-Speech Endpoint</h2>
              <p><strong>POST</strong> <code>/tts</code></p>
              <p>Convert text to speech using a single voice.</p>

              <h3>Request Body</h3>
              <ul>
                <li><code>text</code> (string, required): The text to convert to speech</li>
                <li><code>voice</code> (string, required): The voice to use (see available voices below)</li>
              </ul>

              <h3>Response</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                <pre>{`{
  "audio_url": "http://localhost:8000/audio/filename.wav",
  "duration": 2.5,
  "characters_used": 13
}`}</pre>
              </div>

              <h2 id="multi-speaker">Multi-Speaker Endpoint</h2>
              <p><strong>POST</strong> <code>/multi-speaker-tts</code></p>
              <p>Create conversations with multiple speakers.</p>

              <h3>Request Body</h3>
              <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm">
                <pre>{`{
  "segments": [
    {
      "text": "Hello there!",
      "voice": "Zephyr"
    },
    {
      "text": "Hi, how are you?",
      "voice": "Aria"
    }
  ]
}`}</pre>
              </div>

              <h2 id="voices">Available Voices</h2>
              <p>808 Voice offers a variety of high-quality voices:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
                {[
                  "Zephyr", "Aria", "Nova", "Echo", "Sage", "Luna",
                  "Phoenix", "River", "Storm", "Blaze", "Ocean", "Sky"
                ].map((voice) => (
                  <div key={voice} className="bg-gray-50 rounded-lg p-3">
                    <code className="text-purple-600 font-semibold">{voice}</code>
                  </div>
                ))}
              </div>

              <h2>Error Handling</h2>
              <p>The API uses standard HTTP status codes. Common errors include:</p>
              <ul>
                <li><code>400</code> - Bad Request (invalid parameters)</li>
                <li><code>401</code> - Unauthorized (invalid API key)</li>
                <li><code>429</code> - Rate limit exceeded</li>
                <li><code>500</code> - Internal server error</li>
              </ul>

              <h2>Rate Limits</h2>
              <p>API requests are rate limited based on your plan:</p>
              <ul>
                <li><strong>Free:</strong> 10 requests per minute</li>
                <li><strong>Pro:</strong> 100 requests per minute</li>
                <li><strong>Enterprise:</strong> Custom limits</li>
              </ul>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold text-purple-900 mb-2">Need Help?</h3>
                <p className="text-purple-800">
                  If you have questions or need support, please contact us at{" "}
                  <a href="mailto:support@808voice.com" className="text-purple-600 hover:text-purple-800">
                    support@808voice.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
