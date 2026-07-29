import { Router, Request, Response } from 'express';
import db from '../config/db';

const router = Router();

router.get('/sitemap.xml', (req: Request, res: Response) => {
  const host = req.headers.host || 'tamimglobal.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const domain = host.includes('localhost')
    ? `${protocol}://${host}`
    : host.includes('web.app')
    ? 'https://beauty-elegance-ec88f.web.app'
    : 'https://tamimglobal.com';

  // 1. Fetch published products
  db.all('SELECT id, name, created_at FROM products WHERE published = 1 ORDER BY id DESC', [], (err, products: any[]) => {
    if (err) {
      console.error('Sitemap products fetch error:', err);
      return res.status(500).send('Error generating sitemap');
    }

    // 2. Fetch published blog posts
    db.all('SELECT slug, title, created_at FROM blog_posts WHERE published = 1 ORDER BY created_at DESC', [], (err2, blogs: any[]) => {
      if (err2) {
        console.error('Sitemap blogs fetch error:', err2);
        return res.status(500).send('Error generating sitemap');
      }

      // Compile sitemap XML content
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
      xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

      const today = new Date().toISOString().split('T')[0];

      // Static routes
      const staticRoutes = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: 'blogs', priority: '0.9', changefreq: 'daily' },
        { path: 'checkout', priority: '0.7', changefreq: 'monthly' },
        { path: 'account', priority: '0.6', changefreq: 'monthly' },
      ];

      staticRoutes.forEach(r => {
        const routeUrl = r.path ? `${domain}/${r.path}` : `${domain}/`;
        xml += `  <url>\n`;
        xml += `    <loc>${routeUrl}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${r.changefreq}</changefreq>\n`;
        xml += `    <priority>${r.priority}</priority>\n`;
        xml += `  </url>\n`;
      });

      // Product detail pages
      (products || []).forEach(p => {
        const lastModDate = p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : today;
        const slugifiedName = (p.name || '')
          .toLowerCase()
          .replace(/[^\w\u0980-\u09FF\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        const prodUrl = `${domain}/product/tamim-global-${slugifiedName ? `${slugifiedName}-` : ''}${p.id}`;
        xml += `  <url>\n`;
        xml += `    <loc>${prodUrl}</loc>\n`;
        xml += `    <lastmod>${lastModDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `  </url>\n`;
      });

      // Blog detail pages
      (blogs || []).forEach(b => {
        const lastModDate = b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : today;
        xml += `  <url>\n`;
        xml += `    <loc>${domain}/blog/${b.slug}</loc>\n`;
        xml += `    <lastmod>${lastModDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      });

      xml += `</urlset>`;

      // Set content type header to XML
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600');
      res.status(200).send(xml);
    });
  });
});

router.get('/robots.txt', (req: Request, res: Response) => {
  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Exclude Sensitive and User-Specific Routes
Disallow: /admin
Disallow: /admin/*
Disallow: /account
Disallow: /checkout
Disallow: /api/

# XML Sitemaps & Merchant Feeds
Sitemap: https://tamimglobal.com/sitemap.xml
Sitemap: https://beauty-elegance-ec88f.web.app/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.status(200).send(robotsTxt);
});

// Google Merchant Center & Meta Catalog XML Product Feed
const sendGoogleShoppingFeed = (req: Request, res: Response) => {
  const host = req.headers.host || 'tamimglobal.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const domain = host.includes('localhost')
    ? `${protocol}://${host}`
    : host.includes('web.app')
    ? 'https://beauty-elegance-ec88f.web.app'
    : 'https://tamimglobal.com';

  db.all('SELECT * FROM products WHERE published = 1 ORDER BY id DESC', [], (err, products: any[]) => {
    if (err) {
      console.error('Google Shopping feed products fetch error:', err);
      return res.status(500).send('Error generating Google Shopping feed');
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n`;
    xml += `  <channel>\n`;
    xml += `    <title>Tamim Global Product Feed</title>\n`;
    xml += `    <link>${domain}</link>\n`;
    xml += `    <description>Tamim Global Premier Online Store for Sports, Gym Equipment &amp; Fitness Gear in Bangladesh.</description>\n`;

    (products || []).forEach(p => {
      const slugifiedName = (p.name || '')
        .toLowerCase()
        .replace(/[^\w\u0980-\u09FF\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const prodUrl = `${domain}/product/tamim-global-${slugifiedName ? `${slugifiedName}-` : ''}${p.id}`;
      const prodImage = p.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80';
      const cleanDesc = (p.description || p.name || '')
        .replace(/<[^>]*>?/gm, '')
        .substring(0, 500);

      xml += `    <item>\n`;
      xml += `      <g:id>${p.sku || `TG-PRD-${p.id}`}</g:id>\n`;
      xml += `      <g:title>${escapeXml(p.name)}</g:title>\n`;
      xml += `      <g:description>${escapeXml(cleanDesc)}</g:description>\n`;
      xml += `      <g:link>${prodUrl}</g:link>\n`;
      xml += `      <g:image_link>${prodImage}</g:image_link>\n`;
      xml += `      <g:brand>${escapeXml(p.brand || 'Tamim Global')}</g:brand>\n`;
      xml += `      <g:condition>new</g:condition>\n`;
      xml += `      <g:availability>${p.in_stock !== 0 ? 'in_stock' : 'out_of_stock'}</g:availability>\n`;
      xml += `      <g:price>${p.price} BDT</g:price>\n`;
      xml += `      <g:shipping>\n`;
      xml += `        <g:country>BD</g:country>\n`;
      xml += `        <g:region>Dhaka</g:region>\n`;
      xml += `        <g:service>Dhaka City Delivery</g:service>\n`;
      xml += `        <g:price>60 BDT</g:price>\n`;
      xml += `      </g:shipping>\n`;
      xml += `      <g:shipping>\n`;
      xml += `        <g:country>BD</g:country>\n`;
      xml += `        <g:service>Outside Dhaka Delivery</g:service>\n`;
      xml += `        <g:price>120 BDT</g:price>\n`;
      xml += `      </g:shipping>\n`;
      xml += `    </item>\n`;
    });

    xml += `  </channel>\n`;
    xml += `</rss>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.status(200).send(xml);
  });
};

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/google-shopping.xml', sendGoogleShoppingFeed);
router.get('/google-feed.xml', sendGoogleShoppingFeed);

export default router;
