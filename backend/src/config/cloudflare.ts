import { logInfo, logError } from './logger';
import axios from 'axios';

const CF_ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '';
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CDN_URL = process.env.CDN_URL || '';

/**
 * Limpa cache do CloudFlare para URLs específicas
 */
export const purgeCloudFlareCache = async (urls: string[]): Promise<void> => {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    logError('CloudFlare not configured', {
      hasZoneId: !!CF_ZONE_ID,
      hasToken: !!CF_API_TOKEN,
    });
    return;
  }

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      { files: urls },
      {
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      logInfo('CloudFlare cache purged successfully', {
        urls,
        count: urls.length,
      });
    } else {
      logError('CloudFlare cache purge failed', response.data.errors);
    }
  } catch (error) {
    logError('Error purging CloudFlare cache', error);
  }
};

/**
 * Limpa todo o cache do CloudFlare (CUIDADO!)
 */
export const purgeAllCloudFlareCache = async (): Promise<void> => {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    logError('CloudFlare not configured');
    return;
  }

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache`,
      { purge_everything: true },
      {
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      logInfo('All CloudFlare cache purged successfully');
    } else {
      logError('CloudFlare cache purge failed', response.data.errors);
    }
  } catch (error) {
    logError('Error purging all CloudFlare cache', error);
  }
};

/**
 * Verifica se CloudFlare está configurado
 */
export const isCloudFlareConfigured = (): boolean => {
  return !!(CF_ZONE_ID && CF_API_TOKEN && CDN_URL);
};

/**
 * Converte URL S3 para URL CDN
 */
export const convertToCloudFlareURL = (s3Url: string): string => {
  if (!CDN_URL || !s3Url) {
    return s3Url;
  }

  // Se já é URL do CDN, retorna
  if (s3Url.startsWith(CDN_URL)) {
    return s3Url;
  }

  // Extrai o path da URL S3
  const s3Pattern = /https:\/\/[^/]+\.s3\.[^/]+\.amazonaws\.com\/(.+)/;
  const match = s3Url.match(s3Pattern);

  if (match) {
    return `${CDN_URL}/${match[1]}`;
  }

  return s3Url;
};

/**
 * Obtém estatísticas do CloudFlare Analytics
 */
export const getCloudFlareAnalytics = async (since: number = -10080): Promise<any> => {
  if (!CF_ZONE_ID || !CF_API_TOKEN) {
    logError('CloudFlare not configured');
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/analytics/dashboard`,
      {
        params: { since },
        headers: {
          Authorization: `Bearer ${CF_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      return response.data.result;
    } else {
      logError('CloudFlare analytics fetch failed', response.data.errors);
      return null;
    }
  } catch (error) {
    logError('Error fetching CloudFlare analytics', error);
    return null;
  }
};

logInfo('CloudFlare client initialized', {
  configured: isCloudFlareConfigured(),
  cdnUrl: CDN_URL,
});

export default {
  purgeCloudFlareCache,
  purgeAllCloudFlareCache,
  isCloudFlareConfigured,
  convertToCloudFlareURL,
  getCloudFlareAnalytics,
};
