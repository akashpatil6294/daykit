export const toolCatalog = [
  { slug: 'resize-image-kb', mode: 'size', accept: 'image/jpeg,image/png,image/webp', kind: 'any' },
  {
    slug: 'resize-image-pixels',
    mode: 'pixels',
    accept: 'image/jpeg,image/png,image/webp',
    kind: 'any',
  },
  { slug: 'jpg-to-png', mode: 'jpg-to-png', accept: 'image/jpeg,.jpg,.jpeg', kind: 'jpeg' },
  { slug: 'png-to-jpg', mode: 'png-to-jpg', accept: 'image/png,.png', kind: 'png' },
  { slug: 'webp-to-jpg', mode: 'webp-to-jpg', accept: 'image/webp,.webp', kind: 'webp' },
  {
    slug: 'heic-to-jpg',
    mode: 'heic-to-jpg',
    accept: '.heic,.heif,image/heic,image/heif',
    kind: 'heic',
  },
  {
    slug: 'passport-photo',
    mode: 'passport',
    accept: 'image/jpeg,image/png,image/webp',
    kind: 'any',
  },
] as const;
export type ToolMode = (typeof toolCatalog)[number]['mode'];
export type InputKind = (typeof toolCatalog)[number]['kind'];
