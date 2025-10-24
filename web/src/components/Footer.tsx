import React from 'react';

function FooterLogo({ src }: { src: any }) {
  // Resolve a URL string if possible (direct string or module default)
  const url = typeof src === 'string' ? src : src && (src.default || src);
  if (typeof url === 'string' && url.length > 0) {
    return (
      <img
        src={url}
        alt="West Cat logo"
        width={32}
        height={32}
        className="inline-block rounded-full"
        style={{ width: 32, height: 32 }}
      />
    );
  }
  // If we can't resolve a URL safely, render a hidden placeholder to avoid test crashes
  return <span aria-hidden />;
}

export default function Footer({ logo }: { logo: any }) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <FooterLogo src={logo} />
          <a
            href="https://westcat.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            title="West Cat Strategy Ltd."
            aria-label="Built by West Cat Strategy Ltd."
          >
            Built by West Cat Strategy Ltd.
          </a>
        </div>
        <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()}</div>
      </div>
      <div className="h-2 md:h-0" aria-hidden />
    </footer>
  );
}
