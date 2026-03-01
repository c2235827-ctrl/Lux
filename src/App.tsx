import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService, cn, type Service, type Stylist, type Booking, type GalleryItem } from './services/api';

// Components
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

const Hero = () => (
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
        Welcome to Excellence
      </motion.span>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-6xl md:text-8xl font-serif mb-8 leading-tight"
      >
        Reveal Your <br /> <span className="italic">Inner Radiance</span>
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

const ServicesPage = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="pt-32 text-center font-serif italic">Loading our catalog...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-5xl font-serif mb-12 text-center">Our Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((service) => (
          <motion.div 
            key={service.id}
            whileHover={{ y: -10 }}
            className="bg-white rounded-3xl overflow-hidden shadow-sm border border-luxury-ink/5 group"
          >
            <div className="h-64 overflow-hidden relative">
              <img 
                src={service.image_url} 
                alt={service.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-4 py-1 rounded-full text-sm font-medium">
                ${service.price}
              </div>
            </div>
            <div className="p-8">
              <span className="text-xs uppercase tracking-widest text-luxury-gold mb-2 block">{service.category}</span>
              <h3 className="text-2xl font-serif mb-3">{service.name}</h3>
              <p className="text-luxury-ink/60 text-sm mb-6 line-clamp-2">{service.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-luxury-ink/40">
                  <Clock size={14} className="mr-1" />
                  <span>{service.duration} mins</span>
                </div>
                <Link to={`/booking?service=${service.id}`} className="text-sm font-medium flex items-center group-hover:text-luxury-gold transition-colors">
                  Book <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
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

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'services' | 'stylists' | 'gallery'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '', category: 'Hair', image_url: '' });
  const [newStylist, setNewStylist] = useState({ name: '', bio: '', specialty: '', image_url: '' });
  const [newGallery, setNewGallery] = useState({ title: '', image_url: '', category: 'Hair' });

  const fetchData = async () => {
    const [bData, sData, stData, gData] = await Promise.all([
      apiService.getBookings(),
      apiService.getServices(),
      apiService.getStylists(),
      apiService.getGallery()
    ]);
    setBookings(bData);
    setServices(sData);
    setStylists(stData);
    setGallery(gData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id: number, status: string) => {
    await apiService.updateBookingStatus(id, status);
    setBookings(bookings.map(b => b.id === id ? { ...b, status: status as any } : b));
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

  if (loading) return <div className="pt-32 text-center">Loading dashboard...</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <h2 className="text-4xl font-serif">Admin Dashboard</h2>
        <div className="flex space-x-4">
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-luxury-ink/5">
            <span className="text-xs uppercase tracking-widest text-luxury-ink/40 block">Total Revenue</span>
            <span className="text-xl font-bold font-serif">${bookings.reduce((acc, b) => acc + (services.find(s => s.id === b.service_id)?.price || 0), 0)}</span>
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
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b border-luxury-ink/5 hover:bg-luxury-cream/20 transition-colors">
                  <td className="p-6">
                    <div className="font-medium">{booking.client_name}</div>
                    <div className="text-xs text-luxury-ink/40">{booking.client_email}</div>
                    <div className="text-xs text-luxury-ink/40">{booking.client_phone}</div>
                  </td>
                  <td className="p-6 text-sm">{booking.service_name}</td>
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
              ))}
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
              <input required type="url" placeholder="Image URL" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newService.image_url} onChange={e => setNewService({...newService, image_url: e.target.value})} />
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
              <input required type="url" placeholder="Image URL" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newStylist.image_url} onChange={e => setNewStylist({...newStylist, image_url: e.target.value})} />
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
              <input required type="url" placeholder="Image URL" className="w-full bg-luxury-cream/50 rounded-xl p-3 text-sm outline-none" value={newGallery.image_url} onChange={e => setNewGallery({...newGallery, image_url: e.target.value})} />
              <button type="submit" className="w-full bg-luxury-ink text-white py-3 rounded-xl text-sm uppercase tracking-widest hover:bg-luxury-gold transition-all">Add Image</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getGallery().then(data => {
      setImages(data);
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
      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
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
    </div>
  );
};

const Footer = () => (
  <footer className="bg-luxury-ink text-white pt-20 pb-10 px-4">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      <div className="col-span-1 md:col-span-2">
        <h2 className="text-3xl font-serif mb-6 tracking-widest">LUXEGLOW</h2>
        <p className="text-white/60 max-w-sm mb-8">
          Defining luxury beauty experiences since 2015. Our mission is to provide bespoke services that celebrate your unique radiance.
        </p>
        <div className="flex space-x-6">
          <Instagram className="hover:text-luxury-gold cursor-pointer transition-colors" />
          <Facebook className="hover:text-luxury-gold cursor-pointer transition-colors" />
        </div>
      </div>
      
      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-luxury-gold">Visit Us</h4>
        <ul className="space-y-4 text-sm text-white/60">
          <li className="flex items-start">
            <MapPin size={16} className="mr-2 mt-1 shrink-0" />
            <span>123 Elegance Blvd, <br />Fashion District, NY 10012</span>
          </li>
          <li className="flex items-center">
            <Phone size={16} className="mr-2" />
            <span>+1 (555) LUXE-GLOW</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-widest font-bold mb-6 text-luxury-gold">Hours</h4>
        <ul className="space-y-4 text-sm text-white/60">
          <li className="flex justify-between">
            <span>Mon - Fri</span>
            <span>9am - 8pm</span>
          </li>
          <li className="flex justify-between">
            <span>Sat - Sun</span>
            <span>10am - 6pm</span>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40 uppercase tracking-widest">
      <span>&copy; 2026 LuxeGlow Salon. All Rights Reserved.</span>
      <Link to="/admin/login" className="hover:text-luxury-gold transition-colors">Staff Login</Link>
    </div>
  </footer>
);

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check local storage for token
    if (localStorage.getItem('adminToken')) {
      setIsAdmin(true);
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-luxury-cream selection:bg-luxury-gold selection:text-white">
        <Navbar isAdmin={isAdmin} setIsAdmin={setIsAdmin} />
        <main>
          <Routes>
            <Route path="/" element={<><Hero /><ServicesPage /><GalleryPage /></>} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/admin/login" element={<AdminLogin setIsAdmin={setIsAdmin} />} />
            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <AdminLogin setIsAdmin={setIsAdmin} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
