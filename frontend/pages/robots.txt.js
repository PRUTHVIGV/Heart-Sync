export default function Robots() {}

export async function getServerSideProps({ res }) {
  res.setHeader("Content-Type", "text/plain");
  res.write(`User-agent: *
Allow: /
Allow: /login
Allow: /register
Allow: /privacy
Allow: /terms
Allow: /premium
Disallow: /dashboard
Disallow: /matches
Disallow: /messages
Disallow: /profile
Disallow: /settings
Disallow: /admin
Disallow: /chat

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || "https://heartsync.app"}/sitemap.xml`);
  res.end();
  return { props: {} };
}
