/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, FormEvent, createContext, useContext, ReactNode, Component } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { 
  Menu, X, ChevronDown, Check, Bus, Utensils, 
  MapPin, Calendar, Clock, Sparkles, Heart,
  Camera, Music, PartyPopper, Info, LogOut, Lock, Users, Trash2, ExternalLink
} from 'lucide-react';
import { 
  auth, db, loginWithGoogle, logout, submitRSVP, getRSVPs, RSVPData, 
  handleFirestoreError, OperationType 
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';

// --- Context & Providers ---

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = user?.email === 'vuhami02@gmail.com' || user?.email === 'macievu02@gmail.com';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- Error Boundary ---

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  public state: { hasError: boolean; error: any };
  public props: { children: ReactNode };

  constructor(props: { children: ReactNode }) {
    super(props);
    this.props = props;
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    const { hasError } = this.state;
    if (hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
          <div className="max-w-md bg-white p-8 border border-gold/20 shadow-xl">
            <Info className="text-burgundy mx-auto mb-4" size={48} />
            <h2 className="font-serif italic text-2xl text-burgundy mb-4">Something went wrong</h2>
            <p className="text-sm text-text-mid mb-6">We encountered an error. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-burgundy text-white px-6 py-2 rounded-sm text-xs tracking-widest uppercase font-bold"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { name: 'Invitation', href: '#invitation' },
    { name: 'Timeline', href: '#timeline' },
    { name: 'Details', href: '#details' },
    { name: 'Menus', href: '#menus' },
    { name: 'Travel', href: '#travel' },
    { name: 'Q & A', href: '#qa' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-ivory/95 backdrop-blur-md border-b border-gold/20 py-3' : 'bg-transparent py-5'} px-6 md:px-10 flex items-center justify-between`}>
      <div className="h-12 md:h-16">
        <img 
          src="/Mi&Michael2.png" 
          alt="Mi & Michael" 
          className="h-full w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>
      
      {/* Desktop Links */}
      <ul className="hidden md:flex items-center gap-8">
        {links.map(link => (
          <li key={link.name}>
            <a href={link.href} className="text-[10px] tracking-[2.5px] uppercase text-text-mid hover:text-burgundy transition-colors font-medium">
              {link.name}
            </a>
          </li>
        ))}
        <li>
          <a href="#rsvp" className="bg-burgundy text-white px-5 py-2 rounded-sm text-[10px] tracking-[2px] uppercase font-semibold hover:bg-burgundy-deep transition-colors">
            RSVP
          </a>
        </li>
      </ul>

      {/* Mobile Toggle */}
      <button className="md:hidden text-text-dark" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-ivory border-b border-gold/20 p-6 flex flex-col gap-6 md:hidden shadow-xl"
          >
            {links.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-[11px] tracking-[2.5px] uppercase text-text-mid font-medium"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#rsvp" 
              onClick={() => setIsOpen(false)}
              className="bg-burgundy text-white px-5 py-3 rounded-sm text-[11px] tracking-[2px] uppercase font-semibold text-center"
            >
              RSVP
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Hero = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    setTimeout(() => {
      document.getElementById('invitation')?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
  };

  const orbs = [
    { size: 28, top: '18%', left: '15%', duration: 6, delay: 0 },
    { size: 18, top: '30%', left: '72%', duration: 7.5, delay: 1 },
    { size: 22, top: '60%', left: '8%', duration: 8, delay: 2 },
    { size: 14, top: '72%', left: '82%', duration: 6.5, delay: 0.5 },
    { size: 32, top: '20%', left: '85%', duration: 9, delay: 1.5 },
    { size: 16, top: '80%', left: '40%', duration: 7, delay: 3 },
    { size: 24, top: '45%', left: '92%', duration: 8.5, delay: 0.8 },
    { size: 12, top: '85%', left: '22%', duration: 5.5, delay: 2.5 },
  ];

  return (
    <section id="hero" className="min-h-screen bg-ivory flex flex-col items-center justify-center relative overflow-hidden pt-20 px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/BG.PNG')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* Overlay to ensure readability if needed, though text was removed */}
      <div className="absolute inset-0 bg-cream/20 z-0" />
      {/* Floating Orbs (Pearls) */}
      <div className="absolute inset-0 pointer-events-none">
        {orbs.map((orb, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-radial-[at_30%_30%] from-white/90 to-gold/20 shadow-[inset_-2px_-2px_6px_rgba(196,151,58,0.2),0_4px_20px_rgba(196,151,58,0.1)] animate-float-orb"
            style={{
              width: orb.size,
              height: orb.size,
              top: orb.top,
              left: orb.left,
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay}s`
            }}
          />
        ))}
      </div>

      {/* Interactive Envelope Image */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.2 }}
        className="relative cursor-pointer mb-12 z-10"
        onClick={handleOpen}
      >
        <motion.div 
          animate={isOpen ? { y: -100, opacity: 0, scale: 1.1 } : { y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative"
        >
          <div className="w-72 h-48 md:w-96 md:h-64 flex items-center justify-center filter drop-shadow-[0_20px_60px_rgba(100,40,40,0.25)]">
            <img 
              src="/envelope-2.png" 
              alt="Wedding Envelope" 
              className="w-full h-auto scale-110"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If the local image is missing, we'll show a styled placeholder or the CSS version
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent && !parent.querySelector('.envelope-fallback')) {
                  const fallback = document.createElement('div');
                  fallback.className = 'envelope-fallback w-72 h-48 md:w-96 md:h-64 bg-burgundy relative rounded-sm shadow-2xl overflow-hidden mx-auto';
                  fallback.innerHTML = `
                    <div class="absolute inset-0 border-t-[100px] md:border-t-[130px] border-t-burgundy-deep border-x-[144px] md:border-x-[192px] border-x-transparent z-10"></div>
                    <div class="absolute inset-0 border-b-[100px] md:border-b-[130px] border-b-burgundy border-x-[144px] md:border-x-[192px] border-x-transparent z-0"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-radial-[at_30%_30%] from-gold-light to-gold rounded-full shadow-xl z-20 flex items-center justify-center border border-gold-light/50">
                      <div class="w-10 h-10 md:w-14 md:h-14 rounded-full border border-white/20 flex items-center justify-center">
                        <span class="font-serif italic text-white text-xl md:text-2xl">M</span>
                      </div>
                    </div>
                  `;
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          
          {/* Floating Tap Hint */}
          <p className="text-center text-[10px] tracking-[3px] uppercase text-white mt-1 animate-pulse">
            ✦ &nbsp; tap to open &nbsp; ✦
          </p>
        </motion.div>
      </motion.div>

      {/* Names and Details Removed */}

      <div className="absolute bottom-10 flex flex-col items-center gap-2">
        <div className="w-px h-12 bg-linear-to-b from-gold to-transparent animate-scroll-down" />
      </div>
    </section>
  );
};

const Invitation = () => {
  return (
    <section id="invitation" className="relative py-20 px-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/BG3.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="absolute inset-0 bg-ivory/40 z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-[600px] mx-auto shadow-[0_20px_80px_rgba(100,40,40,0.15),0_4px_20px_rgba(0,0,0,0.08)] rounded-sm overflow-hidden border border-gold/10"
      >
        <img 
          src="/invitation.png" 
          alt="Wedding Invitation" 
          className="w-full h-auto block"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement('div');
              fallback.className = 'p-20 text-center bg-white text-burgundy font-serif italic';
              fallback.innerText = 'Invitation Image Not Found';
              parent.appendChild(fallback);
            }
          }}
        />
      </motion.div>
    </section>
  );
};

const Timeline = () => {
  const events = [
    { time: '3:00', icon: <Bus size={24} />, event: 'Pick Up', desc: 'Buses depart from the designated location to the venue' },
    { time: '4:00', icon: <Sparkles size={24} />, event: 'Welcome', desc: 'Enjoy drinks, take photos & leave the couple a message' },
    { time: '5:00', icon: <Heart size={24} />, event: 'Ceremony', desc: 'The walk down the aisle and the exchange of vows' },
    { time: '6:00', icon: <Utensils size={24} />, event: 'Reception', desc: 'Dinner is served with speeches and heartfelt toasts' },
    { time: '8:00', icon: <Music size={24} />, event: 'After Party', desc: 'Hit the dance floor — bouquet toss included!' },
  ];

  return (
    <section id="timeline" className="bg-ivory py-24 px-6 max-w-5xl mx-auto">
      <span className="text-[9px] tracking-[4px] uppercase text-gold font-medium block mb-3 text-center">The Day</span>
      <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-burgundy text-center mb-12">Event Timeline</h2>
      
      <div className="flex gap-0 overflow-x-auto pb-6 scroll-snap-x-mandatory scrollbar-thin scrollbar-thumb-gold scrollbar-track-transparent">
        {events.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex-none w-[180px] scroll-snap-align-start text-center px-4 relative"
          >
            {i !== events.length - 1 && (
              <div className="absolute top-7 -right-3 w-6 h-px bg-gold/40" />
            )}
            <div className="font-serif text-3xl text-gold font-light leading-none">{item.time}</div>
            <div className="w-2.5 h-2.5 bg-burgundy rounded-full mx-auto my-3" />
            <div className="text-burgundy mb-3 flex justify-center">{item.icon}</div>
            <div className="text-[9px] tracking-[2.5px] uppercase text-burgundy font-semibold mb-2.5">{item.event}</div>
            <p className="text-sm text-text-light leading-relaxed font-serif italic">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Details = () => {
  return (
    <section id="details" className="relative py-24 px-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/BG3.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-cream/40 z-0" />

      <div className="max-w-5xl mx-auto relative z-10">
        <span className="text-[9px] tracking-[4px] uppercase text-gold font-medium block mb-3 text-center">What You Need to Know</span>
        <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-burgundy text-center mb-12">The Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dress Code */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gold/20 p-9 shadow-[0_4px_24px_rgba(100,40,40,0.06)] hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(100,40,40,0.12)] transition-all duration-300"
        >
          <PartyPopper className="text-burgundy mb-4" size={32} />
          <h3 className="text-[9px] tracking-[3px] uppercase text-gold font-semibold mb-3">Dress Code</h3>
          <p className="text-sm text-text-mid leading-relaxed mb-5">Formal attire is requested. Please avoid short dresses and T-shirts.</p>
          <div className="flex gap-4 flex-wrap">
            {[
              { color: '#2C3E5A', label: 'Navy' },
              { color: '#4A3728', label: 'Chocolate' },
              { color: '#C4B8A8', label: 'Beige' },
              { color: '#F7E7CE', label: 'Champagne' },
              { color: '#B2D2A4', label: 'Pastel Green' },
              { color: '#AEC6CF', label: 'Pastel Blue' },
              { color: '#1A1A1A', label: 'Black' },
            ].map(swatch => (
              <div key={swatch.label} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full shadow-lg" style={{ backgroundColor: swatch.color }} />
                <span className="text-[9px] tracking-wider uppercase text-text-light">{swatch.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Accommodation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gold/20 p-9 shadow-[0_4px_24px_rgba(100,40,40,0.06)] hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(100,40,40,0.12)] transition-all duration-300"
        >
          <MapPin className="text-burgundy mb-4" size={32} />
          <h3 className="text-[9px] tracking-[3px] uppercase text-gold font-semibold mb-3">Accommodation</h3>
          <p className="text-sm text-text-mid leading-relaxed">We recommend staying close to the venue. Transportation will be provided.</p>
          <div className="mt-3 bg-burgundy/5 border-l-2 border-gold p-4 text-base md:text-lg text-text-mid font-serif italic">
            🎉 Get <strong>10% off</strong> at Hanoi InterContinental Hotel & Resort when you mention the wedding.
          </div>
          <div className="mt-6 space-y-5">
            {[
              { label: 'Main Pickup', address: '148 Quan Thanh St, Ba Dinh, Hanoi, 100000, Vietnam' },
              { label: '2nd Pickup', address: 'Luxe Paradise Hotel 25–27 Nguyen Khac Hieu, Ba Dinh, Hanoi, 100000, Vietnam' },
              { label: 'Venue', address: 'Hanoi InterContinental Resorts · 5 Tu Hoa, Quang An, Tay Ho, Hanoi, 100000, Vietnam' },
            ].map((loc, idx) => (
              <div key={idx} className="flex items-start gap-3 group">
                <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] tracking-widest uppercase text-gold font-bold">{loc.label}</span>
                  <span className="text-xs text-text-mid leading-relaxed">{loc.address}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transport */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gold/20 p-9 shadow-[0_4px_24px_rgba(100,40,40,0.06)] hover:translate-y-[-4px] hover:shadow-[0_12px_40_rgba(100,40,40,0.12)] transition-all duration-300"
        >
          <Bus className="text-burgundy mb-4" size={32} />
          <h3 className="text-[9px] tracking-[3px] uppercase text-gold font-semibold mb-3">Transportation</h3>
          <p className="text-sm text-text-mid leading-relaxed mb-3">A complimentary bus will depart from the main pickup point at 3:00 PM. This is optional — you're welcome to arrange your own transport via Grab or taxi.</p>
          <p className="text-sm text-text-mid"><strong className="text-burgundy">Main Pickup:</strong><br />148 Quan Thanh St, Ba Dinh, Hanoi, 100000, Vietnam</p>
        </motion.div>

        {/* Arrival Tips */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white border border-gold/20 p-9 shadow-[0_4px_24px_rgba(100,40,40,0.06)] hover:translate-y-[-4px] hover:shadow-[0_12px_40px_rgba(100,40,40,0.12)] transition-all duration-300"
        >
          <Info className="text-burgundy mb-4" size={32} />
          <h3 className="text-[9px] tracking-[3px] uppercase text-gold font-semibold mb-3">Arrival Tips</h3>
          <ul className="space-y-2 mb-4">
            <li className="text-sm text-text-mid flex items-start gap-2"><span className="text-gold">—</span> Please arrive 20–30 minutes early</li>
            <li className="text-sm text-text-mid flex items-start gap-2"><span className="text-gold">—</span> Parking is available at the venue</li>
            <li className="text-sm text-text-mid flex items-start gap-2"><span className="text-gold">—</span> A golf cart will transport guests from the parking area to the Sunset Bar (Ceremony location)</li>
            <li className="text-sm text-text-mid flex items-start gap-2"><span className="text-gold">—</span> Enjoy a complimentary welcome drink at the Sunset Bar upon arrival</li>
          </ul>
          <div className="overflow-hidden rounded-sm border border-gold/10">
            <img 
              src="/Hotel.jpg" 
              alt="Hanoi InterContinental Venue" 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500" 
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </div>
    </section>
  );
};

const Menus = () => {
  const menuData = [
    {
      title: 'Appetizer',
      items: [
        { en: 'Fresh rice noodle rolls with sautéed beef & herbs', vi: 'Phở cuốn thịt bò rau thơm' },
        { en: 'Deep-fried seafood spring rolls', vi: 'Nem hải sản chiên' },
        { en: 'Grilled pineapple & vegetable salad with shrimp', vi: 'Sa lát dứa nướng, rau và tôm' },
      ]
    },
    {
      title: 'Meat & Seafood',
      items: [
        { en: 'Braised oxtail with Chinese herbal', vi: 'Đuôi bò hầm thuốc bắc' },
        { en: 'Deep-fried soft shell crab, ginger tamarind sauce', vi: 'Cua bẩy chiên phục vụ cùng sốt gừng me' },
      ]
    },
    {
      title: 'Fish & Poultry',
      items: [
        { en: 'Baked Sturgeon with salted chili, fresh rice noodle & lettuce', vi: 'Cá tầm nướng muối ớt phục vụ cùng bún & rau sống' },
        { en: 'Roasted Duck with plum sauce', vi: 'Vịt quay sốt mận' },
      ]
    },
    {
      title: 'Sides & Dessert',
      items: [
        { en: 'Sautéed seasonal vegetables with mushroom in oyster sauce', vi: 'Rau theo mùa xào nấm sốt dầu hào' },
        { en: 'Pork rib with mushroom & lotus seed broth', vi: 'Canh sườn nấu nấm và hạt sen' },
        { en: 'Red sticky rice with mung bean', vi: 'Xôi gấc đậu xanh' },
        { en: 'Coconut steamed rice', vi: 'Cơm nấu cốt dừa' },
        { en: 'Ginger crème brûlée & green tea ice cream', vi: 'Kem cháy hương gừng cùng kem trà xanh' },
      ]
    }
  ];

  return (
    <section id="menus" className="bg-cream py-24 px-6 max-w-5xl mx-auto">
      <span className="text-[9px] tracking-[4px] uppercase text-gold font-medium block mb-3 text-center">Vietnamese Family-Style Dinner</span>
      <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-burgundy text-center mb-12">The Menus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-x-16 md:gap-y-10">
        <div className="md:col-span-2 text-center bg-white border border-gold/20 p-5 md:p-8 text-lg text-text-mid italic font-serif leading-relaxed">
          Please let us know about any allergies or if you are vegetarian — respond via the RSVP form or send us a message. Adjustments may be necessary.
        </div>

        {menuData.map((cat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="border-t border-gold/30 pt-5"
          >
            <p className="text-[8px] tracking-[3px] uppercase text-gold font-semibold mb-3">{cat.title}</p>
            {cat.items.map((item, j) => (
              <div key={j} className="mb-4">
                <p className="font-serif text-[15px] text-text-dark leading-snug">{item.en}</p>
                {item.vi && <p className="text-sm text-text-light italic font-serif mt-1">{item.vi}</p>}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const Travel = () => {
  const [activeTab, setActiveTab] = useState('restaurants');

  const tabs = [
    { id: 'restaurants', label: '🍜 Restaurants', content: [
      { name: 'Phở Cuốn Chinh Thắng', info: '📍 7 Mac Dinh Chi St, Truc Bach, Ba Dinh, Hanoi\n⏰ 10:00 AM – 9:00 PM', price: '~$1 – $4 USD', link: 'https://www.google.com/maps/search/?api=1&query=Phở+Cuốn+Chinh+Thắng+7+Mac+Dinh+Chi+Hanoi' },
      { name: 'Miến Lươn Hàng Điếu', info: '📍 21 Hang Dieu, Cua Dong, Hoan Kiem, Hanoi\n⏰ 9:00 AM – 11:00 PM', price: '~$2 – $4 USD', link: 'https://www.google.com/maps/search/?api=1&query=Miến+Lươn+Hàng+Điếu+21+Hang+Dieu+Hanoi' },
      { name: 'Chayfood (Vegan)', info: '📍 66 Nguyen Huu Huan, Hang Bac, Hoan Kiem, Hanoi\n⏰ 9:00 AM – 9:00 PM', price: '~$5 – $10 USD', link: 'https://www.google.com/maps/search/?api=1&query=Chayfood+66+Nguyen+Huu+Huan+Hanoi' },
    ]},
    { id: 'entertainment', label: '🍹 Entertainment', content: [
      { name: 'The Note Coffee', info: '📍 64 Luong Van Cao, Hang Trong, Hoan Kiem, Hanoi\n⏰ 8:00 AM – 10:30 PM', price: '~$1 – $3 USD', link: 'https://www.google.com/maps/search/?api=1&query=The+Note+Coffee+64+Luong+Van+Cao+Hanoi' },
      { name: 'Botan Bar & Dine — Rooftop', info: '📍 151–153 Hang Bong, Hoan Kiem, Hanoi\n⏰ 2:00 PM – 1:00 AM', price: '~$6 – $15 USD', link: 'https://www.google.com/maps/search/?api=1&query=Botan+Bar+and+Dine+151+Hang+Bong+Hanoi' },
      { name: 'Bar Dinh Rooftop Bar', info: '📍 Rooftop 105 Nguyen Truong To, Quan Thanh, Hanoi\n⏰ 1:00 PM – 4:30 AM', price: '~$6 – $15 USD', link: 'https://www.google.com/maps/search/?api=1&query=Bar+Dinh+Rooftop+105+Nguyen+Truong+To+Hanoi' },
      { name: 'Water Theater', info: '📍 57B Dinh Tien Hoang, Hang Bac, Hoan Kiem, Hanoi', price: '~$4 – $10 USD', link: 'https://www.google.com/maps/search/?api=1&query=Thang+Long+Water+Puppet+Theatre+Hanoi' },
    ]},
    { id: 'spa', label: '✨ Spa & Wellness', content: [
      { name: 'Plush Nails', info: '📍 23 Quan Thanh, Ba Dinh, Hanoi\n⏰ 9:00 AM – 9:00 PM', price: '~$15 – $50 USD', link: 'https://www.google.com/maps/search/?api=1&query=Plush+Nails+23+Quan+Thanh+Hanoi' },
      { name: 'Sense Massage', info: '📍 41 Hang Bong, Hang Trong, Hoan Kiem, Hanoi\n⏰ 10:00 AM – 10:00 PM', price: '~$25 – $170 USD', link: 'https://www.google.com/maps/search/?api=1&query=Sense+Massage+41+Hang+Bong+Hanoi' },
    ]},
    { id: 'experiences', label: '🛵 Experiences', content: [
      { name: 'Hanoi by Night: Street Food Walk', info: 'Join a private street food tour with a local guide. Flexible & customizable — hidden local spots included.', price: '~$29/person', link: 'https://www.airbnb.com/experiences/6962949?checkin=2026-06-30&location=Hanoi%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam&currentTab=experience_tab&federatedSearchId=5a70fb88-77a3-45ca-9480-928401416e79&searchId=42adad95-c1a5-4505-8d6e-12be76f3fbf4&sectionId=09123068-f5e5-41cf-8e7c-4f534dca8707' },
      { name: 'Shoot Film With a Hanoi Photographer', info: 'Capture Hanoi\'s charm on film with a professional camera & one film roll included. Explore the city together.', price: '~$75/person', link: 'https://www.airbnb.com/experiences/3339570?checkin=2026-06-30&location=Hanoi%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam&currentTab=experience_tab&federatedSearchId=5a70fb88-77a3-45ca-9480-928401416e79&searchId=42adad95-c1a5-4505-8d6e-12be76f3fbf4&sectionId=09123068-f5e5-41cf-8e7c-4f534dca8707' },
      { name: 'Hanoi City Adventure on Motorbike', info: 'Navigate the vibrant streets and uncover local life on two wheels. An unforgettable way to see the city.', price: '~$48/person', link: 'https://www.airbnb.com/experiences/6943874?checkin=2026-06-30&location=Hanoi%2C%20H%C3%A0%20N%E1%BB%99i%2C%20Vi%E1%BB%87t%20Nam&currentTab=experience_tab&federatedSearchId=5a70fb88-77a3-45ca-9480-928401416e79&searchId=42adad95-c1a5-4505-8d6e-12be76f3fbf4&sectionId=09123068-f5e5-41cf-8e7c-4f534dca8707' },
    ]},
    { id: 'apps', label: '📱 Local Apps', content: [
      { name: 'Grab', info: 'Essential for transportation and food delivery. Safe, reliable, and shows prices upfront.', price: 'Transportation', link: 'https://www.grab.com/vn/en/' },
      { name: 'Shopee', info: 'The leading e-commerce platform in Vietnam for all your shopping needs and essentials.', price: 'Shopping', link: 'https://shopee.vn/' },
      { name: 'Airbnb', info: 'Perfect for booking unique local experiences, tours, and stays across Hanoi.', price: 'Book Experience', link: 'https://www.airbnb.com/hanoi-vietnam/experiences' },
    ]},
  ];

  return (
    <section id="travel" className="relative py-24 px-6 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/BG3.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      {/* Overlay to ensure readability */}
      <div className="absolute inset-0 bg-ivory/60 z-0" />

      <div className="max-w-5xl mx-auto relative z-10">
        <span className="text-[9px] tracking-[4px] uppercase text-gold font-medium block mb-3 text-center">Explore Hanoi</span>
        <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-burgundy text-center mb-5">Travel Tips</h2>
        <p className="text-center font-serif italic text-base text-text-mid max-w-[560px] mx-auto mb-10 leading-relaxed">
          We know it's a long trip — here are some of our favorite spots to make your visit to Hanoi not just a celebration, but an unforgettable vacation.
        </p>

      <div className="flex border-b border-gold/25 mb-10 overflow-x-auto">
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-[9px] tracking-wider uppercase border-b-2 transition-all duration-300 whitespace-nowrap ${activeTab === tab.id ? 'text-burgundy border-burgundy' : 'text-text-light border-transparent'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {tabs.find(t => t.id === activeTab)?.content.map((place, i) => (
            <a 
              key={i} 
              href={place.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="border border-gold/15 p-5 md:p-6 bg-white hover:border-gold/40 hover:shadow-md transition-all duration-300 block group"
            >
              <div className="flex justify-between items-start">
                <p className="font-serif text-lg text-burgundy mb-1.5 group-hover:text-burgundy-deep transition-colors">{place.name}</p>
                <div className="text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                  <MapPin size={16} />
                </div>
              </div>
              <p className="text-sm text-text-light leading-relaxed whitespace-pre-line">{place.info}</p>
              <span className="inline-block mt-2 bg-gold/10 text-gold px-2.5 py-1 text-[10px] tracking-wider rounded-sm">{place.price}</span>
            </a>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
    </section>
  );
};

const QA = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const questions = [
    { q: 'Are children invited?', a: 'Yes, we love kids! This is a special day, so we just ask that parents keep an eye on their little ones so everyone can have fun safely.' },
    { q: 'What time should I arrive?', a: 'Please plan to arrive 20–30 minutes before the ceremony begins at 5:00 PM. The bus departs the main pickup at 3:00 PM.' },
    { q: 'Will there be parking / transportation?', a: 'Parking is available at the venue. We also provide a complimentary bus from the main pickup point at 148 Quan Thanh St. You may also use Grab (Vietnam\'s Uber) or arrange your own transport.' },
    { q: 'Do you have a gift registry?', a: 'In Vietnamese tradition, guests often give monetary gifts to the couple. Your presence is the greatest gift — however, if you wish to honor this tradition, a contribution is warmly appreciated.' },
    { q: 'Can I bring a plus-one?', a: 'All guest names must be provided in the RSVP form. Please include the full names of anyone attending with you when you RSVP.' },
  ];

  return (
    <section id="qa" className="bg-cream py-24 px-6 max-w-5xl mx-auto">
      <span className="text-[9px] tracking-[4px] uppercase text-gold font-medium block mb-3 text-center">Got Questions?</span>
      <h2 className="font-serif italic font-bold text-4xl md:text-5xl text-burgundy text-center mb-12">Q & A</h2>
      
      <div className="max-w-[640px] mx-auto">
        {questions.map((item, i) => (
          <div key={i} className="border-b border-gold/20">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center py-5 text-left group"
            >
              <span className="text-[11px] tracking-wider uppercase text-text-dark font-medium group-hover:text-burgundy transition-colors">{item.q}</span>
              <div className={`w-5 h-5 border border-gold rounded-full flex items-center justify-center text-sm text-gold transition-all duration-300 ${openIndex === i ? 'rotate-45 bg-burgundy text-white border-burgundy' : ''}`}>
                +
              </div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-text-mid leading-relaxed font-serif italic pb-5">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const RSVP = () => {
  const [attendance, setAttendance] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    guestCount: '1',
    dietary: '',
    guestNames: '',
    message: '',
    busOption: 'yes'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !attendance) {
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRSVP({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        attending: attendance === 'yes',
        guests: parseInt(formData.guestCount) - 1,
        dietary: formData.dietary,
        message: `Bus: ${formData.busOption} | Guests: ${formData.guestNames} | Msg: ${formData.message}`
      });
      setSubmitted(true);
    } catch (error) {
      console.error("RSVP Submission Error:", error);
      alert("There was an error submitting your RSVP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="rsvp" className="bg-burgundy py-24 px-6">
      <div className="max-w-[600px] mx-auto">
        <span className="text-[9px] tracking-[4px] uppercase text-white/80 block text-center mb-3">Kindly Respond</span>
        <h2 className="font-serif italic font-bold text-4xl md:text-6xl text-cream text-center mb-2">RSVP</h2>
        <p className="text-center text-[10px] tracking-[3px] text-white/50 uppercase mb-12">Please reply by <span className="text-gold-light">August 8, 2026</span></p>

        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.form 
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <p className="text-[9px] tracking-wider uppercase text-white/50 mb-3">Will you be attending?</p>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setAttendance('yes')}
                    className={`p-4 border flex flex-col items-center gap-2 transition-all duration-300 ${attendance === 'yes' ? 'bg-gold/15 border-gold text-gold-light' : 'border-white/20 text-white/60 hover:border-gold hover:text-gold-light'}`}
                  >
                    <Check size={20} />
                    <span className="text-[10px] tracking-widest uppercase">Joyfully Accepts</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAttendance('no')}
                    className={`p-4 border flex flex-col items-center gap-2 transition-all duration-300 ${attendance === 'no' ? 'bg-gold/15 border-gold text-gold-light' : 'border-white/20 text-white/60 hover:border-gold hover:text-gold-light'}`}
                  >
                    <X size={20} />
                    <span className="text-[10px] tracking-widest uppercase">Regretfully Declines</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] tracking-wider uppercase text-white/50">First Name *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all"
                    placeholder="Your first name"
                    value={formData.firstName}
                    onChange={e => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] tracking-wider uppercase text-white/50">Last Name *</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all"
                    placeholder="Your last name"
                    value={formData.lastName}
                    onChange={e => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] tracking-wider uppercase text-white/50">Email Address *</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              {attendance === 'yes' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] tracking-wider uppercase text-white/50">Number of Guests</label>
                      <select 
                        className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all appearance-none"
                        value={formData.guestCount}
                        onChange={e => setFormData({...formData, guestCount: e.target.value})}
                      >
                        <option value="1" className="bg-burgundy-deep">1 person (just me)</option>
                        <option value="2" className="bg-burgundy-deep">2 people</option>
                        <option value="3" className="bg-burgundy-deep">3 people</option>
                        <option value="4" className="bg-burgundy-deep">4 people</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] tracking-wider uppercase text-white/50">Dietary Needs</label>
                      <select 
                        className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all appearance-none"
                        value={formData.dietary}
                        onChange={e => setFormData({...formData, dietary: e.target.value})}
                      >
                        <option value="" className="bg-burgundy-deep">No restrictions</option>
                        <option value="vegetarian" className="bg-burgundy-deep">Vegetarian</option>
                        <option value="vegan" className="bg-burgundy-deep">Vegan</option>
                        <option value="halal" className="bg-burgundy-deep">Halal</option>
                        <option value="gluten-free" className="bg-burgundy-deep">Gluten Free</option>
                        <option value="other" className="bg-burgundy-deep">Other (please note below)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] tracking-wider uppercase text-white/50">Names of All Guests Attending</label>
                    <input 
                      type="text" 
                      className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all"
                      placeholder="e.g. John Smith, Jane Smith"
                      value={formData.guestNames}
                      onChange={e => setFormData({...formData, guestNames: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] tracking-wider uppercase text-white/50">Will you use the complimentary bus?</label>
                    <select 
                      className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all appearance-none"
                      value={formData.busOption}
                      onChange={e => setFormData({...formData, busOption: e.target.value})}
                    >
                      <option value="yes" className="bg-burgundy-deep">Yes — pick me up at 3:00 PM</option>
                      <option value="no" className="bg-burgundy-deep">No — I'll arrange my own transport</option>
                    </select>
                  </div>
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] tracking-wider uppercase text-white/50">Song Request / Message for the Couple</label>
                <textarea 
                  rows={3}
                  className="w-full bg-white/10 border border-white/15 p-3 text-white text-sm outline-none focus:border-gold focus:bg-white/15 transition-all resize-none"
                  placeholder="Leave Mi & Michael a sweet message, or request a song for the dance floor!"
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gold hover:bg-gold-light text-burgundy-deep py-4 text-[11px] tracking-[3px] uppercase font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Reserve My Spot ✦'}
              </button>
            </motion.form>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="text-cream text-5xl mb-4 flex justify-center"><Sparkles size={64} /></div>
              <h3 className="font-serif italic text-3xl text-cream mb-2">See you in Hanoi!</h3>
              <p className="text-sm text-white/60">Thank you for your RSVP. Mi & Michael are so excited to celebrate with you.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-[10px] tracking-widest uppercase text-gold hover:text-gold-light underline underline-offset-4"
              >
                Submit another response
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

const AdminDashboard = () => {
  const { user, isAdmin, loading } = useAuth();
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = getRSVPs(setRsvps);
      return unsubscribe;
    }
  }, [isAdmin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this RSVP?')) return;
    const path = `rsvps/${id}`;
    try {
      await deleteDoc(doc(db, 'rsvps', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  if (loading) return null;
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        onClick={() => setShowAdmin(!showAdmin)}
        className="bg-burgundy text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all flex items-center justify-center"
      >
        {showAdmin ? <X size={24} /> : <Lock size={24} />}
      </button>

      <AnimatePresence>
        {showAdmin && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[90vw] md:w-[600px] max-h-[80vh] bg-white border border-gold/20 shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-6 bg-burgundy text-white flex justify-between items-center">
              <div>
                <h3 className="font-serif italic text-2xl">Guest List</h3>
                <p className="text-[9px] tracking-widest uppercase opacity-70">Total RSVPs: {rsvps.length}</p>
              </div>
              <button onClick={logout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <LogOut size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-ivory">
              {rsvps.length === 0 ? (
                <div className="text-center py-12 text-text-light italic font-serif">No RSVPs yet.</div>
              ) : (
                rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="bg-white p-5 border border-gold/10 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-serif text-lg text-burgundy">{rsvp.name}</h4>
                        <p className="text-xs text-text-light">{rsvp.email}</p>
                      </div>
                      <div className={`px-2 py-1 text-[8px] tracking-tighter uppercase font-bold rounded-sm ${rsvp.attending ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {rsvp.attending ? 'Attending' : 'Declined'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-[10px] text-text-mid">
                        <Users size={12} className="text-gold" />
                        <span>Guests: {rsvp.guests + 1}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-text-mid">
                        <Clock size={12} className="text-gold" />
                        <span>{rsvp.createdAt?.toDate ? rsvp.createdAt.toDate().toLocaleDateString() : 'Just now'}</span>
                      </div>
                    </div>

                    {rsvp.dietary && (
                      <div className="text-[10px] text-text-mid bg-gold/5 p-2 rounded-sm mb-2">
                        <strong className="text-gold uppercase tracking-tighter">Dietary:</strong> {rsvp.dietary}
                      </div>
                    )}

                    {rsvp.message && (
                      <p className="text-xs text-text-mid italic font-serif border-l-2 border-gold/20 pl-3 py-1">
                        {rsvp.message}
                      </p>
                    )}

                    <button 
                      onClick={() => handleDelete(rsvp.id!)}
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Footer = () => {
  const { isAdmin } = useAuth();

  return (
    <footer className="bg-burgundy-deep py-16 px-6 text-center">
      <div className="h-48 mx-auto mb-4">
        <img 
          src="/Mi&Michael2.png" 
          alt="Mi & Michael" 
          className="h-full w-auto object-contain mx-auto brightness-0 invert opacity-60"
          referrerPolicy="no-referrer"
        />
      </div>
      <span className="text-[9px] tracking-[4px] uppercase text-gold mt-3 block">01 · 23 · 2027 · Hanoi, Vietnam</span>
      <p className="mt-10 text-[10px] tracking-wider text-white/40 leading-loose">
        Hanoi InterContinental Resorts · 5 Tu Hoa, Quang An, Tay Ho, Hanoi, 100000, Vietnam
      </p>
      <div className="flex justify-center gap-6 mt-10">
        <a href="#hero" className="text-[9px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors">Home</a>
        <a href="#rsvp" className="text-[9px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors">RSVP</a>
        {!isAdmin && (
          <button onClick={loginWithGoogle} className="text-[9px] tracking-widest uppercase text-white/40 hover:text-gold transition-colors flex items-center gap-1">
            <Lock size={10} /> Admin
          </button>
        )}
      </div>
      <p className="text-[10px] text-white/40 mt-8">Made with love ♥</p>
    </footer>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-ivory text-text-dark font-sans selection:bg-gold/30">
          <Nav />
          <Hero />
          <Invitation />
          <Timeline />
          <Details />
          <Menus />
          <Travel />
          <QA />
          <RSVP />
          <Footer />
          <AdminDashboard />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
}
