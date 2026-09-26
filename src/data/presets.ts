import headphoneImg from '../assets/images/sample_headphone_ad_1790407243641.jpg';
import keyboardImg from '../assets/images/sample_keyboard_ad_1790407255013.jpg';
import smartwatchImg from '../assets/images/sample_smartwatch_ad_1790407266603.jpg';
import { ProductAdFormData } from '../types/ad';

export interface AdPreset {
  id: string;
  name: string;
  description: string;
  data: ProductAdFormData;
}

export const PRESET_CATEGORIES = [
  'global',
  'electronics',
  'productivity',
  'hardware',
  'software',
  'audio',
  'wearables',
  'gaming',
  'apparel',
  'home',
];

export const AD_PRESETS: AdPreset[] = [
  {
    id: 'headphones',
    name: 'Acoustic Pro ANC',
    description: 'Over-ear studio audio with 35% discount',
    data: {
      title: 'Acoustic Pro ANC Studio Headphones with Spatial Audio',
      target_url: 'https://example.com/audio/acoustic-pro-anc',
      image_url: headphoneImg,
      format: 'square',
      category: 'audio',
      reg_price: '$299.99',
      sale_price: '$189.99',
      discount_badge: '35% OFF',
      coupon_code: 'AUDIO35',
      status: 'active',
    },
  },
  {
    id: 'keyboard',
    name: 'Apex Ergo Key',
    description: 'Mechanical ergonomic keyboard wide leaderboard',
    data: {
      title: 'Apex Ergo Wireless Split Mechanical Keyboard',
      target_url: 'https://example.com/gear/apex-ergo-split',
      image_url: keyboardImg,
      format: 'rectangle',
      category: 'productivity',
      reg_price: '$179.00',
      sale_price: '$129.00',
      discount_badge: 'SAVE $50',
      coupon_code: 'CLICK50',
      status: 'active',
    },
  },
  {
    id: 'smartwatch',
    name: 'ChronoTitan Smartwatch',
    description: 'Titanium chassis smartwatch sidebar sticker',
    data: {
      title: 'ChronoTitan GPS Smartwatch - Sapphire Grade Edition',
      target_url: 'https://example.com/wearables/chronotitan',
      image_url: smartwatchImg,
      format: 'sticker',
      category: 'wearables',
      reg_price: '$349.99',
      sale_price: '$279.99',
      discount_badge: 'LIMITED DEAL',
      coupon_code: 'TITAN20',
      status: 'active',
    },
  },
];

export const DEFAULT_INITIAL_FORM: ProductAdFormData = {
  title: 'Acoustic Pro ANC Studio Headphones with Spatial Audio',
  target_url: 'https://store.sponsornetwork.com/products/acoustic-pro',
  image_url: headphoneImg,
  format: 'square',
  category: 'global',
  reg_price: '$199.99',
  sale_price: '$129.99',
  discount_badge: '35% OFF',
  coupon_code: 'SAVE35',
  status: 'active',
};
