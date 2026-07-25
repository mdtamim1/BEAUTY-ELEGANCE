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
}) => {
  const domain = 'https://beauty-elegance-ec88f.web.app';
  const url = canonicalUrl || (slug ? `${domain}/${slug.replace(/^\//, '')}` : domain);
  const fullTitle = title.includes('Tamim Global') ? title : `${title} | Tamim Global`;

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
        aggregateRating: product.rating
          ? {
              '@type': 'AggregateRating',
              ratingValue: product.rating,
              reviewCount: product.reviewsCount || 12,
              bestRating: '5',
              worstRating: '1',
            }
          : undefined,
      }
    : null;

  // 3. Breadcrumb Schema
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
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={url} />

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
      {productSchema && <script type="application/ld+json">{JSON.stringify(productSchema)}</script>}
      {breadcrumbSchema && <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>}
    </Helmet>
  );
};
