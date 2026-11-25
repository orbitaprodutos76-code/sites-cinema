import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// TODO: troque pela URL final do cliente (necessário para sitemap e Open Graph).
export default defineConfig({
  site: 'https://exemplo.com.br',
  integrations: [sitemap()],
});
