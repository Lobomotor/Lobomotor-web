import React from 'react';
import { sendContactMessage } from './contact.js';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Gamepad2, Linkedin, Mail, Sparkles, Users2, Zap, ExternalLink } from 'lucide-react';

function ContactForm() {
    const [formState, setFormState] = React.useState('idle'); // idle, sending, success
    const [formData, setFormData] = React.useState({ name: '', email: '', message: '', website: '' });
    const [formError, setFormError] = React.useState('');
    const lastAttempt = React.useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formState === 'sending') return;
        setFormError('');
        setFormState('sending');
        const fingerprint = JSON.stringify(formData);
        if (!lastAttempt.current || lastAttempt.current.fingerprint !== fingerprint) {
            lastAttempt.current = { fingerprint, requestId: crypto.randomUUID() };
        }
        try {
            await sendContactMessage(formData, lastAttempt.current.requestId);
            setFormState('success');
            setFormData({ name: '', email: '', message: '', website: '' });
            lastAttempt.current = null;
        } catch (error) {
            setFormError(error.message || 'Your message could not be sent. Please email leo@lobomotor.studio.');
            setFormState('idle');
        }
    };

    if (formState === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
            >
                <div className="w-20 h-20 bg-[#f27d26] text-white rounded-full flex items-center justify-center mx-auto mb-8">
                    <Sparkles className="w-10 h-10" />
                </div>
                <h4 className="text-3xl font-display font-black uppercase mb-4">Message Sent!</h4>
                <p className="text-gray-500 mb-8">Thanks for reaching out. Your message has been sent to Leo.</p>
                <button
                    onClick={() => setFormState('idle')}
                    className="text-xs font-bold uppercase tracking-widest text-[#f27d26] hover:underline"
                >
                    Send another message
                </button>
            </motion.div>
        );
    }

    return (
        <form className="space-y-8" onSubmit={handleSubmit} aria-busy={formState === 'sending'}>
            <div className="hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input id="contact-website" name="website" tabIndex={-1} autoComplete="off"
                    value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
            </div>
            <div className="space-y-2">
                <label htmlFor="contact-name" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name</label>
                <input
                    required
                    id="contact-name"
                    maxLength={100}
                    name="name"
                    type="text"
                    className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="contact-email" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Email</label>
                <input
                    required
                    id="contact-email"
                    maxLength={254}
                    name="email"
                    type="email"
                    className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="contact-message" className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</label>
                <textarea
                    required
                    id="contact-message"
                    maxLength={5000}
                    name="message"
                    rows={3}
                    className="w-full bg-transparent border-b-2 border-gray-200 py-4 focus:border-[#f27d26] transition-colors outline-none font-bold text-lg resize-none"
                    placeholder="Tell me about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
            </div>
            {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
            <button
                disabled={formState === 'sending'}
                className="w-full bg-black text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#f27d26] transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
                {formState === 'sending' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                    </>
                ) : 'Send Message'}
            </button>
        </form>
    );
}

