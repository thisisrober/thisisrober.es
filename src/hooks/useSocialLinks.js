import { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaTwitter, FaInstagram, FaYoutube, FaTiktok, FaDiscord, FaTwitch, FaGlobe, FaEnvelope } from 'react-icons/fa';
import api from '../services/api';

const PLATFORM_ICONS = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaTwitter,
  instagram: FaInstagram,
  youtube: FaYoutube,
  tiktok: FaTiktok,
  discord: FaDiscord,
  twitch: FaTwitch,
  website: FaGlobe,
  email: FaEnvelope,
};

let cachedLinks = null;
let fetching = null;

export function getSocialIcon(platform) {
  return PLATFORM_ICONS[platform] || FaGlobe;
}

export function useSocialLinks() {
  const [links, setLinks] = useState(cachedLinks || []);

  useEffect(() => {
    if (cachedLinks) { setLinks(cachedLinks); return; }
    if (!fetching) {
      fetching = api.get('/blog/settings/public').then(r => {
        if (r.data?.social_links) {
          try {
            cachedLinks = JSON.parse(r.data.social_links);
          } catch { cachedLinks = []; }
        } else {
          cachedLinks = [];
        }
        return cachedLinks;
      }).catch(() => { cachedLinks = []; return []; });
    }
    fetching.then(data => setLinks(data));
  }, []);

  return links;
}
