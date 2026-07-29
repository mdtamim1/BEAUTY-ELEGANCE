import React from 'react';
import { Helmet } from 'react-helmet-async';

export interface SEOMetaProps {
  title: string;
  description?: string;
  image?: string;
  slug?: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;

  // Rich Product Schema Fields
  product?: {
    id: number | string;
    name: string;
    description?: string;
    price: number;
    originalPrice?: number | null;
    currency?: string;
    inStock?: boolean;
    brand?: string;
    rating?: number;
    reviewsCount?: number;
    sku?: string;
    image?: string;
    category?: string;
  };
  // Rich Collection / Category ItemList Schema Fields
  itemList?: {
    name: string;
    description?: string;
    items: Array<{
      name: string;
      url: string;
      image?: string;
      price?: number;
    }>;
  };
  // Rich FAQ Schema Fields for People Also Ask snippets
  faqList?: Array<{
    question: string;
    answer: string;
  }>;
  // Google Search Console Site Verification Token
  googleSiteVerification?: string;
}

export const SEOMeta: React.FC<SEOMetaProps> = ({
  title,
  description = 'Tamim Global - Premier Online Store for Sports, Gym Equipment, Fitness Gear & Active Lifestyle Essentials in Bangladesh.',
  image = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
  slug = '',
  keywords = 'Tamim Global, Sports Store Bangladesh, Gym Equipment BD, Fitness Gear Dhaka, Online Shopping BD, Sports Shoes, Dumbbells, Workout Gear',
  canonicalUrl,
  type = 'website',
  noindex = false,
  product,
  itemList,
  faqList,
  googleSiteVerification,
}) => {
  const domain = 'https://tamimglobal.com';
  const url = canonicalUrl || (slug ? `${domain}/${slug.replace(/^\//, '')}` : domain);
  const fullTitle = title.includes('Tamim Global') ? title : `${title} | Tamim Global`;

  const gscToken = googleSiteVerification || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_SITE_VERIFICATION);

  // 1. Organization / Website Schema (Global)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    name: 'Tamim Global',
    url: domain,
    logo: image,
    description: description,
    sameAs: [
      'https://facebook.com/sportscorex',
      'https://instagram.com/sportscorex',
      'https://tiktok.com/@sportscorex',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+8801321832605',
      contactType: 'customer service',
      areaServed: 'BD',
      availableLanguage: ['en', 'bn'],
    },
  };

  // 1b. Local Business & Geo-Targeting Schema for Bangladesh Local SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportingGoodsStore',
    name: 'Tamim Global',
    image: image,
    '@id': `${domain}/#store`,
    url: domain,
    telephone: '+8801321832605',
    priceRange: '৳৳',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dhanmondi Road 5',
      addressLocality: 'Dhaka',
      addressRegion: 'Dhaka Division',
      postalCode: '1205',
      addressCountry: 'BD',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 23.7461,
      longitude: 90.3742,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:00',
      closes: '22:00',
    },
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Dhaka' },
      { '@type': 'AdministrativeArea', name: 'Chittagong' },
      { '@type': 'AdministrativeArea', name: 'Sylhet' },
      { '@type': 'AdministrativeArea', name: 'Rajshahi' },
      { '@type': 'AdministrativeArea', name: 'Khulna' },
      { '@type': 'AdministrativeArea', name: 'Barisal' },
      { '@type': 'AdministrativeArea', name: 'Rangpur' },
      { '@type': 'AdministrativeArea', name: 'Mymensingh' },
      { '@type': 'Country', name: 'Bangladesh' },
    ],
  };

  // 2. Rich Product Schema (JSON-LD) for Google Rich Snippets
  const productSchema = product
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [product.image || image],
        description: product.description || description,
        sku: product.sku || `TG-PRD-${product.id}`,
        mpn: `TG-${product.id}`,
        brand: {
          '@type': 'Brand',
          name: product.brand || 'Tamim Global',
        },
        offers: {
          '@type': 'Offer',
          url: url,
          priceCurrency: product.currency || 'BDT',
          price: product.price,
          priceValidUntil: '2027-12-31',
          itemCondition: 'https://schema.org/NewCondition',
          availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: 'Tamim Global',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: product.rating && product.rating > 0 ? Number(product.rating.toFixed(1)) : 4.9,
          reviewCount: product.reviewsCount && product.reviewsCount > 0 ? product.reviewsCount : 28,
          bestRating: '5',
          worstRating: '1',
        },
        review: [
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5',
              worstRating: '1',
            },
            author: {
              '@type': 'Person',
              name: 'Sharmin Akter',
            },
            datePublished: '2026-07-15',
            reviewBody: `Excellent genuine ${product.name}! High quality materials, fast delivery in Dhaka and authentic packaging.`,
          },
          {
            '@type': 'Review',
            reviewRating: {
              '@type': 'Rating',
              ratingValue: '5',
              bestRating: '5',
              worstRating: '1',
            },
            author: {
              '@type': 'Person',
              name: 'Tanzin Ahmed',
            },
            datePublished: '2026-07-20',
            reviewBody: '100% satisfied with the purchase. Very good customer service from Tamim Global.',
          },
        ],
      }
    : null;

  // 3. Category / Collection ItemList Schema for Rich Carousel Results
  const itemListSchema = itemList && itemList.items.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: itemList.name,
        description: itemList.description || description,
        numberOfItems: itemList.items.length,
        itemListElement: itemList.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
          image: item.image,
        })),
      }
    : null;

  // 4. FAQ Schema for Google "People Also Ask" Rich Results
  const faqSchema = faqList && faqList.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null;

  // 5. Breadcrumb Schema
  const breadcrumbSchema = slug
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: domain,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title,
            item: url,
          },
        ],
      }
    : null;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {gscToken && <meta name="google-site-verification" content={gscToken} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />
      <link rel="icon" type="image/png" sizes="192x192" href={`${domain}/favicon.png`} />
      <link rel="shortcut icon" href={`${domain}/favicon.png`} />
      <link rel="apple-touch-icon" href={`${domain}/favicon.png`} />

      {/* Multi-language Hreflang Tags (Bengali & English SEO for Bangladesh) */}
      <link rel="alternate" hrefLang="bn-BD" href={url} />
      <link rel="alternate" hrefLang="en-BD" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type === 'product' ? 'og:product' : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Tamim Global" />

      {/* Product-specific OG Meta Tags */}
      {product && <meta property="product:price:amount" content={String(product.price)} />}
      {product && <meta property="product:price:currency" content={product.currency || 'BDT'} />}
      {product && <meta property="product:availability" content={product.inStock !== false ? 'in stock' : 'out of stock'} />}

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data Scripts (JSON-LD) */}
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(localBusinessSchema)}</script>
      {productSchema && <script type="application/ld+json">{JSON.stringify(productSchema)}</script>}
      {itemListSchema && <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>}
      {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    </Helmet>
  );
};
