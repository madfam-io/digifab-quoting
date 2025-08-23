'use client';

import { useEffect, useState } from 'react';

export default function TestApiPage() {
  const [status, setStatus] = useState<
    Record<
      string,
      {
        status?: number;
        statusText?: string;
        ok?: boolean;
        url: string;
        error?: string;
      }
    >
  >({});

  useEffect(() => {
    const testEndpoints = async () => {
      const endpoints = [
        { name: 'NextAuth Session', url: '/api/auth/session', method: 'GET' },
        { name: 'API Health', url: '/api/v1/health', method: 'GET' },
        { name: 'Direct API Health', url: 'http://localhost:4000/api/v1/health', method: 'GET' },
      ];

      const results: Record<
        string,
        {
          status?: number;
          statusText?: string;
          ok?: boolean;
          url: string;
          error?: string;
        }
      > = {};

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, { method: endpoint.method });
          results[endpoint.name] = {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            url: endpoint.url,
          };
        } catch (error) {
          results[endpoint.name] = {
            error: error instanceof Error ? error.message : 'Unknown error',
            url: endpoint.url,
          };
        }
      }

      setStatus(results);
    };

    testEndpoints();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      <div className="space-y-4">
        {Object.entries(status).map(([name, result]) => (
          <div key={name} className={`p-4 rounded ${result.ok ? 'bg-green-100' : 'bg-red-100'}`}>
            <h2 className="font-semibold">{name}</h2>
            <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Environment Variables</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">
          NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || 'not set'}
        </pre>
      </div>
    </div>
  );
}
