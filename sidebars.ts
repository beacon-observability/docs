import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Zero-code instrumentation',
      link: {type: 'doc', id: 'zero-code/index'},
      items: [
        'zero-code/java',
        'zero-code/python',
        'zero-code/nodejs',
        'zero-code/dotnet',
        'zero-code/php',
      ],
    },
    {
      type: 'category',
      label: 'Profiling',
      link: {type: 'doc', id: 'profiling/index'},
      items: [
        'profiling/configuration',
        'profiling/java',
        'profiling/python',
        'profiling/nodejs',
      ],
    },
    'configuration/index',
    'troubleshooting/index',
  ],
};

export default sidebars;
