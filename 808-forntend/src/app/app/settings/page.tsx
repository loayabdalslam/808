"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("http://localhost:8000");
  const [apiStatus, setApiStatus] = useState<"checking" | "healthy" | "unhealthy">("checking");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    // Load settings from localStorage
    const storedApiKey = localStorage.getItem("apiKey");
    const storedApiUrl = localStorage.getItem("apiUrl");
    
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    if (storedApiUrl) {
      setApiUrl(storedApiUrl);
    }
    
    // Check API status
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      setApiStatus("checking");
      const storedApiKey = localStorage.getItem("apiKey");
      const storedApiUrl = localStorage.getItem("apiUrl") || "http://localhost:8000";
      
      if (!storedApiKey) {
        setApiStatus("unhealthy");
        return;
      }
      
      const response = await fetch(`${storedApiUrl}/health`, {
        headers: {
          "Authorization": `Bearer ${storedApiKey}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiStatus(data.status === "healthy" ? "healthy" : "unhealthy");
      } else {
        setApiStatus("unhealthy");
      }
    } catch (error) {
      console.error("Error checking API status:", error);
      setApiStatus("unhealthy");
    }
  };

  const saveSettings = () => {
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("apiUrl", apiUrl);
    
    setSaveMessage("Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
    
    checkApiStatus();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Configure your 808 Voice API settings</p>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">API Configuration</h2>
        
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              API Key
            </label>
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Your API key is stored locally and is never sent to our servers.
          </p>
        </div>
        
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            API URL
          </label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:8000"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            The base URL of the 808 Voice API.
          </p>
        </div>
        
        <div className="mb-6 flex items-center">
          <span className="mr-2 text-sm font-medium text-gray-700">API Status:</span>
          {apiStatus === "checking" ? (
            <span className="flex items-center text-gray-600">
              <svg className="mr-1 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </span>
          ) : apiStatus === "healthy" ? (
            <span className="flex items-center text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M20 6 9 17l-5-5"></path>
              </svg>
              Healthy
            </span>
          ) : (
            <span className="flex items-center text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
              Unhealthy
            </span>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={checkApiStatus}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Test Connection
          </button>
          <button
            type="button"
            onClick={saveSettings}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
        
        {saveMessage && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-green-800">
            {saveMessage}
          </div>
        )}
      </div>

      <div className="mt-8 rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">About</h2>
        <p className="text-gray-600">
          808 Voice is a powerful text-to-speech application powered by Gemini TTS. 
          This application allows you to convert text to natural-sounding speech and 
          create multi-speaker conversations.
        </p>
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-medium">Version</h3>
          <p className="text-gray-600">1.0.0</p>
        </div>
      </div>
    </div>
  );
}
