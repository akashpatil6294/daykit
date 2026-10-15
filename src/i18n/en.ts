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
    local: 'Local tools, clear upload choices',
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
      'Image tools and most PDF tools run in your browser. Office/PDF conversions upload files to the configured converter with your consent. Keep originals and review downloaded results.',
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
          body: 'Image tools and most PDF tools process files on your device. The six Office/PDF conversion tools upload files to the separately hosted converter after your consent, when that service is configured. Review converted files and calculator results before relying on them. No advertising or analytics script is active.',
        },
      ],
    },
    contact: {
      title: 'Contact Daykit',
      description: 'Contact Akash Patil about Daykit tools, feedback and privacy questions.',
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
        'How Daykit handles files, browser storage, hosting and privacy questions.',
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
          body: 'Most image and PDF processing runs on your device using browser workers and local rendering; for those tools, selected files are not uploaded or stored by the site. The six conversion tools (PDF to Word, PowerPoint and Excel; Word, PowerPoint and Excel to PDF) are different: after you tick the consent checkbox, your file is uploaded to our conversion service, converted in a temporary job folder, and scheduled for cleanup when processing finishes. Cleanup also attempts to remove stale folders. Failures or interrupted service operation may delay deletion; no absolute deletion deadline is promised. Application code does not intentionally log document names or contents; infrastructure logging is controlled separately. Text-only tools such as PDF to text remain browser-only. Working data and previews remain in browser memory during the task. Downloads are saved by your browser and remain on your device until you remove them. Image decoders, PDF libraries and fonts are served as site assets; they do not send your documents to a conversion service. Calculations also run locally. Translation drafts are produced while authoring public site copy, not from visitor files.',
        },
        {
          title: 'Hosting and optional services',
          body: 'Cloudflare Pages hosts the frontend; the conversion service is hosted separately on Render. These providers receive network information such as IP addresses and request metadata to deliver and secure requests. Provider log retention, processing locations and international transfers have not yet been confirmed by the operator. The converter uses IP addresses for short-lived in-memory rate limiting; its configured server command disables access logs. No accounts or application database are implemented. General Sans loads from Fontshare; DM Sans and JetBrains Mono load from Google Fonts, so those providers receive font requests and network metadata, but not your documents.',
        },
        {
          title: 'Advertising and your choices',
          body: 'Advertising is disabled and empty ad boxes are not displayed. No AdSense script is installed. The saved privacy preference does not activate any tracking. Before advertising is enabled for visitors in the EEA, UK or Switzerland, a Google-certified consent management platform must be integrated. This development banner is not that platform.',
        },
        {
          title: 'Requests and updates',
          body: 'Contact the operator using the email above for privacy questions, access, correction, deletion or complaints. Describe the request without attaching sensitive documents. Applicable rights and provider practices depend on your circumstances and require operator review; this policy does not claim universal legal compliance.',
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
          body: 'Use the site lawfully. You remain responsible for documents you submit and must have permission to process them. Do not disrupt the service, bypass limits or access controls, or upload malicious content. You retain rights in your documents. Third-party software remains subject to its own licenses, published in the site license notices.',
        },
        {
          title: 'Check important results',
          body: 'Calculator results are estimates under their displayed assumptions. Exam specifications remain unverified until checked against the official notification. Keep original files and inspect all exported pages; PDF compression removes selectable text and interactive features. Guides provide general explanations, not personalized advice.',
        },
        {
          title: 'Operator and applicable terms',
          body: 'Daykit is operated by Akash Patil, an individual developer in India. The service is supplied as available, without a promise of uninterrupted operation or error-free output. To the extent permitted by applicable law, the operator does not accept responsibility for losses from reliance on unreviewed results. Nothing here excludes rights or liabilities that cannot lawfully be excluded. Contact the operator about concerns; jurisdiction and dispute provisions require qualified legal review.',
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
    body: 'Use the email link below for tool problems, accessibility issues, feedback, licensing or privacy questions. Include the tool name and a description of the problem; do not attach sensitive documents. Daykit is maintained by an individual developer, so responses may take time. Your email provider handles the message; this page does not submit a form.',
  },
  notFound: {
    title: 'Page not found',
    description: 'This Daykit page could not be found. Return home to explore the site.',
    heading: 'A little off the beaten path.',
    body: 'This page may have moved, or the address may be mistyped.',
  },
} as const);
