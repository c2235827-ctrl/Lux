import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image_url: string;
}

export interface Stylist {
  id: number;
  name: string;
  bio: string;
  specialty: string;
  image_url: string;
}

export interface Booking {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  service_id: number;
  stylist_id: number;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  service_name?: string;
  service_price?: number;
  stylist_name?: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  image_url: string;
  category: string;
}

export interface Review {
  id: number;
  type: 'stylist' | 'service' | 'experience' | 'general';
  target_id?: number;
  client_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface SiteContent {
  [key: string]: string;
}

// Mock Data for initial fallback
const INITIAL_SERVICES: Service[] = [
  { id: 1, name: 'Classic Hair Braiding', description: 'Traditional braiding styles for all hair types.', price: 85, duration: 120, category: 'Hair', image_url: 'https://picsum.photos/seed/braids/400/300' },
  { id: 2, name: 'Gel Manicure', description: 'Long-lasting gel polish with nail shaping.', price: 45, duration: 60, category: 'Nails', image_url: 'https://picsum.photos/seed/nails/400/300' },
  { id: 3, name: 'HydraFacial', description: 'Deep cleansing and hydration treatment.', price: 120, duration: 45, category: 'Skin', image_url: 'https://picsum.photos/seed/facial/400/300' }
];

const INITIAL_STYLISTS: Stylist[] = [
  { id: 1, name: 'Elena Vance', bio: 'Expert in intricate braiding and natural hair care.', specialty: 'Master Braider', image_url: 'https://picsum.photos/seed/stylist1/400/400' },
  { id: 2, name: 'Marcus Chen', bio: 'Award-winning nail artist with 10 years experience.', specialty: 'Nail Art', image_url: 'https://picsum.photos/seed/stylist2/400/400' }
];

const INITIAL_GALLERY: GalleryItem[] = [
  { id: 1, title: 'Elegant Braids', category: 'Hair', image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800' },
  { id: 2, title: 'Modern Nails', category: 'Nails', image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800' },
  { id: 3, title: 'Skin Glow', category: 'Skin', image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800' }
];

const INITIAL_CONTENT: SiteContent = {
  hero_title: 'Reveal Your \n Inner Radiance',
  hero_subtitle: 'Welcome to Excellence',
  mission_statement: 'Defining luxury beauty experiences since 2015. Our mission is to provide bespoke services that celebrate your unique radiance.'
};

// Helper to convert File to Base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Service to handle API calls with LocalStorage fallback
export const apiService = {
  async getContent(): Promise<SiteContent> {
    try {
      const res = await fetch('/api/content', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch content');
      const data = await res.json();
      localStorage.setItem('lg_content', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_content');
      return stored ? JSON.parse(stored) : INITIAL_CONTENT;
    }
  },

  async updateContent(content: SiteContent) {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!res.ok) throw new Error('Failed to update content');
  },

  async getReviews(type?: string, target_id?: number): Promise<Review[]> {
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (target_id) params.append('target_id', target_id.toString());
      const res = await fetch(`/api/reviews?${params}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      localStorage.setItem('lg_reviews', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_reviews');
      const reviews: Review[] = stored ? JSON.parse(stored) : [];
      if (type) {
        return reviews.filter(r => r.type === type && (target_id ? r.target_id === target_id : true));
      }
      return reviews;
    }
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>) {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review)
    });
    if (!res.ok) throw new Error('Failed to add review');
    return await res.json();
  },

  async getServices(): Promise<Service[]> {
    try {
      const res = await fetch('/api/services', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      localStorage.setItem('lg_services', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_services');
      if (!stored) {
        localStorage.setItem('lg_services', JSON.stringify(INITIAL_SERVICES));
        return INITIAL_SERVICES;
      }
      return JSON.parse(stored);
    }
  },

  async addService(service: Omit<Service, 'id'>) {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...service, price: Number(service.price), duration: Number(service.duration) })
    });
    if (!res.ok) throw new Error('Failed to add service');
    return await res.json();
  },

  async deleteService(id: number) {
    const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete service');
  },

  async getStylists(): Promise<Stylist[]> {
    try {
      const res = await fetch('/api/stylists', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch stylists');
      const data = await res.json();
      localStorage.setItem('lg_stylists', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_stylists');
      if (!stored) {
        localStorage.setItem('lg_stylists', JSON.stringify(INITIAL_STYLISTS));
        return INITIAL_STYLISTS;
      }
      return JSON.parse(stored);
    }
  },

  async getStylistById(id: number): Promise<Stylist | undefined> {
    try {
      const res = await fetch(`/api/stylists/${id}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch stylist');
      return await res.json();
    } catch (err) {
      const stylists = await this.getStylists();
      return stylists.find(s => s.id === id);
    }
  },

  async addStylist(stylist: Omit<Stylist, 'id'>) {
    const res = await fetch('/api/stylists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stylist)
    });
    if (!res.ok) throw new Error('Failed to add stylist');
    return await res.json();
  },

  async deleteStylist(id: number) {
    const res = await fetch(`/api/stylists/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete stylist');
  },

  async getBookings(): Promise<Booking[]> {
    try {
      const res = await fetch('/api/bookings', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      localStorage.setItem('lg_bookings', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_bookings');
      return stored ? JSON.parse(stored) : [];
    }
  },

  async addBooking(booking: Omit<Booking, 'id' | 'status'>) {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking)
    });
    if (!res.ok) throw new Error('Failed to add booking');
    return await res.json();
  },

  async updateBookingStatus(id: number, status: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update booking status');
  },

  async getGallery(): Promise<GalleryItem[]> {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      localStorage.setItem('lg_gallery', JSON.stringify(data));
      return data;
    } catch (err) {
      const stored = localStorage.getItem('lg_gallery');
      if (!stored) {
        localStorage.setItem('lg_gallery', JSON.stringify(INITIAL_GALLERY));
        return INITIAL_GALLERY;
      }
      return JSON.parse(stored);
    }
  },

  async addGallery(item: Omit<GalleryItem, 'id'>) {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to add gallery item');
    return await res.json();
  },

  async deleteGallery(id: number) {
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete gallery item');
  }
};
