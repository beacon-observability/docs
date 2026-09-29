import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Beacon Documentation',
  tagline: 'OpenTelemetry-based zero-code instrumentation',
  favicon: 'img/favicon.svg',
  url: 'https://beacon-observability.github.io',
  baseUrl: '/docs/',
  organizationName: 'beacon-observability',
  projectName: 'docs',
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {onBrokenMarkdownLinks: 'throw'},
  },
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
    localeConfigs: {
      en: {label: 'English', htmlLang: 'en'},
      'zh-Hans': {label: '简体中文', htmlLang: 'zh-CN'},
    },
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/beacon-observability/docs/edit/main/',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
      } satisfies Options,
    ],
  ],
  themeConfig: {
    colorMode: {respectPrefersColorScheme: true},
    navbar: {
      title: 'Beacon',
      logo: {alt: 'Beacon logo', src: 'img/logo.svg'},
      items: [
        {to: '/zero-code/', label: 'Zero-code', position: 'left'},
        {to: '/configuration/', label: 'Configuration', position: 'left'},
        {type: 'localeDropdown', position: 'right'},
        {
          href: 'https://github.com/beacon-observability',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Zero-code setup', to: '/zero-code/'},
            {label: 'Troubleshooting', to: '/troubleshooting/'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'Beacon', href: 'https://github.com/beacon-observability/beacon'},
            {label: 'OpenTelemetry', href: 'https://opentelemetry.io/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Beacon contributors.`,
    },
    prism: {
      additionalLanguages: ['bash', 'java', 'powershell'],
    },
  } satisfies ThemeConfig,
};

export default config;
