/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { 
  ArrowRight, 
  BookOpen, 
  Gamepad2, 
  Linkedin, 
  Mail, 
  Rocket, 
  Sparkles, 
  Users2, 
  Zap,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { useState } from "react";

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Assets
  const mascotUrl = "https://i.postimg.cc/26kW2Q78/susi.png";
  const bannerUrl = "https://picsum.photos/seed/lobomotor-logo/400/400";
  // Extracting the logo from the banner
  const logoUrl = "https://i.postimg.cc/26kW2Q78/susi.png"; 

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const services = [
    {
      icon: <Users2 className="w-6 h-6" />,
      title: "Game Industry Consulting",
      description: "Strategic advisory for studios and publishers. From production pipelines to market positioning and creative direction."
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: "Game Development",
      description: "Full-cycle creation of indie titles and experimental gameplay experiences, built with passion and technical precision."
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Comic Book Production",
      description: "Writing and illustrating original graphic novels and comic series, blending deep storytelling with striking visuals."
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Creative Direction",
      description: "Helping brands and projects find their unique voice through world-building, character design, and narrative strategy."
    }
  ];

  const panels = [
    { url: "https://i.postimg.cc/FHnF2jvc/alexriimu.jpg", title: "The Setup" },
    { url: "https://i.postimg.cc/8C6G99t8/EM-02-03-bubbles-(3).jpg", title: "The Conflict" },
    { url: "https://i.postimg.cc/bYF6SrqY/5178021.jpg", title: "The Action" }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#f27d26] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.2)]">
                <img 
                  src={logoUrl} 
                  alt="Lobomotor Logo" 
                  className="w-full h-full object-cover scale-[2.5] translate-x-[25%]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-display font-bold tracking-tighter uppercase">Lobomotor</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <a href="#work" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Work</a>
              <a href="#services" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Services</a>
              <a href="#contact" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Contact</a>
              <button className="bg-[#f27d26] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#d96a1d] transition-all">
                Let's Talk
              </button>
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white mb-1.5"></div>
              <div className="w-6 h-0.5 bg-white"></div>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
          {/* Background Comic Texture */}
          <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
            <img 
              src="https://i.postimg.cc/FHnF2jvc/alexriimu.jpg" 
              alt="Background Texture" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505]"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                  <Zap className="w-3 h-3 text-[#f27d26] fill-[#f27d26]" />
                  Independent Creative Studio
                </div>
                <h1 className="text-6xl lg:text-8xl font-display font-black leading-[0.9] mb-8 tracking-tighter uppercase text-glow">
                  Crafting <span className="text-gray-500">Worlds</span>
                </h1>
                <p className="text-xl text-gray-400 mb-12 max-w-xl leading-relaxed font-light">
                  Lobomotor Studio is a creative powerhouse specializing in creating strong IPs for the entertainment industry.
                </p>
                <div className="flex flex-wrap gap-6">
                  <button className="bg-[#f27d26] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#d96a1d] transition-all flex items-center gap-3 group">
                    View Portfolio
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="border border-white/20 px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                    Consulting
                  </button>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10 animate-float">
                  <img 
                    src={mascotUrl} 
                    alt="Lobomotor Mascot" 
                    className="w-full h-auto drop-shadow-[0_0_50px_rgba(242,125,38,0.3)] rounded-3xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Decorative glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#f27d26]/10 blur-[100px] -z-10 rounded-full"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Comic Spotlight Section */}
        <section className="py-24 lg:py-40 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div {...fadeIn}>
                <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Latest Release</h2>
                <h3 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase mb-8 leading-none">
                  The Embassy
                </h3>
                <div className="space-y-6 text-xl text-gray-600 mb-10 leading-relaxed font-light">
                  <p>
                    The world changed forever after a magical substance was discovered from the afterlife. Alex is a young mana scribe who is trying to survive in this new reality. Dark forces are about to strike, while a silent guardian is watching over her. To survive, Alex needs to realize her true potential and the truth about her past.
                  </p>
                  <p>
                    The Embassy comic book project has been in the works for over a decade. From short stories of the netherworld, unreal mobsters and a rugged magical protagonist by Leo Kihlman, this storyline was refined with artist Sirkku Tuomela and now the saga of The Embassy can begin.
                  </p>
                  <p>
                    This limited edition graphic novel is the first story in the larger series in this universe of magic, action and afterlife...
                  </p>
                </div>
                <div className="flex flex-col gap-6">
                  <a 
                    href="https://www.sarjakuvakauppa.fi/the-embassy-1-dark-arts.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 font-bold uppercase tracking-widest text-xs hover:text-[#f27d26] group"
                  >
                    Purchase at Sarjakuvakauppa <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {panels.map((panel, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`aspect-[3/4] rounded-2xl overflow-hidden border-4 border-black shadow-2xl relative group ${idx === 0 ? 'col-span-2 aspect-[16/9]' : ''}`}
                  >
                    <img 
                      src={panel.url} 
                      alt={panel.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <p className="text-white font-display font-bold uppercase tracking-widest text-sm">{panel.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-24 lg:py-40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="mb-24 text-center">
              <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">Expertise</h2>
              <h3 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase mb-8">Creative & Strategic</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-white/10 border border-white/10 rounded-3xl overflow-hidden">
              {services.map((service, idx) => (
                <motion.div 
                  key={idx}
                  {...fadeIn}
                  className="p-12 bg-[#050505] hover:bg-white/5 transition-colors group"
                >
                  <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#f27d26] group-hover:text-white transition-all">
                    {service.icon}
                  </div>
                  <h4 className="text-2xl font-display font-bold uppercase tracking-tight mb-4 group-hover:text-[#f27d26] transition-colors">{service.title}</h4>
                  <p className="text-gray-500 leading-relaxed font-light">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-24 lg:py-40 bg-white text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-24">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Contact</h2>
                <h3 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase mb-12">Let's Talk.</h3>
                
                <div className="space-y-10">
                  <div className="flex items-center gap-6 group cursor-pointer">
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-[#f27d26] transition-colors">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</p>
                      <p className="text-xl font-bold">leo@lobomotor.studio</p>
                    </div>
                  </div>
                  <a 
                    href="https://fi.linkedin.com/in/leokihlman" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-6 group"
                  >
                    <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-[#f27d26] transition-colors">
                      <Linkedin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">LinkedIn</p>
                      <p className="text-xl font-bold">leokihlman</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 p-12 rounded-[40px]">
                <form className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name</label>
                    <input type="text" className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Email</label>
                    <input type="email" className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg" placeholder="john@company.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</label>
                    <textarea rows={3} className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg resize-none" placeholder="Tell me about your project..."></textarea>
                  </div>
                  <button className="w-full bg-black text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#f27d26] transition-all shadow-2xl">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#050505] border-t border-white/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 overflow-hidden rounded-lg bg-white flex items-center justify-center">
                <img 
                  src={logoUrl} 
                  alt="Lobomotor Logo" 
                  className="w-full h-full object-cover scale-[2.5] translate-x-[25%]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xl font-display font-bold tracking-tighter uppercase">Lobomotor</span>
            </div>
            
            <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <a href="https://fi.linkedin.com/in/leokihlman" target="_blank" rel="noopener noreferrer" className="hover:text-[#f27d26] transition-colors">LinkedIn</a>
              <a href="#work" className="hover:text-white transition-colors">Portfolio</a>
              <a href="#services" className="hover:text-white transition-colors">Consulting</a>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600">
              © 2026 Lobomotor Studio. Leo Kihlman.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