function GameWindow({ onClose }) {
    const dialogRef = React.useRef(null);
    React.useEffect(() => {
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        dialog.showModal();
        return () => {
            dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, []);
    return (
        <dialog ref={dialogRef} className="game-window" aria-labelledby="game-window-title"
            onCancel={event => { event.preventDefault(); onClose(); }}>
            <div className="game-window-header">
                <h2 id="game-window-title">Ponganoid</h2>
                <div className="flex items-center gap-4">
                    <a href="https://ponganoid-777006893258.us-west1.run.app" target="_blank" rel="noopener noreferrer" className="text-sm underline">Open in new tab</a>
                    <button autoFocus onClick={onClose} className="rounded-full bg-[#f27d26] px-4 py-2 text-sm font-bold">Close Game</button>
                </div>
            </div>
            <iframe src="https://ponganoid-777006893258.us-west1.run.app"
                className="game-window-frame" title="Ponganoid Game" allow="autoplay; fullscreen" />
        </dialog>
    );
}

function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);

    // Team Carousel State
    const teamImages = [
        "./media/team-leo.jpg",
        "./media/team-studio-1.png",
        "./media/team-studio-2.png",
        "./media/team-presentation.jpg"
    ];
    const [currentTeamImage, setCurrentTeamImage] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTeamImage((prev) => (prev + 1) % teamImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [teamImages.length]);

    // Assets
    const mascotUrl = "./media/mascot.png";
    const logoUrl = "./media/logo.png";

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
        { url: "./media/embassy-setup.jpg", title: "The Setup" },
        { url: "./media/embassy-conflict.jpg", title: "The Conflict" },
        { url: "./media/embassy-action.jpg", title: "The Action" }
    ];

    return (
        <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-[#f27d26] selection:text-white">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <a href="#" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                            <div className="w-12 h-12 overflow-hidden rounded-xl border border-white/10 bg-black flex items-center justify-center shadow-[0_0_20px_rgba(242,125,38,0.2)]">
                                <img
                                    src={logoUrl}
                                    alt="Lobomotor Logo"
                                    className="w-full h-full object-contain p-1"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <span className="text-2xl font-display font-bold tracking-tighter uppercase">Lobomotor</span>
                        </a>

                        <div className="hidden md:flex items-center gap-10">
                            <a href="#team" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Team</a>
                            <a href="#work" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Work</a>
                            <a href="#services" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Services</a>
                            <a href="#contact" className="text-xs font-bold uppercase tracking-widest hover:text-[#f27d26] transition-colors">Contact</a>
                            <a href="#contact" className="bg-[#f27d26] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#d96a1d] transition-all">
                                Let's Talk
                            </a>
                        </div>

                        <button
                            className="md:hidden p-2"
                                    aria-label="Toggle navigation"
                                    aria-expanded={isMenuOpen}
                                    aria-controls="mobile-navigation"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-white mb-1.5"></div>
                            <div className="w-6 h-0.5 bg-white"></div>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        id="mobile-navigation"
                                className="md:hidden bg-black border-b border-white/10 px-4 py-8 space-y-6"
                    >
                        <a href="#team" className="block text-xl font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Team</a>
                        <a href="#work" className="block text-xl font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Work</a>
                        <a href="#services" className="block text-xl font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Services</a>
                        <a href="#contact" className="block text-xl font-bold uppercase tracking-widest" onClick={() => setIsMenuOpen(false)}>Contact</a>
                    </motion.div>
                )}
            </nav>

            <main className="flex-grow">
                {/* Hero Section */}
                <section id="top" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
                    {/* Background Comic Texture */}
                    <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
                        <img
                            src="./media/embassy-setup.jpg"
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
                                    <button
                                        onClick={() => setIsPlaying(true)}
                                        className="bg-[#f27d26] text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#d96a1d] transition-all flex items-center gap-3 group"
                                    >
                                        PLAY A GAME
                                        <Gamepad2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="relative hidden lg:block"
                            >
                                <div className="relative z-10">
                                        <div className="animate-float">
                                            <img
                                                src={mascotUrl}
                                                alt="Lobomotor Mascot"
                                                className="w-full h-auto drop-shadow-[0_0_50px_rgba(242,125,38,0.3)] rounded-3xl"
                                                referrerPolicy="no-referrer"
                                            />
                                        </div>
                                </div>
                                {/* Decorative glow */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#f27d26]/10 blur-[100px] -z-10 rounded-full"></div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Team Section */}
                <section id="team" className="py-24 lg:py-40 relative overflow-hidden bg-[#0a0a0a]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                {...fadeIn}
                                className="relative"
                            >
                                <div className="relative aspect-square rounded-[40px] overflow-hidden border-8 border-white/5 shadow-2xl bg-black">
                                    <AnimatePresence mode="wait">
                                        <motion.img
                                            key={currentTeamImage}
                                            src={teamImages[currentTeamImage]}
                                            alt="Leo Kihlman"
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.8 }}
                                            className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                                            referrerPolicy="no-referrer"
                                        />
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
                                    <div className="absolute bottom-8 left-8 pointer-events-none">
                                        <p className="text-[#f27d26] font-display font-black uppercase text-4xl tracking-tighter leading-none">Leo Kihlman</p>
                                        <p className="text-white/60 font-bold uppercase tracking-[0.2em] text-xs mt-2">FOUNDER & creative madman</p>
                                    </div>
                                    {/* Carousel Indicators */}
                                    <div className="absolute bottom-8 right-8 flex gap-2">
                                        {teamImages.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentTeamImage ? 'bg-[#f27d26] w-6' : 'bg-white/30'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#f27d26]/20 blur-[100px] rounded-full"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#f27d26]/20 blur-[100px] rounded-full"></div>
                            </motion.div>

                            <motion.div {...fadeIn}>
                                <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">The Team</h2>
                                <h3 className="text-5xl lg:text-7xl font-display font-black tracking-tighter uppercase mb-8 leading-none">
                                    Meet <span className="text-[#f27d26]">Papa Leo</span>
                                </h3>
                                <div className="space-y-6 text-xl text-gray-400 mb-10 leading-relaxed font-light italic">
                                    <p>
                                        "Hi, the main man here. I have been working in game industry for 27 years now and have seen it all. From the early days of Finnish games industry with PC and N-Gage to mobile F2P and now experiencing the latest AI disruption."
                                    </p>
                                    <p className="not-italic">
                                        I started out as a 3D artist and game designer in the '90s and for the last 10+ years been leading and guiding game teams and studios around the world. Lobomotor Studio has been my outlet of creating entertainment with no compromises. The Embassy-comic book being the first big achievement on my bucket list and now looking to make my first indie-game.
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="h-px flex-grow bg-white/10"></div>
                                    <div className="flex gap-4">
                                        <a href="https://fi.linkedin.com/in/leokihlman" aria-label="Leo Kihlman on LinkedIn" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-[#f27d26] hover:border-[#f27d26] transition-all">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Comic Spotlight Section */}
                <section id="work" className="py-24 lg:py-40 bg-white text-black">
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
                                        We started work on this comic book in 2013 with Artist Sirkku Tuomela based on my earlier novel. Together we refined the screenplay and then Sirkku drew the pages through the years. We published the comic book in 2024 and it was present at the first Comic Con in Finland where we got great feedback and new fans. Thank you for that!
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
                                    <a href="mailto:leo@lobomotor.studio" className="flex items-center gap-6 group cursor-pointer">
                                        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-[#f27d26] transition-colors">
                                            <Mail className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</p>
                                            <p className="text-xl font-bold">leo@lobomotor.studio</p>
                                        </div>
                                    </a>
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
                                <ContactForm />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {isPlaying && <GameWindow onClose={() => setIsPlaying(false)} />}

            {/* Footer */}
            <footer className="bg-[#050505] border-t border-white/10 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                        <a href="#" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 overflow-hidden rounded-lg bg-white flex items-center justify-center">
                                <img
                                    src={logoUrl}
                                    alt="Lobomotor Logo"
                                    className="w-full h-full object-contain p-1"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <span className="text-xl font-display font-bold tracking-tighter uppercase">Lobomotor</span>
                        </a>

                        <div className="flex gap-12 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                            <a href="https://fi.linkedin.com/in/leokihlman" aria-label="Leo Kihlman on LinkedIn" target="_blank" rel="noopener noreferrer" className="hover:text-[#f27d26] transition-colors">LinkedIn</a>
                            <a href="#team" className="hover:text-white transition-colors">Team</a>
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


createRoot(document.getElementById('root')).render(<App />);
