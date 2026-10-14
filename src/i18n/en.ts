import { localize } from './runtime';
export const en = localize({
  site: {
    name: 'Daykit',
    tagline: 'Useful tools for everyday tasks.',
    description: 'Free image and PDF tools, everyday calculators and practical guides.',
  },
  nav: {
    home: 'Home',
    tools: 'Tools',
    calculators: 'Calculators',
    exams: 'Exams',
    about: 'About',
    contact: 'Contact',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    disclaimer: 'Disclaimer',
  },
  ui: {
    language: 'Language',
    skip: 'Skip to content',
    navigation: 'Main navigation',
    breadcrumbs: 'Breadcrumbs',
    footer: 'Footer navigation',
    ad: 'Advertisement',
    adReserved: 'Reserved ad space',
    soon: 'Coming soon',
    explore: 'Explore',
    back: 'Back to home',
    settings: 'Cookie preferences',
    phase: 'The beginning of something useful',
    noAccount: 'No account needed to explore',
    local: 'Designed for on-device file processing',
    free: 'Built around free access',
    copyright: 'Daykit. Made for everyday curiosity.',
    draft: 'Launch information pending',
    draftBody:
      'This site is in development. The operator’s identity, jurisdiction and contact details must be completed before public launch.',
  },
  home: {
    title: 'Free image and PDF tools, calculators & exam resources',
    description:
      'Meet Daykit: free image and PDF tools, everyday calculators, exam photo workspaces and practical guides.',
    eyebrow: 'YOUR EVERYDAY INTERNET BREAK',
    headline: 'Make light work.',
    headlineAccent: 'Make room for more.',
    intro:
      'A handy corner of the internet for the things you need to do—and the little breaks in between.',
    primary: 'Discover the tools',
    secondary: 'Exam photo & signature tools',
    collection: 'A little help, in every direction.',
    collectionIntro: 'Image and PDF tools, ten calculators and practical guides are ready.',
    noteTitle: 'Your files belong with you.',
    noteBody:
      'Image and PDF tools process files in your browser. Your files are never uploaded to our servers. Keep originals and review downloaded results before using them.',
    noteLink: 'Our approach to privacy',
    preview: 'Explore the collection',
    previewTitle: 'Less busywork. More possibilities.',
    previewBody: 'Simple tools for everyday tasks, with space for a little curiosity.',
  },
  categories: {
    tools: {
      title: 'Everyday tools',
      description:
        'Free, browser-based image resizing, cropping and conversion tools. Your files stay on your device.',
      short: 'Resize, crop and convert images on your device. Ready when you are.',
      items: ['Image resizer', 'Photo crop', 'Format converters'],
      icon: '↗',
    },
    calculators: {
      title: 'Useful calculators',
      description:
        'Ten everyday calculators with transparent formulas, editable example inputs and clear explanations of their limits.',
      short: 'From everyday numbers to bigger plans. Clear answers, with the working.',
      items: ['Everyday maths', 'Planning tools', 'Unit conversions'],
      icon: '=',
    },
    exams: {
      title: 'Exam corner',
      description:
        'Exam photo and signature workspaces with specification tables, source records and clear verification labels.',
      short: 'Exam resources, with sources and clear verification labels.',
      items: ['Exam resources', 'Specification references'],
      icon: '⌁',
    },
  },
  category: {
    eyebrow: 'IN THE WORKS',
    heading: 'Good things take a little groundwork.',
    body: 'This collection is being built. The items below describe planned features, not currently available services.',
    planned: 'On the drawing board',
  },
  consent: {
    title: 'A small note on privacy',
    body: 'We only save your privacy choice on this device. Advertising and analytics are not active. You can change your choice at any time.',
    necessary: 'Necessary only',
    allow: 'Allow optional cookies',
    saved: 'Your privacy preference has been saved.',
    failed:
      'Your browser could not save this preference. It will apply only until you leave this page.',
    policy: 'Read our privacy policy',
  },
  pages: {
    about: {
      title: 'About Daykit',
      description: 'Learn about Daykit’s free file tools, calculators and exam resources.',
      intro: 'Useful things. Breathing room. All in one place.',
      sections: [
        {
          title: 'An everyday companion',
          body: 'Daykit is being built as a free collection of practical file tools, calculators and exam resources. Our primary audience is India, with visitors from the US, UK and elsewhere welcome too.',
        },
        {
          title: 'Building the collection',
          body: 'Image resizing, cropping, PDF and Office conversion, PDF editing and ten calculators are available now, supported by practical guides.',
        },
        {
          title: 'Thoughtful by design',
          body: 'Our approach is mobile-first and keyboard-accessible. Image and PDF processing happens on your device. Advertising has reserved space to keep pages steady, but no advertising script is active.',
        },
      ],
    },
    contact: {
      title: 'Contact Daykit',
      description: 'Contact information and launch status for Daykit.',
      intro: 'A place for questions, ideas and feedback.',
      sections: [
        {
          title: 'Contact availability',
          body: 'A public contact address has not been configured yet. A working email address will be listed here before public launch. This page does not collect or submit messages.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'How this development version of Daykit handles privacy preferences, files and planned services.',
      intro: 'Understand what this version does with your information.',
      sections: [
        {
          title: 'Current scope',
          body: 'This development version provides local image, PDF and Office tools, calculators and educational guides. Advertising, analytics and accounts are not active. This policy must be reviewed and updated when new services are enabled.',
        },
        {
          title: 'Privacy preferences',
          body: 'When you choose an option in the privacy banner, we store that choice and a timestamp in your browser’s local storage for up to 180 days. This keeps the banner from asking on every visit. You can reopen Cookie preferences in the footer or clear your browser storage.',
        },
        {
          title: 'Files and local processing',
          body: 'Most image and PDF processing runs on your device using browser workers and local rendering; for those tools, selected files are not uploaded or stored by the site. The six conversion tools (PDF to Word, PowerPoint and Excel; Word, PowerPoint and Excel to PDF) are different: after you tick the consent checkbox, your file is uploaded to our conversion service, converted, and deleted immediately after the response. The service keeps no copy and never logs file names or contents. Text-only tools such as PDF to text remain browser-only. Working data and previews remain in browser memory during the task. Downloads are saved by your browser and remain on your device until you remove them. Image decoders, PDF libraries and fonts are served as site assets; they do not send your documents to a conversion service. Calculations also run locally. Translation drafts are produced while authoring public site copy, not from visitor files.',
        },
        {
          title: 'Hosting and optional services',
          body: 'The hosting provider may process network information, such as IP addresses, to deliver and secure the site. The selected provider, retention practices and operator contact details must be documented before launch. The optional conversion service is a separate deployment run by the operator: it rate-limits requests, holds files only in temporary storage during conversion, and deletes them immediately after the response. This version has no accounts and no backend database connection.',
        },
        {
          title: 'Advertising and your choices',
          body: 'The reserved advertisement boxes are empty. No AdSense script is installed. Before advertising is enabled for visitors in the EEA, UK or Switzerland, a Google-certified consent management platform must be integrated. This development banner is not that platform.',
        },
        {
          title: 'Requests and updates',
          body: 'Contact details for privacy requests are pending. Before launch, the operator must publish a contact address and explain applicable access, correction, deletion and complaint procedures, as well as any international data transfers.',
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      description: 'Development-stage terms for using Daykit’s tools and calculators.',
      intro: 'A few ground rules for using Daykit.',
      sections: [
        {
          title: 'Development-stage service',
          body: 'Daykit is currently a preview. Features may be added, changed or removed. No guarantee is made about availability or suitability for a particular purpose.',
        },
        {
          title: 'Responsible use',
          body: 'Use the site lawfully. Do not attempt to disrupt it, bypass access controls or submit content you do not have permission to use.',
        },
        {
          title: 'Check important results',
          body: 'Calculator results are estimates under their displayed assumptions. Exam specifications remain unverified until checked against the official notification. Keep original files and inspect all exported pages; PDF compression removes selectable text and interactive features. Guides provide general explanations, not personalized advice.',
        },
        {
          title: 'Operator and applicable terms',
          body: 'Operator identity, jurisdiction, dispute procedures and any limitations permitted by applicable law must be completed before public launch. Nothing here is intended to override rights that cannot lawfully be excluded.',
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      description:
        'Important limits of Daykit’s calculators, exam resources, guides and local file tools.',
      intro: 'Useful assistance starts with clear limits.',
      sections: [
        {
          title: 'General information',
          body: 'The site is intended for general information and everyday assistance. Content and calculator results are not personalized financial, legal, medical or professional advice.',
        },
        {
          title: 'Sources and verification',
          body: 'Exam specifications, rates and other changeable reference data are maintained separately from the interface. Entries that have not been checked carry verified: false. Seeded exam specifications are blank and unverified. Calculator rates are editable examples, not current offers or guaranteed returns.',
        },
        {
          title: 'No affiliation claimed',
          body: 'Daykit does not claim endorsement by examination bodies, government agencies or third-party services. References to those organizations are informational.',
        },
      ],
    },
  },
  contact: {
    configured: 'Send us an email',
    title: 'Get in touch',
    body: 'Use the email link below for questions, ideas or feedback. Your email provider will handle the message.',
  },
  notFound: {
    title: 'Page not found',
    description: 'This Daykit page could not be found. Return home to explore the site.',
    heading: 'A little off the beaten path.',
    body: 'This page may have moved, or the address may be mistyped.',
  },
} as const);
