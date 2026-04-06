const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://heartsync.app";

const staticPages = ["/", "/login", "/register", "/privacy", "/terms", "/premium"];

function generateSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map((page) => `
  <url>
    <loc>${SITE_URL}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === "/" ? "daily" : "monthly"}</changefreq>
    <priority>${page === "/" ? "1.0" : "0.7"}</priority>
  </url>`).join("")}
</urlset>`;
}

export default function Sitemap() {}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(generateSitemap());
  res.end();
  return { props: {} };
}
