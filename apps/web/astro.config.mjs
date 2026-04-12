// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import node from '@astrojs/node';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const sentryBuildPlugin =
  process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT
    ? sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
      })
    : null;

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss(), ...(sentryBuildPlugin ? [sentryBuildPlugin] : [])],
    build: {
      sourcemap: 'hidden',
    },
    envPrefix: ['VITE_', 'PUBLIC_', 'ASTRO_']
  },

  redirects: {
    '/admin': '/whatsapp/admin',
    '/dashboard': '/whatsapp/inbox',
    '/agents': '/whatsapp/ai-agent',
    '/leads': '/whatsapp/crm',
    '/settings': '/whatsapp/settings',
    '/forms': '/whatsapp/flows',
    '/login': '/whatsapp/onboarding',
    '/app': '/whatsapp/inbox', // Legacy redirect
  },

  output: 'server',
  adapter: node({
    mode: 'standalone'
  })
});