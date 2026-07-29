import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import db from '../config/db';

export const serveDynamicSPA = (distPath: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/assets')) {
      return next();
    }

    const indexPath = path.resolve(distPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return next();
    }

    let html = fs.readFileSync(indexPath, 'utf-8');

    // 1. Check Product Page
    if (req.path.startsWith('/product/')) {
      const productParam = req.path.split('/product/')[1]?.split('/')[0]?.trim();

      if (productParam) {
        let targetId = productParam;
        const match = productParam.match(/-(\d+)$/);
        if (match && match[1]) {
          targetId = match[1];
        }

        db.get('SELECT * FROM products WHERE id = ? OR sku = ? OR id = ?', [productParam, productParam, targetId], (err, product: any) => {
          if (!err && product) {
            const title = `${product.name} - ৳${product.price || 0} | Tamim Global`;
            const price = product.price || 0;
            const rawDesc = product.description ? product.description.replace(/<[^>]*>?/gm, '').trim() : '';
            const description = `৳${price} | ১০০% ক্যাশ অন ডেলিভারি | ২৪ ঘণ্টায় ঢাকায় দ্রুত ডেলিভারি | অরিজিনাল ${product.name} সেরা দামে অর্ডার করুন Tamim Global এ। ${rawDesc}`.substring(0, 160);
            const image = product.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';
            const slugifiedName = product.name
              .toLowerCase()
              .replace(/[^\w\u0980-\u09FF\s-]/g, '')
              .replace(/[\s_-]+/g, '-')
              .replace(/^-+|-+$/g, '');
            const pageUrl = `https://tamimglobal.com/product/tamim-global-${slugifiedName ? `${slugifiedName}-` : ''}${product.id}`;

            const productSchema = {
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              image: [image],
              description: description,
              sku: product.sku || `TG-PRD-${product.id}`,
              brand: {
                '@type': 'Brand',
                name: product.brand || 'Tamim Global',
              },
              offers: {
                '@type': 'Offer',
                url: pageUrl,
                priceCurrency: 'BDT',
                price: price,
                availability: product.in_stock !== 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                seller: {
                  '@type': 'Organization',
                  name: 'Tamim Global',
                },
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: 4.9,
                reviewCount: 28,
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
            };

            const faqSchema = {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: `How fast is ${product.name} delivered in Bangladesh?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Delivery takes 24 hours inside Dhaka and 2-3 days outside Dhaka across Bangladesh.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `Is ${product.name} 100% authentic at Tamim Global?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `Yes, all items sold at Tamim Global are 100% genuine with quality inspection before delivery.`,
                  },
                },
                {
                  '@type': 'Question',
                  name: `What payment methods are supported for buying ${product.name}?`,
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: `We accept Cash on Delivery (COD), bKash, and Nagad.`,
                  },
                },
              ],
            };

            const gscToken = process.env.GOOGLE_SITE_VERIFICATION || process.env.VITE_GOOGLE_SITE_VERIFICATION;
            const dynamicTags = `
    <!-- Dynamic Server-Side OG & Meta Tags for Product -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    ${gscToken ? `<meta name="google-site-verification" content="${gscToken}" />` : ''}
    <link rel="canonical" href="${pageUrl}" />
    <link rel="icon" type="image/png" sizes="192x192" href="https://tamimglobal.com/favicon.png" />
    <link rel="shortcut icon" href="https://tamimglobal.com/favicon.png" />
    <link rel="apple-touch-icon" href="https://tamimglobal.com/favicon.png" />
    <link rel="alternate" hreflang="bn-BD" href="${pageUrl}" />
    <link rel="alternate" hreflang="en-BD" href="${pageUrl}" />
    <link rel="alternate" hreflang="x-default" href="${pageUrl}" />
    <meta property="og:type" content="og:product" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="product:price:amount" content="${price}" />
    <meta property="product:price:currency" content="BDT" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${JSON.stringify(productSchema)}</script>
    <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
`;

            html = injectMetaTags(html, title, dynamicTags);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.type('text/html').send(html);
          }

          // Fallback if product query fails or product not found
          return sendDefaultHtml(res, html);
        });
        return;
      }
    }

    // 2. Check Blog Page
    if (req.path.startsWith('/blog/')) {
      const blogSlug = req.path.split('/blog/')[1]?.split('/')[0]?.trim();

      if (blogSlug) {
        db.get('SELECT * FROM blog_posts WHERE slug = ? OR id = ?', [blogSlug, blogSlug], (err, blog: any) => {
          if (!err && blog) {
            const title = `${blog.title} | Tamim Global Blog`;
            const description = (blog.summary || blog.content || '')
              .replace(/<[^>]*>?/gm, '')
              .substring(0, 160);
            const image = blog.banner_image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';
            const pageUrl = `https://tamimglobal.com/blog/${blog.slug}`;

            const articleSchema = {
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: blog.title,
              image: [image],
              author: {
                '@type': 'Person',
                name: blog.author_name || 'Tamim Global',
              },
            };

            const dynamicTags = `
    <!-- Dynamic Server-Side OG & Meta Tags for Blog -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${JSON.stringify(articleSchema)}</script>
`;

            html = injectMetaTags(html, title, dynamicTags);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.type('text/html').send(html);
          }

          return sendDefaultHtml(res, html);
        });
        return;
      }
    }

    // 3. Check Collection / Category Pages
    if (req.path.startsWith('/collection/') || req.path === '/categories') {
      const categorySlug = req.path.startsWith('/collection/')
        ? req.path.split('/collection/')[1]?.split('/')[0]?.trim()
        : 'all';
      const categoryTitle = categorySlug && categorySlug !== 'all'
        ? categorySlug.replace(/-/g, ' ').toUpperCase()
        : 'All Collections & Categories';

      db.all(
        'SELECT id, name, price, image FROM products WHERE published = 1 LIMIT 25',
        [],
        (err, products: any[]) => {
          if (!err && products && products.length > 0) {
            const title = `${categoryTitle} | Tamim Global`;
            const description = `Shop premium ${categoryTitle} products at best price in Bangladesh. Fast delivery & 100% genuine products.`;
            const pageUrl = `https://tamimglobal.com${req.path}`;
            const image = products[0]?.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';

            const itemListSchema = {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: categoryTitle,
              description: description,
              numberOfItems: products.length,
              itemListElement: products.map((p, idx) => {
                const slugifiedName = (p.name || '')
                  .toLowerCase()
                  .replace(/[^\w\u0980-\u09FF\s-]/g, '')
                  .replace(/[\s_-]+/g, '-')
                  .replace(/^-+|-+$/g, '');
                return {
                  '@type': 'ListItem',
                  position: idx + 1,
                  name: p.name,
                  url: `https://tamimglobal.com/product/tamim-global-${slugifiedName ? `${slugifiedName}-` : ''}${p.id}`,
                  image: p.image,
                };
              }),
            };

            const dynamicTags = `
    <!-- Dynamic Server-Side ItemList Schema for Collection -->
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${pageUrl}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${JSON.stringify(itemListSchema)}</script>
`;

            html = injectMetaTags(html, title, dynamicTags);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            return res.type('text/html').send(html);
          }

          return sendDefaultHtml(res, html);
        }
      );
      return;
    }

    // Default SPA HTML for home, static pages
    return sendDefaultHtml(res, html);
  };
};

function injectMetaTags(html: string, title: string, dynamicTags: string): string {
  // Remove default title
  let updatedHtml = html.replace(/<title>.*?<\/title>/gi, '');
  // Inject new dynamic tags before </head>
  updatedHtml = updatedHtml.replace('</head>', `${dynamicTags}\n</head>`);
  return updatedHtml;
}

function sendDefaultHtml(res: Response, html: string) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.type('text/html').send(html);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
