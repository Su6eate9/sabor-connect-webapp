import { useEffect } from 'react';

interface OpenGraphMeta {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export const useOpenGraph = ({
  title,
  description,
  image,
  url,
  type = 'website',
}: OpenGraphMeta) => {
  useEffect(() => {
    // Atualiza o título da página
    document.title = title;

    // Remove meta tags anteriores do Open Graph
    const existingOgTags = document.querySelectorAll('meta[property^="og:"]');
    existingOgTags.forEach((tag) => tag.remove());

    const existingTwitterTags = document.querySelectorAll('meta[name^="twitter:"]');
    existingTwitterTags.forEach((tag) => tag.remove());

    // Atualiza meta description padrão
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

    // Open Graph meta tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'SaborConnect' },
    ];

    if (url) {
      ogTags.push({ property: 'og:url', content: url });
    }

    if (image) {
      ogTags.push(
        { property: 'og:image', content: image },
        { property: 'og:image:alt', content: title },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' }
      );
    }

    ogTags.forEach(({ property, content }) => {
      const meta = document.createElement('meta');
      meta.setAttribute('property', property);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });

    // Twitter Card meta tags
    const twitterTags = [
      { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ];

    if (image) {
      twitterTags.push({ name: 'twitter:image', content: image });
    }

    twitterTags.forEach(({ name, content }) => {
      const meta = document.createElement('meta');
      meta.setAttribute('name', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    });

    // Cleanup function
    return () => {
      const ogTagsToRemove = document.querySelectorAll('meta[property^="og:"]');
      ogTagsToRemove.forEach((tag) => tag.remove());

      const twitterTagsToRemove = document.querySelectorAll('meta[name^="twitter:"]');
      twitterTagsToRemove.forEach((tag) => tag.remove());
    };
  }, [title, description, image, url, type]);
};
