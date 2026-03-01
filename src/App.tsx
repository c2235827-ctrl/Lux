import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  ChevronRight, 
  Star, 
  Menu, 
  X, 
  Instagram, 
  Facebook, 
  Phone, 
  MapPin,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Camera,
  Plus,
  Upload,
  ArrowLeft,
  MessageSquare,
  Settings,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService, cn, fileToBase64, type Service, type Stylist, type Booking, type GalleryItem, type Review, type SiteContent } from './services/api';

// Components
const ReviewForm = ({ type, targetId, onReviewAdded }: { type: 'stylist' | 'service' | 'experience' | 'general', targetId?: number, onReviewAdded: () => void }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiService.addReview({
        type,
        target_id: targetId,
        ...formData
      });
      setFormData({ client_name: '', rating: 5, comment: '' });
      onReviewAdded();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-luxury-ink/5 space-y-4">
      <h4 className="text-lg font-serif">Leave a Review</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          required
          type="text" 
          placeholder="Your Name"
          className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-luxury-gold"
          value={formData.client_name}
          onChange={e => setFormData({...formData, client_name: e.target.value})}
        />
        <div className="flex items-center space-x-2">
          <span className="text-xs uppercase tracking-widest font-bold">Rating:</span>
          {[1, 2, 3, 4, 5].map(star => (
            <button 
              key={star}
              type="button"
              onClick={() => setFormData({...formData, rating: star})}
              className={cn("transition-colors", formData.rating >= star ? "text-luxury-gold" : "text-luxury-ink/20")}
            >
              <Star size={16} fill={formData.rating >= star ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <textarea 
        required
        placeholder="Share your experience..."
        className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none focus:ring-1 focus:ring-luxury-gold h-24 resize-none"
        value={formData.comment}
        onChange={e => setFormData({...formData, comment: e.target.value})}
      />
      <button 
        disabled={submitting}
        className="w-full bg-luxury-ink text-white py-3 rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-luxury-gold transition-colors disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Post Review'}
      </button>
    </form>
  );
};

const ReviewList = ({ reviews }: { reviews: Review[] }) => {
  if (reviews.length === 0) return <p className="text-luxury-ink/40 italic text-sm">No reviews yet.</p>;
  
  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <div key={review.id} className="bg-white/50 p-6 rounded-2xl border border-luxury-ink/5">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-sm">{review.client_name}</p>
              <div className="flex text-luxury-gold">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-luxury-ink/30 uppercase tracking-widest">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-luxury-ink/70 text-sm italic">"{review.comment}"</p>
        </div>
      ))}
    </div>
  );
};
const Navbar = ({ isAdmin, setIsAdmin }: { isAdmin: boolean, setIsAdmin: (val: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAdmin(false);
    navigate('/');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-luxury-cream/80 backdrop-blur-md border-b border-luxury-ink/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="text-2xl font-serif font-bold tracking-widest text-luxury-ink">
            LUXEGLOW
          </Link>
          
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/services" className="text-sm uppercase tracking-widest hover:text-luxury-gold transition-colors">Services</Link>
            <Link to="/gallery" className="text-sm uppercase tracking-widest hover:text-luxury-gold transition-colors">Gallery</Link>
            <Link to="/booking" className="bg-luxury-ink text-white px-6 py-2 rounded-full text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">Book Now</Link>
            {isAdmin ? (
              <>
                <Link to="/admin" className="flex items-center space-x-1 text-sm uppercase tracking-widest text-luxury-gold">
                  <LayoutDashboard size={16} />
                  <span>Admin</span>
                </Link>
                <button onClick={handleLogout} className="text-sm uppercase tracking-widest text-luxury-ink/60 hover:text-rose-500 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login" className="text-sm uppercase tracking-widest text-luxury-ink/40 hover:text-luxury-ink transition-colors">
                Staff Login
              </Link>
            )}
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-luxury-cream border-b border-luxury-ink/10 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4">
              <Link to="/services" onClick={() => setIsOpen(false)} className="block text-lg font-serif">Services</Link>
              <Link to="/gallery" onClick={() => setIsOpen(false)} className="block text-lg font-serif">Gallery</Link>
              <Link to="/booking" onClick={() => setIsOpen(false)} className="block text-lg font-serif text-luxury-gold">Book Appointment</Link>
              {isAdmin ? (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="block text-lg font-serif text-luxury-gold">Admin Dashboard</Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block text-lg font-serif text-rose-500">Logout</button>
                </>
              ) : (
                <Link to="/admin/login" onClick={() => setIsOpen(false)} className="block text-lg font-serif text-luxury-ink/40">Staff Login</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = ({ content }: { content: SiteContent }) => (
  <section className="relative h-screen flex items-center justify-center overflow-hidden">
    <div className="absolute inset-0 z-0">
      <img 
        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920" 
        className="w-full h-full object-cover opacity-40"
        alt="Salon interior"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-luxury-cream/20 to-luxury-cream" />
    </div>
    
    <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
      <motion.span 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm uppercase tracking-[0.3em] text-luxury-gold mb-4 block"
      >
        {content.hero_subtitle || 'Welcome to Excellence'}
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-6xl md:text-8xl font-serif mb-8 leading-tight whitespace-pre-line"
      >
        {content.hero_title || 'Reveal Your \n Inner Radiance'}
      </motion.h1>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link to="/booking" className="w-full sm:w-auto bg-luxury-ink text-white px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all shadow-xl">
          Reserve Your Slot
        </Link>
        <Link to="/services" className="w-full sm:w-auto border border-luxury-ink px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-luxury-ink hover:text-white transition-all">
          Explore Services
        </Link>
      </motion.div>
    </div>
  </section>
);

const Mission = ({ content }: { content: SiteContent }) => (
  <section className="py-24 px-4 bg-white">
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold mb-6 block">Our Mission</span>
        <p className="text-3xl md:text-4xl font-serif leading-relaxed text-luxury-ink italic">
          "{content.mission_statement || 'Defining luxury beauty experiences since 2015. Our mission is to provide bespoke services that celebrate your unique radiance.'}"
        </p>
      </motion.div>
    </div>
  </section>
);

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    Promise.all([
      apiService.getServices(),
      apiService.getStylists()
    ]).then(([sData, stData]) => {
      setServices(sData);
      setStylists(stData);
      setLoading(false);
    });
  }, []);

  const specialties = ['All', ...new Set(stylists.map(s => s.specialty))];

  const filteredServices = filter === 'All' 
    ? services 
    : services.filter(s => {
        // Simple heuristic: if the service category matches the specialty or vice versa
        return s.category.toLowerCase().includes(filter.toLowerCase().split(' ')[0]) || 
               filter.toLowerCase().includes(s.category.toLowerCase());
      });

  if (loading) return <div className="pt-32 text-center font-serif italic">Loading our catalog...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif mb-4">Our Services</h2>
        <p className="text-luxury-ink/60 max-w-2xl mx-auto">Bespoke beauty treatments tailored to your unique style and needs.</p>
      </div>

      {/* Filter */}
      <div className="mb-16 flex flex-wrap justify-center gap-3">
        <div className="w-full text-center mb-4 flex items-center justify-center text-luxury-ink/40">
          <Filter size={14} className="mr-2" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Filter by Specialty</span>
        </div>
        {specialties.map(spec => (
          <button
            key={spec}
            onClick={() => setFilter(spec)}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all border font-bold",
              filter === spec 
                ? "bg-luxury-ink text-white border-luxury-ink shadow-lg" 
                : "bg-white text-luxury-ink border-luxury-ink/10 hover:border-luxury-gold"
            )}
          >
            {spec}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
        {filteredServices.map(service => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="group"
          >
            <div className="relative overflow-hidden rounded-3xl mb-6 aspect-[4/5]">
              <img 
                src={service.image_url} 
                alt={service.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase">
                ${service.price}
              </div>
            </div>
            <h3 className="text-2xl font-serif mb-2">{service.name}</h3>
            <p className="text-luxury-ink/60 text-sm mb-4 line-clamp-2">{service.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs uppercase tracking-widest font-bold text-luxury-gold">
                <Clock size={14} className="mr-2" />
                <span>{service.duration} Minutes</span>
              </div>
              <Link to="/booking" className="text-luxury-ink font-bold text-[10px] uppercase tracking-widest hover:text-luxury-gold transition-colors">Book Now</Link>
            </div>
          </motion.div>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-full text-center py-20 text-luxury-ink/40 italic">No services found for this specialty.</div>
        )}
      </div>

      <div className="text-center mb-20">
        <h2 className="text-5xl font-serif mb-4">Meet Our Experts</h2>
        <p className="text-luxury-ink/60 max-w-2xl mx-auto">The hands behind the magic. Each stylist brings a unique perspective to beauty.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {stylists.map(stylist => (
          <Link to={`/stylists/${stylist.id}`} key={stylist.id}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-full mb-6 aspect-square max-w-[280px] mx-auto border-4 border-white shadow-xl">
                <img 
                  src={stylist.image_url} 
                  alt={stylist.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-serif mb-1">{stylist.name}</h3>
                <p className="text-luxury-gold text-xs uppercase tracking-widest font-bold">{stylist.specialty}</p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const StylistProfile = () => {
  const { id } = useParams();
  const [stylist, setStylist] = useState<Stylist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = () => {
    if (id) {
      Promise.all([
        apiService.getStylistById(Number(id)),
        apiService.getServices(),
        apiService.getReviews('stylist', Number(id))
      ]).then(([sData, servicesData, reviewsData]) => {
        if (sData) setStylist(sData);
        setServices(servicesData);
        setReviews(reviewsData);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <div className="pt-32 text-center font-serif italic">Loading profile...</div>;
  if (!stylist) return <div className="pt-32 text-center">Stylist not found.</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center text-xs uppercase tracking-widest font-bold text-luxury-ink/40 hover:text-luxury-ink mb-12 transition-colors">
        <ArrowLeft size={16} className="mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img src={stylist.image_url} alt={stylist.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute -bottom-8 -right-8 bg-luxury-gold text-white p-8 rounded-3xl shadow-xl hidden md:block">
            <p className="text-sm uppercase tracking-widest font-bold mb-2">Expertise</p>
            <p className="text-2xl font-serif">{stylist.specialty}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <span className="text-xs uppercase tracking-[0.3em] text-luxury-gold mb-4 block">Master Stylist</span>
          <h1 className="text-6xl font-serif mb-8">{stylist.name}</h1>
          <p className="text-luxury-ink/60 text-lg leading-relaxed mb-12">
            {stylist.bio}
          </p>
          <Link to="/booking" className="inline-block bg-luxury-ink text-white px-12 py-5 rounded-full text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all shadow-xl">
            Book with {stylist.name.split(' ')[0]}
          </Link>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-luxury-ink/10 pt-20">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-serif mb-12">Specialized Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.filter(s => s.category.toLowerCase().includes(stylist.specialty.toLowerCase().split(' ')[0]) || true).slice(0, 4).map(service => (
              <div key={service.id} className="bg-white p-8 rounded-3xl shadow-sm border border-luxury-ink/5">
                <h3 className="text-xl font-serif mb-2">{service.name}</h3>
                <p className="text-luxury-ink/40 text-xs uppercase tracking-widest font-bold mb-4">${service.price} • {service.duration} MIN</p>
                <p className="text-luxury-ink/60 text-sm mb-6 line-clamp-2">{service.description}</p>
                <Link to="/booking" className="text-luxury-gold text-xs uppercase tracking-widest font-bold hover:underline">Book Now</Link>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-12">
          <h2 className="text-4xl font-serif">Reviews</h2>
          <ReviewForm type="stylist" targetId={Number(id)} onReviewAdded={fetchData} />
          <ReviewList reviews={reviews} />
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_id: '',
    stylist_id: '',
    booking_date: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      apiService.getServices(),
      apiService.getStylists()
    ]).then(([sData, stData]) => {
      setServices(sData);
      setStylists(stData);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.addBooking(formData as any);
    setSubmitted(true);
    setTimeout(() => navigate('/'), 3000);
  };

  if (submitted) {
    return (
      <div className="pt-40 text-center px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white p-12 rounded-3xl shadow-xl border border-luxury-gold/20"
        >
          <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
          <h2 className="text-3xl font-serif mb-4">Booking Confirmed!</h2>
          <p className="text-luxury-ink/60 mb-8">We've sent a confirmation to your email. See you soon at LuxeGlow!</p>
          <button onClick={() => navigate('/')} className="text-luxury-gold uppercase tracking-widest text-sm font-bold">Return Home</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-serif mb-4">Book Your Experience</h2>
        <p className="text-luxury-ink/60">Select your preferred service and stylist.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-luxury-ink/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold">Full Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none"
              placeholder="Jane Doe"
              value={formData.client_name}
              onChange={e => setFormData({...formData, client_name: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold">Email Address</label>
            <input 
              required
              type="email" 
              className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none"
              placeholder="jane@example.com"
              value={formData.client_email}
              onChange={e => setFormData({...formData, client_email: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold">Service</label>
            <select 
              required
              className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none appearance-none"
              value={formData.service_id}
              onChange={e => setFormData({...formData, service_id: e.target.value})}
            >
              <option value="">Select Service</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} - ${s.price}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold">Stylist</label>
            <select 
              required
              className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none appearance-none"
              value={formData.stylist_id}
              onChange={e => setFormData({...formData, stylist_id: e.target.value})}
            >
              <option value="">Select Stylist</option>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name} ({s.specialty})</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold">Date & Time</label>
          <input 
            required
            type="datetime-local" 
            className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none"
            value={formData.booking_date}
            onChange={e => setFormData({...formData, booking_date: e.target.value})}
          />
        </div>

        <button type="submit" className="w-full bg-luxury-ink text-white py-5 rounded-xl text-sm uppercase tracking-[0.2em] font-bold hover:bg-luxury-gold transition-all shadow-lg">
          Confirm Appointment
        </button>
      </form>
    </div>
  );
};

const AdminLogin = ({ setIsAdmin }: { setIsAdmin: (val: boolean) => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        setIsAdmin(true);
        navigate('/admin');
        return;
      }
    } catch (err) {
      console.warn('API Login failed, checking local password for demo mode');
    }

    // Fallback for Vercel/Demo environments
    if (password === 'admin123') {
      localStorage.setItem('adminToken', 'demo-token');
      setIsAdmin(true);
      navigate('/admin');
    } else {
      setError('Invalid password. Hint: admin123');
    }
  };

  return (
    <div className="pt-40 pb-20 px-4 flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-luxury-ink/5 w-full max-w-md">
        <h2 className="text-3xl font-serif mb-6 text-center">Staff Login</h2>
        {error && <p className="text-rose-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold">Password</label>
            <input 
              type="password" 
              className="w-full bg-luxury-cream/50 border-none rounded-xl p-4 focus:ring-2 focus:ring-luxury-gold outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          <button type="submit" className="w-full bg-luxury-ink text-white py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = ({ siteContent, setSiteContent }: { siteContent: SiteContent, setSiteContent: (c: SiteContent) => void }) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'stylists' | 'gallery' | 'content' | 'reviews'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '', category: 'Hair', image_url: '' });
  const [newStylist, setNewStylist] = useState({ name: '', bio: '', specialty: '', image_url: '' });
  const [newGallery, setNewGallery] = useState({ title: '', image_url: '', category: 'Hair' });
  const [editableContent, setEditableContent] = useState<SiteContent>(siteContent);

  const fetchData = async () => {
    const [bData, sData, stData, gData, rData] = await Promise.all([
      apiService.getBookings(),
      apiService.getServices(),
      apiService.getStylists(),
      apiService.getGallery(),
      apiService.getReviews()
    ]);
    setBookings(bData);
    setServices(sData);
    setStylists(stData);
    setGallery(gData);
    setReviews(rData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setEditableContent(siteContent);
  }, [siteContent]);

  const updateStatus = async (id: number, status: string) => {
    await apiService.updateBookingStatus(id, status);
    fetchData(); // Full refresh to ensure persistence
  };

  const handleFileUpload = async (file: File, type: 'service' | 'stylist' | 'gallery') => {
    try {
      const base64 = await fileToBase64(file);
      if (type === 'service') setNewService({ ...newService, image_url: base64 });
      if (type === 'stylist') setNewStylist({ ...newStylist, image_url: base64 });
      if (type === 'gallery') setNewGallery({ ...newGallery, image_url: base64 });
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.addService(newService as any);
    setNewService({ name: '', description: '', price: '', duration: '', category: 'Hair', image_url: '' });
    fetchData();
  };

  const handleDeleteService = async (id: number) => {
    if(!confirm('Are you sure?')) return;
    await apiService.deleteService(id);
    fetchData();
  };

  const handleAddStylist = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.addStylist(newStylist as any);
    setNewStylist({ name: '', bio: '', specialty: '', image_url: '' });
    fetchData();
  };

  const handleDeleteStylist = async (id: number) => {
    if(!confirm('Are you sure?')) return;
    await apiService.deleteStylist(id);
    fetchData();
  };

  const handleAddGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.addGallery(newGallery as any);
    setNewGallery({ title: '', image_url: '', category: 'Hair' });
    fetchData();
  };

  const handleDeleteGallery = async (id: number) => {
    if(!confirm('Are you sure?')) return;
    await apiService.deleteGallery(id);
    fetchData();
  };

  const handleUpdateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiService.updateContent(editableContent);
    setSiteContent(editableContent);
    alert('Site content updated successfully!');
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((acc, b) => {
    const service = services.find(s => s.id === b.service_id);
    return acc + (service?.price || 0);
  }, 0);

  if (loading) return <div className="pt-32 text-center">Loading dashboard...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h2 className="text-4xl font-serif">Admin Dashboard</h2>
        <div className="flex space-x-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-luxury-ink/5">
            <span className="text-xs uppercase tracking-widest text-luxury-ink/40 block">Total Revenue</span>
            <span className="text-xl font-bold font-serif text-emerald-600">${totalRevenue}</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-luxury-ink/5">
            <span className="text-xs uppercase tracking-widest text-luxury-ink/40 block">Appointments</span>
            <span className="text-xl font-bold font-serif">{bookings.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setActiveTab('bookings')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'bookings' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Bookings</button>
        <button onClick={() => setActiveTab('services')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'services' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Services</button>
        <button onClick={() => setActiveTab('stylists')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'stylists' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Stylists</button>
        <button onClick={() => setActiveTab('gallery')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'gallery' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Gallery</button>
        <button onClick={() => setActiveTab('content')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'content' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Site Content</button>
        <button onClick={() => setActiveTab('reviews')} className={cn("px-6 py-2 rounded-full text-sm uppercase tracking-widest transition-colors whitespace-nowrap", activeTab === 'reviews' ? "bg-luxury-ink text-white" : "bg-white text-luxury-ink hover:bg-luxury-cream")}>Reviews</button>
      </div>

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl shadow-sm border border-luxury-ink/5 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-luxury-cream/50 border-b border-luxury-ink/5">
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Client</th>
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Service</th>
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Stylist</th>
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Date</th>
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Status</th>
                <th className="p-6 text-xs uppercase tracking-widest font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const service = services.find(s => s.id === booking.service_id);
                return (
                  <tr key={booking.id} className="border-b border-luxury-ink/5 hover:bg-luxury-cream/20 transition-colors">
                    <td className="p-6">
                      <div className="font-medium">{booking.client_name}</div>
                      <div className="text-xs text-luxury-ink/40">{booking.client_email}</div>
                      <div className="text-xs text-luxury-ink/40">{booking.client_phone}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-sm">{booking.service_name}</div>
                      <div className="text-xs text-emerald-600 font-bold">${service?.price || 0}</div>
                    </td>
                    <td className="p-6 text-sm">{booking.stylist_name}</td>
                    <td className="p-6 text-sm">{new Date(booking.booking_date).toLocaleString()}</td>
                    <td className="p-6">
                      <span className={cn(
                        "text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold",
                        booking.status === 'confirmed' ? "bg-emerald-100 text-emerald-700" : 
                        booking.status === 'pending' ? "bg-amber-100 text-amber-700" : 
                        "bg-rose-100 text-rose-700"
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => updateStatus(booking.id, 'confirmed')}
                          className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => updateStatus(booking.id, 'cancelled')}
                          className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="p-6 text-center text-luxury-ink/40 italic">No bookings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {services.map(service => (
              <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-luxury-ink/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={service.image_url} alt={service.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-serif text-lg">{service.name}</h4>
                    <p className="text-xs text-luxury-ink/60">{service.category} • ${service.price} • {service.duration} mins</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteService(service.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-luxury-ink/5 h-fit">
            <h3 className="text-xl font-serif mb-6">Add New Service</h3>
            <form onSubmit={handleAddService} className="space-y-4">
              <input required type="text" placeholder="Service Name" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} />
              <textarea required placeholder="Description" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Price ($)" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.price} onChange={e => setNewService({...newService, price: e.target.value})} />
                <input required type="number" placeholder="Duration (mins)" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.duration} onChange={e => setNewService({...newService, duration: e.target.value})} />
              </div>
              <select className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.category} onChange={e => setNewService({...newService, category: e.target.value})}>
                <option value="Hair">Hair</option>
                <option value="Nails">Nails</option>
                <option value="Skin">Skin</option>
                <option value="Makeup">Makeup</option>
              </select>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-ink/40">Service Image</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'service')}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-luxury-cream/50 rounded-xl p-4 border-2 border-dashed border-luxury-ink/10 flex items-center justify-center group-hover:border-luxury-gold transition-colors">
                    {newService.image_url ? (
                      <img src={newService.image_url} className="h-20 w-full object-cover rounded-lg" alt="Preview" />
                    ) : (
                      <div className="text-center">
                        <Upload size={20} className="mx-auto mb-2 text-luxury-ink/40" />
                        <span className="text-xs text-luxury-ink/40">Upload Image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-luxury-ink text-white py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">Add Service</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'stylists' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {stylists.map(stylist => (
              <div key={stylist.id} className="bg-white p-6 rounded-2xl shadow-sm border border-luxury-ink/5 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img src={stylist.image_url} alt={stylist.name} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-serif text-lg">{stylist.name}</h4>
                    <p className="text-xs text-luxury-ink/60">{stylist.specialty}</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteStylist(stylist.id)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-luxury-ink/5 h-fit">
            <h3 className="text-xl font-serif mb-6">Add New Stylist</h3>
            <form onSubmit={handleAddStylist} className="space-y-4">
              <input required type="text" placeholder="Stylist Name" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newStylist.name} onChange={e => setNewStylist({...newStylist, name: e.target.value})} />
              <input required type="text" placeholder="Specialty" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newStylist.specialty} onChange={e => setNewStylist({...newStylist, specialty: e.target.value})} />
              <textarea required placeholder="Bio" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newStylist.bio} onChange={e => setNewStylist({...newStylist, bio: e.target.value})} />
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-ink/40">Profile Image</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'stylist')}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-luxury-cream/50 rounded-xl p-4 border-2 border-dashed border-luxury-ink/10 flex items-center justify-center group-hover:border-luxury-gold transition-colors">
                    {newStylist.image_url ? (
                      <img src={newStylist.image_url} className="h-20 w-full object-cover rounded-lg" alt="Preview" />
                    ) : (
                      <div className="text-center">
                        <Upload size={20} className="mx-auto mb-2 text-luxury-ink/40" />
                        <span className="text-xs text-luxury-ink/40">Upload Image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-luxury-ink text-white py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">Add Stylist</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map(item => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden shadow-sm border border-luxury-ink/5">
                  <img src={item.image_url} alt={item.title} className="w-full h-40 object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-luxury-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => handleDeleteGallery(item.id)} className="text-white hover:text-rose-400 p-2 rounded-lg transition-colors">
                      <X size={24} />
                    </button>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <div className="col-span-full p-8 text-center text-luxury-ink/40 italic bg-white rounded-xl border border-luxury-ink/5">No images in gallery.</div>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-luxury-ink/5 h-fit">
            <h3 className="text-xl font-serif mb-6">Add Gallery Image</h3>
            <form onSubmit={handleAddGallery} className="space-y-4">
              <input required type="text" placeholder="Image Title" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newGallery.title} onChange={e => setNewGallery({...newGallery, title: e.target.value})} />
              <select className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newGallery.category} onChange={e => setNewGallery({...newGallery, category: e.target.value})}>
                <option value="Hair">Hair</option>
                <option value="Nails">Nails</option>
                <option value="Skin">Skin</option>
                <option value="Makeup">Makeup</option>
              </select>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-luxury-ink/40">Gallery Image</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'gallery')}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="bg-luxury-cream/50 rounded-xl p-4 border-2 border-dashed border-luxury-ink/10 flex items-center justify-center group-hover:border-luxury-gold transition-colors">
                    {newGallery.image_url ? (
                      <img src={newGallery.image_url} className="h-20 w-full object-cover rounded-lg" alt="Preview" />
                    ) : (
                      <div className="text-center">
                        <Upload size={20} className="mx-auto mb-2 text-luxury-ink/40" />
                        <span className="text-xs text-luxury-ink/40">Upload Image</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button type="submit" className="w-full bg-luxury-ink text-white py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">Add Image</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-luxury-ink/5">
          <h3 className="text-2xl font-serif mb-8">Edit Site Content</h3>
          <form onSubmit={handleUpdateContent} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-luxury-ink/40">Hero Title (use \n for line break)</label>
                <textarea 
                  className="w-full bg-luxury-cream/50 rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-luxury-gold h-32"
                  value={editableContent.hero_title || ''}
                  onChange={e => setEditableContent({...editableContent, hero_title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-luxury-ink/40">Hero Subtitle</label>
                <input 
                  type="text"
                  className="w-full bg-luxury-cream/50 rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-luxury-gold"
                  value={editableContent.hero_subtitle || ''}
                  onChange={e => setEditableContent({...editableContent, hero_subtitle: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-luxury-ink/40">Mission Statement</label>
              <textarea 
                className="w-full bg-luxury-cream/50 rounded-xl p-4 text-sm outline-none focus:ring-1 focus:ring-luxury-gold h-32"
                value={editableContent.mission_statement || ''}
                onChange={e => setEditableContent({...editableContent, mission_statement: e.target.value})}
              />
            </div>
            <button type="submit" className="bg-luxury-ink text-white px-12 py-4 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all shadow-lg">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-serif mb-8">Customer Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-6 rounded-2xl shadow-sm border border-luxury-ink/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-1 bg-luxury-cream rounded-full font-bold mb-2 block w-fit">
                      {review.type} {review.target_id ? `#${review.target_id}` : ''}
                    </span>
                    <h4 className="font-bold">{review.client_name}</h4>
                  </div>
                  <div className="flex text-luxury-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-luxury-ink/70 italic mb-4">"{review.comment}"</p>
                <span className="text-[10px] text-luxury-ink/30 uppercase tracking-widest">
                  {new Date(review.created_at).toLocaleString()}
                </span>
              </div>
            ))}
            {reviews.length === 0 && (
              <div className="col-span-full p-12 text-center text-luxury-ink/40 italic bg-white rounded-3xl border border-luxury-ink/5">
                No reviews found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiService.getGallery(),
      apiService.getReviews('general')
    ]).then(([gData, rData]) => {
      setImages(gData);
      setReviews(rData);
      setLoading(false);
    });
  }, []);

  const defaultImages = [
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&q=80&w=800"
  ];

  const displayImages = images.length > 0 ? images.map(i => i.image_url) : defaultImages;

  if (loading) return <div className="pt-32 text-center font-serif italic">Loading portfolio...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-5xl font-serif mb-12 text-center">Our Portfolio</h2>
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 mb-32">
        {displayImages.map((img, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative group overflow-hidden rounded-3xl"
          >
            <img src={img} alt="Salon work" className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-luxury-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Instagram className="text-white" size={32} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-luxury-ink/10 pt-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-serif mb-4">Client Testimonials</h2>
          <p className="text-luxury-ink/60">What our clients say about their LuxeGlow experience.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-serif mb-8">Share Your Experience</h3>
            <ReviewForm type="general" onReviewAdded={() => apiService.getReviews('general').then(setReviews)} />
          </div>
          <div className="lg:col-span-2">
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => null;

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [siteContent, setSiteContent] = useState<SiteContent>({});

  useEffect(() => {
    // Check local storage for token
    if (localStorage.getItem('adminToken')) {
      setIsAdmin(true);
    }
    apiService.getContent().then(setSiteContent);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-luxury-cream selection:bg-luxury-gold selection:text-white pb-20">
        <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <main>
          <Routes>
            <Route path="/" element={<><Hero content={siteContent} /><Mission content={siteContent} /><ServicesPage /><GalleryPage /></>} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/stylists/:id" element={<StylistProfile />} />
            <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard siteContent={siteContent} setSiteContent={setSiteContent} /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
