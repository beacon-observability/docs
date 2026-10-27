# Beacon Docs

The bilingual documentation site for Beacon zero-code instrumentation,
profiling, Security, Ruby source integration, the Fastrace Rust SDK, and Rumable browser RUM. Each setup guide stays short and release-specific. Fastrace content is maintained in English in both locale routes.

## Local development

```bash
npm install
npm start
```

Use `npm run start:zh` to preview Simplified Chinese. Before submitting a change, run:

```bash
npm run check
npm run build
```

English source documents live in `docs/`. Simplified Chinese translations mirror the same paths under `i18n/zh-Hans/docusaurus-plugin-content-docs/current/`. The check script rejects missing translations and prohibited product wording.
