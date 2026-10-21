import { localize } from './runtime';
export const en = localize({
  site: {
    name: 'PDF Converter',
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
    soon: 'Tools',
    explore: 'Explore',
    back: 'Back to home',
    settings: 'Cookie preferences',
    phase: 'Practical guides included',
    noAccount: 'No account needed to explore',
    local: 'Local tools, clear upload choices',
    free: 'Built around free access',
    copyright: 'PDF Converter. Made for everyday curiosity.',
  },
  home: {
    title: 'Free image and PDF tools, calculators & exam resources',
    description:
      'Meet PDF Converter: free image and PDF tools, everyday calculators, exam photo workspaces and practical guides.',
    eyebrow: 'PDF, IMAGES AND EVERYDAY CALCULATIONS',
    headline: 'PDF and image tools.',
    headlineAccent: 'Clear results, fewer steps.',
    intro:
      'Merge, split and edit PDFs, resize images, and use calculators with explained assumptions. Choose a tool, process your file and review the download.',
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
      items: ['Everyday maths', 'Planning tools', 'Loan estimates'],
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
    eyebrow: 'TOOL COLLECTION',
    heading: 'Choose a task to get started.',
    body: 'Choose an available tool and review its instructions and limitations.',
    planned: 'Tool information',
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
      title: 'About PDF Converter',
      description: 'Learn about PDF Converter’s free file tools, calculators and exam resources.',
      intro: 'Useful things. Breathing room. All in one place.',
      sections: [
        {
          title: 'An everyday companion',
          body: 'PDF Converter is run by Akash Patil, an independent developer in Bengaluru, India. It exists to make routine document and image preparation easier without requiring an account. Tools are accompanied by instructions so you can understand what changes and check the result.',
        },
        {
          title: 'Tools and guidance',
          body: 'The tool directory provides image resizing, cropping, format conversion and PDF editing, alongside ten calculators and practical guides. Office/PDF conversion tools appear only when the separately hosted conversion service passes its publication check.',
        },
        {
          title: 'Thoughtful by design',
          body: 'Image tools and most PDF tools process files on your device. The six Office/PDF conversion tools upload files to the separately hosted converter after your consent, when that service is configured. Review converted files and calculator results before relying on them. No advertising or analytics script is active.',
        },
      ],
    },
    contact: {
      title: 'Contact PDF Converter',
      description: 'Contact Akash Patil about PDF Converter tools, feedback and privacy questions.',
      intro: 'A place for questions, ideas and feedback.',
      sections: [
        {
          title: 'Contact the developer',
          body: 'Email pdfconverter.help@gmail.com about bugs, privacy requests or corrections. Include the relevant page and a description without attaching sensitive documents. This page has no contact form.',
        },
      ],
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'How PDF Converter handles files, browser storage, hosting and privacy questions.',
      intro: 'Understand what this version does with your information.',
      sections: [
        {
          title: 'Current scope',
          body: 'This website provides image and PDF tools, calculators and educational guides. Six Office/PDF conversion tools are published only when the configured server passes a build-time health check. Advertising, analytics and accounts are not active. This policy must be reviewed and updated when new services are enabled.',
        },
        {
          title: 'Privacy preferences',
          body: 'No cookie banner, advertising loader or analytics script is active. An earlier version stored a privacy choice in local storage; you can remove that old entry through your browser settings. Current tools use browser memory for selected files, previews and calculations. No account is required.',
        },
        {
          title: 'Files and local processing',
          body: 'Most image and PDF processing runs on your device using browser workers and local rendering; for those tools, selected files are not uploaded or stored by the site. The six conversion tools (PDF to Word, PowerPoint and Excel; Word, PowerPoint and Excel to PDF) are different: after you tick the consent checkbox, your file is uploaded to our conversion service, converted in a temporary job folder, and scheduled for cleanup when processing finishes. Cleanup also attempts to remove stale folders. Failures or interrupted service operation may delay deletion; no absolute deletion deadline is promised. Application code does not intentionally log document names or contents; infrastructure logging is controlled separately. Working data and previews remain in browser memory during the task. Downloads are saved by your browser and remain on your device until you remove them. Image decoders and PDF libraries are served as site assets; they do not send your documents to a conversion service. Calculations also run locally. The published interface is English only.',
        },
        {
          title: 'Hosting and optional services',
          body: 'Cloudflare Pages hosts the frontend; the conversion service is hosted separately on Render. These providers receive network information such as IP addresses and request metadata to deliver and secure requests. Provider log retention, processing locations and international transfers have not been confirmed by the operator. The converter uses IP addresses for short-lived in-memory rate limiting; its configured server command disables access logs. No accounts or application database are implemented. General Sans loads from Fontshare; DM Sans and JetBrains Mono load from Google Fonts, so those providers receive font requests and network metadata, but not your documents.',
        },
        {
          title: 'Advertising and your choices',
          body: 'Advertising is disabled and empty ad boxes are not displayed. No AdSense script is installed. If advertising is introduced, this policy and the consent controls will be updated first. For any future advertising for visitors in the EEA, UK or Switzerland, a Google-certified consent management platform must be integrated. No advertising consent banner is currently displayed.',
        },
        {
          title: 'Children and retention',
          body: 'The service is intended for general document tasks, not to collect information from children. A parent or guardian should supervise use involving a child’s documents and contact the operator with concerns. Downloads remain on your device until you remove them. Conversion files use temporary storage and cleanup is attempted after processing; service interruptions can delay it. Provider log retention has not been verified, so no fixed retention or complete-erasure guarantee is made.',
        },
        {
          title: 'Requests and updates',
          body: 'Contact the operator using the email above for privacy questions, access, correction, deletion or complaints. Describe the request without attaching sensitive documents. Applicable rights and provider practices depend on your circumstances and require operator review; this policy does not claim universal legal compliance.',
        },
      ],
    },
    terms: {
      title: 'Terms of Use',
      description: 'Terms for using PDF Converter’s file tools, calculators and guides.',
      intro: 'A few ground rules for using PDF Converter.',
      sections: [
        {
          title: 'Service availability',
          body: 'Features may change and maintenance can interrupt access. No guarantee is made about availability or suitability for a particular purpose.',
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
          body: 'PDF Converter is operated by Akash Patil, an independent developer in Bengaluru, India. The service is supplied as available, without a promise of uninterrupted operation or error-free output. To the extent permitted by applicable law, the operator does not accept responsibility for losses from reliance on unreviewed results. Nothing here excludes rights or liabilities that cannot lawfully be excluded. Contact the operator about concerns; these Terms are governed by the laws of India, subject to applicable law and rights that cannot be excluded.',
        },
      ],
    },
    disclaimer: {
      title: 'Disclaimer',
      description:
        'Important limits of PDF Converter’s calculators, exam resources, guides and local file tools.',
      intro: 'Useful assistance starts with clear limits.',
      sections: [
        {
          title: 'General information',
          body: 'The site is intended for general information and everyday assistance. Content and calculator results are not personalized financial, legal, medical or professional advice.',
        },
        {
          title: 'Sources and verification',
          body: 'Exam specifications, rates and other changeable reference data are maintained separately from the interface. Verification status and source dates are shown on each exam record. Unverified records are excluded from search indexing and navigation. Calculator rates are editable examples, not current offers or guaranteed returns.',
        },
        {
          title: 'No affiliation claimed',
          body: 'PDF Converter does not claim endorsement by examination bodies, government agencies or third-party services. References to those organizations are informational.',
        },
      ],
    },
  },
  contact: {
    configured: 'Send us an email',
    title: 'Get in touch',
    body: 'Use the email link below for tool problems, accessibility issues, feedback, licensing or privacy questions. Include the tool name and a description of the problem; do not attach sensitive documents. PDF Converter is maintained by an individual developer, so responses may take time. Your email provider handles the message; this page does not submit a form.',
  },
  notFound: {
    title: 'Page not found',
    description: 'This PDF Converter page could not be found. Return home to explore the site.',
    heading: 'A little off the beaten path.',
    body: 'This page may have moved, or the address may be mistyped.',
  },
} as const);
