import { useState, useMemo, memo, useEffect } from "react";
import { submitContactEnquiry } from "./services/api.js";
import adminApi from "./services/adminApi.js";
import {
  ArrowRight,
  ArrowUpRight,
  Menu,
  X,
  Search,
  PenTool,
  UserRound,
  Target,
  BarChart3,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  Play,
  Send,
  Clock,
  ChevronRight,
  Layers,
} from "lucide-react";

/* Custom Brand SVG Icons (Matches Lucide interface without missing export errors) */
const Instagram = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Linkedin = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Youtube = ({ size = 18, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" />
  </svg>
);

const services = [
  {
    number: "01",
    title: "SEO Services",
    description:
      "Improve Google rankings, organic visibility, and website traffic with strategic SEO.",
    icon: Search,
    tag: "Organic Growth",
  },
  {
    number: "02",
    title: "Content Creation",
    description:
      "Create engaging social media content, reels, videos, and creative brand assets.",
    icon: PenTool,
    tag: "Creative Content",
  },
  {
    number: "03",
    title: "Personal Branding",
    description:
      "Build a strong personal identity and establish authority across digital platforms.",
    icon: UserRound,
    tag: "Brand Identity",
  },
  {
    number: "04",
    title: "Meta Ads",
    description:
      "Generate leads and reach your ideal audience through Facebook and Instagram advertising.",
    icon: Target,
    tag: "Paid Advertising",
  },
  {
    number: "05",
    title: "Google Ads",
    description:
      "Reach high-intent customers through targeted Google Search and display campaigns.",
    icon: BarChart3,
    tag: "Performance Ads",
  },
  {
    number: "06",
    title: "Social Media Marketing",
    description:
      "Build brand awareness, audience engagement, and consistent social media growth.",
    icon: TrendingUp,
    tag: "Social Growth",
  },
];

const benefits = [
  {
    icon: Target,
    title: "Strategy-Driven Marketing",
    description: "Every campaign starts with a clear strategy.",
  },
  {
    icon: Sparkles,
    title: "Creative Excellence",
    description: "Engaging content that captures attention.",
  },
  {
    icon: BarChart3,
    title: "Data-Driven Decisions",
    description: "Marketing decisions backed by performance insights.",
  },
  {
    icon: TrendingUp,
    title: "Growth-Focused Approach",
    description: "Focus on visibility, leads, and business growth.",
  },
];

const categories = [
  "All Projects",
  "SEO Projects",
  "Content Creation",
  "Personal Branding",
  "Meta Ads Campaigns",
  "Google Ads Campaigns",
  "Social Media Projects",
];

const projects = [
  {
    title: "E-Commerce SEO Transformation",
    category: "SEO Projects",
    type: "Search Engine Optimization",
    metric: "+312% Organic Traffic",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=75",
  },
  {
    title: "Viral Reels Framework",
    category: "Content Creation",
    type: "Short-Form Video Production",
    metric: "50K+ Views / Reel",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766?w=600&auto=format&fit=crop&q=75",
  },
  {
    title: "Founder Authority Branding",
    category: "Personal Branding",
    type: "Executive Leadership",
    metric: "+8,500 Followers",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&auto=format&fit=crop&q=75",
  },
  {
    title: "Real Estate Meta Ads Funnel",
    category: "Meta Ads Campaigns",
    type: "Paid Lead Generation",
    metric: "₹85 Cost Per Lead",
    image:
      "https://images.unsplash.com/photo-1557838923-2985c318be48?w=600&auto=format&fit=crop&q=75",
  },
  {
    title: "EdTech Google Search Scaling",
    category: "Google Ads Campaigns",
    type: "Search Intent Ads",
    metric: "4.2x ROAS",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=75",
  },
  {
    title: "D2C Community Growth",
    category: "Social Media Projects",
    type: "Community Management",
    metric: "0 to 15K Community",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&auto=format&fit=crop&q=75",
  },
];

const heroSlides = [
  {
    title: "Strategy First",
    subtitle: "High-ROI Digital Growth",
    icon: Sparkles,
    image: "/mirax-logo.jpg",
    alt: "Mirax Media Official Logo",
  },
  {
    title: "Meta & Google Ads",
    subtitle: "4.2x Average ROAS",
    icon: Target,
    image: "/mirax-logo.jpg",
    alt: "Mirax Media Performance Growth",
  },
  {
    title: "Viral Content Studio",
    subtitle: "50K+ Organic Reach",
    icon: TrendingUp,
    image: "/mirax-logo.jpg",
    alt: "Mirax Media Creative Studio",
  },
];

const ContactSection = memo(function ContactSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submittedData, setSubmittedData] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "SEO Services",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await submitContactEnquiry(formData);
      setSubmittedData(response.data || null);
      setFormSubmitted(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        service: "SEO Services",
        message: "",
      });
    } catch (err) {
      setSubmitError(
        err.message || "Failed to submit enquiry. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding content-visibility-auto" id="contact">
      <div className="container">
        <div className="glass-panel">
          <div className="contact-glass-grid">
            {/* Contact Info */}
            <div className="contact-info-card">
              <div>
                <div className="eyebrow" style={{ marginBottom: "12px" }}>
                  <span className="eyebrow-dot" />
                  GET IN TOUCH
                </div>
                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 36px)", marginBottom: "12px" }}>
                  Let&apos;s Build Something{" "}
                  <span className="gradient-glass-text">Great Together</span>
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.7" }}>
                  Tell us about your brand and growth objectives. Our strategy
                  team will review your enquiry and respond within 24 hours.
                </p>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">
                  <Mail size={18} />
                </div>
                <div className="contact-item-info">
                  <span>Email Address</span>
                  <a href="mailto:miraxcontact@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <strong>miraxcontact@gmail.com</strong>
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">
                  <Phone size={18} />
                </div>
                <div className="contact-item-info">
                  <span>Phone Number</span>
                  <a href="tel:+917200405822" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <strong>+91 7200405822</strong>
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">
                  <MapPin size={18} />
                </div>
                <div className="contact-item-info">
                  <span>Headquarters &amp; Service</span>
                  <strong>India (Pan-India &amp; Global)</strong>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-item-icon">
                  <Clock size={18} />
                </div>
                <div className="contact-item-info">
                  <span>Working Hours</span>
                  <strong>Mon &ndash; Sat (9:00 AM &ndash; 7:00 PM IST)</strong>
                </div>
              </div>
            </div>

            {/* Frosted Glass Contact Form */}
            <div className="glass-card" style={{ padding: "32px" }}>
              {formSubmitted ? (
                <div style={{ textAlign: "center", padding: "40px 10px" }}>
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      color: "#34d399",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 18px",
                    }}
                  >
                    <CheckCircle2 size={30} />
                  </div>
                  <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>
                    Enquiry Submitted Successfully!
                  </h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "16px" }}>
                    Thank you for contacting Mirax Media. Your enquiry has been securely saved to our database, and a confirmation email has been dispatched.
                  </p>
                  {submittedData?.id && (
                    <div
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        background: "rgba(139, 61, 255, 0.15)",
                        border: "1px solid rgba(182, 107, 255, 0.3)",
                        color: "#d6a5ff",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        marginBottom: "24px",
                      }}
                    >
                      Enquiry ID: {submittedData.id}
                    </div>
                  )}
                  <div>
                    <button
                      type="button"
                      className="glass-btn-secondary"
                      onClick={() => {
                        setFormSubmitted(false);
                        setSubmittedData(null);
                      }}
                    >
                      Send Another Enquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form className="glass-form" onSubmit={handleSubmit}>
                  {submitError && (
                    <div
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        color: "#fca5a5",
                        fontSize: "13px",
                        lineHeight: "1.5",
                        marginBottom: "16px",
                      }}
                    >
                      <strong>Submission Notice:</strong> {submitError}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        className="glass-input"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="glass-input"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 7200405822"
                        className="glass-input"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="form-group">
                      <label>Service Required *</label>
                      <select
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="glass-input"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="SEO Services">SEO Services</option>
                        <option value="Content Creation">Content Creation</option>
                        <option value="Personal Branding">Personal Branding</option>
                        <option value="Meta Ads">Meta Ads</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Social Media Marketing">Social Media Marketing</option>
                        <option value="Other">Other Digital Marketing</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Project Details &amp; Goals *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your brand, current challenges, and growth goals..."
                      className="glass-input"
                      rows={4}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <button
                    type="submit"
                    className="glass-btn-primary"
                    style={{
                      marginTop: "10px",
                      justifyContent: "center",
                      opacity: isSubmitting ? 0.7 : 1,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                    disabled={isSubmitting}
                  >
                    <span>
                      {isSubmitting ? "Submitting Enquiry..." : "Submit Your Enquiry"}
                    </span>
                    <Send size={15} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Projects");
  const [currentSlide, setCurrentSlide] = useState(0);

  const navigation = [
    { label: "Home", number: "01", href: "#home" },
    { label: "About Us", number: "02", href: "#about" },
    { label: "Our Services", number: "03", href: "#services" },
    { label: "Our Works", number: "04", href: "#works" },
    { label: "Contact Us", number: "05", href: "#contact" },
  ];

  const filteredProjects = useMemo(
    () =>
      activeCategory === "All Projects"
        ? projects
        : projects.filter((project) => project.category === activeCategory),
    [activeCategory]
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="app-wrapper">
      {/* Dynamic Background Light Orbs for Frosted Glass Refraction */}
      <div className="ambient-bg">
        <div className="ambient-orb orb-purple" />
        <div className="ambient-orb orb-magenta" />
        <div className="ambient-orb orb-indigo" />
        <div className="bg-subtle-grid" />
      </div>

      {/* =========================================================
          HERO SECTION: FLOATING FROSTED GLASS STAGE (IMAGE SPEC)
      ========================================================= */}
      <section className="glass-stage-wrapper" id="home">
        <div className="container">
          <div className="glass-stage">
            {/* Integrated Top Glass Nav */}
            <header className="glass-nav">
              <a href="#home" className="brand" onClick={closeMenu}>
                <img
                  src="/mirax-logo.jpg"
                  alt="Mirax Media Logo"
                  className="brand-mark-img"
                />
                <span className="brand-name">
                  MIRAX <span>MEDIA</span>
                </span>
              </a>

              <nav className="glass-nav-links">
                {navigation.map((item) => (
                  <a
                    href={item.href}
                    key={item.number}
                    className="glass-nav-link"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              <div className="glass-nav-right">
                <a href="#contact" className="glass-nav-cta">
                  <span>Let&apos;s Talk</span>
                  <ArrowUpRight size={14} />
                </a>
                <button
                  className="menu-toggle-btn"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Toggle navigation"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </header>

            {/* Mobile Navigation Drawer */}
            {menuOpen && (
              <div className="mobile-menu-drawer">
                {navigation.map((item) => (
                  <a
                    key={item.number}
                    href={item.href}
                    onClick={closeMenu}
                    className="glass-nav-link"
                  >
                    <span style={{ color: "#b66bff", marginRight: "8px" }}>
                      {item.number}
                    </span>
                    {item.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="glass-btn-primary"
                  onClick={closeMenu}
                  style={{ marginTop: "10px", justifyContent: "center" }}
                >
                  Let&apos;s Talk <ArrowUpRight size={15} />
                </a>
              </div>
            )}

            {/* Hero 2-Column Stage Content */}
            <div className="glass-stage-content">
              {/* Left Column */}
              <div className="glass-hero-left">
                <div className="eyebrow">
                  <span className="eyebrow-dot" />
                  DIGITAL MARKETING &amp; GROWTH AGENCY
                </div>

                <h1>
                  Where Strategy meets{" "}
                  <span className="gradient-glass-text">Digital Growth.</span>
                </h1>

                <p className="glass-hero-desc">
                  Mirax Media is a results-driven digital marketing agency helping
                  businesses build a strong online presence through SEO, creative
                  content creation, personal branding, Meta Ads, Google Ads, and
                  social media marketing. We combine creativity, strategy, and
                  data-driven marketing to turn your digital presence into
                  measurable business growth.
                </p>

                <div className="glass-hero-actions">
                  <a href="#services" className="glass-btn-primary">
                    <span>Explore Our Services</span>
                    <ArrowRight size={16} />
                  </a>
                  <a href="#contact" className="glass-btn-secondary">
                    <span>Let&apos;s Grow Your Business</span>
                  </a>
                </div>

                {/* Bottom Floating Mini Cards (Matching Reference Image) */}
                <div className="glass-starters-wrap">
                  <span className="glass-starters-label">
                    Featured Capabilities
                  </span>
                  <div className="glass-starters-grid">
                    <div className="glass-mini-card">
                      <div className="mini-card-icon icon-emerald">
                        <Search size={16} />
                      </div>
                      <div className="mini-card-info">
                        <strong>SEO Growth</strong>
                        <span>+312% Traffic</span>
                      </div>
                    </div>

                    <div className="glass-mini-card">
                      <div className="mini-card-icon icon-purple">
                        <Target size={16} />
                      </div>
                      <div className="mini-card-info">
                        <strong>Meta Ads</strong>
                        <span>4.2x ROAS</span>
                      </div>
                    </div>

                    <div className="glass-mini-card">
                      <div className="mini-card-icon icon-pink">
                        <Play size={16} />
                      </div>
                      <div className="mini-card-info">
                        <strong>Viral Video</strong>
                        <span>50K+ Views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Circular Showcase with Glowing Crescent & Orbit */}
              <div className="glass-orbit-stage">
                {/* Concentric orbital circles */}
                <div className="orbit-ring orbit-ring-outer" />
                <div className="orbit-ring orbit-ring-inner" />

                {/* Vibrant glowing purple/magenta crescent arc */}
                <div className="orbit-crescent-arc" />

                {/* Center circular dish with creative marketing specialists */}
                {(() => {
                  const activeSlide = heroSlides[currentSlide] || heroSlides[0];
                  const SlideIcon = activeSlide.icon;
                  return (
                    <>
                      <div className="orbit-center-dish">
                        <img
                          src={activeSlide.image}
                          alt={activeSlide.alt}
                          className="orbit-dish-image"
                          decoding="async"
                          width="380"
                          height="380"
                        />
                        <div className="dish-inner-shadow" />
                      </div>

                      {/* Floating satellite orbiter badge (top-left of circle) */}
                      <div className="orbit-satellite-badge">
                        <span className="satellite-icon">
                          <SlideIcon size={14} />
                        </span>
                        <div className="satellite-text">
                          <strong>{activeSlide.title}</strong>
                          <span>{activeSlide.subtitle}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          ABOUT SECTION: FROSTED GLASS PANEL
      ========================================================= */}
      <section className="section-padding content-visibility-auto" id="about">
        <div className="container">
          <div className="glass-panel">
            <div className="about-glass-layout">
              {/* Image visual with floating glass badge */}
              <div className="about-image-stage">
                <img
                  src="/images/hero-team.png"
                  alt="Mirax Media Strategy Team"
                  loading="lazy"
                  decoding="async"
                />
                <div className="about-glass-float">
                  <div className="mini-card-icon icon-purple">
                    <Layers size={18} />
                  </div>
                  <div>
                    <strong>Integrated Growth Partnership</strong>
                    <span>From SEO &amp; Ads to High-Retention Content</span>
                  </div>
                </div>
              </div>

              {/* Narrative Content matching requirements */}
              <div className="about-content-box">
                <div className="eyebrow" style={{ marginBottom: "14px" }}>
                  <span className="eyebrow-dot" />
                  ABOUT MIRAX MEDIA
                </div>

                <h2 style={{ fontSize: "clamp(26px, 3.2vw, 38px)", marginBottom: "18px" }}>
                  Who We Are – Your Partner in{" "}
                  <span className="gradient-glass-text">Digital Growth</span>
                </h2>

                <div className="about-paragraphs">
                  <p>
                    Mirax Media is a digital marketing agency focused on helping
                    businesses grow, connect with their target audience, and build
                    a powerful online presence.
                  </p>
                  <p>
                    From search engine optimization and content creation to personal
                    branding and paid advertising, we provide strategic digital
                    marketing solutions designed to support business growth.
                  </p>
                  <p>
                    Our approach combines creativity, technology, and
                    performance-driven strategies to help brands stand out in a
                    competitive digital landscape.
                  </p>
                </div>

                <a href="#contact" className="glass-btn-primary">
                  <span>Know More About Us</span>
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OUR SERVICES SECTION: 6 FROSTED GLASS CARDS
      ========================================================= */}
      <section className="section-padding content-visibility-auto" id="services">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              OUR SERVICES
            </div>
            <h2>
              Digital Marketing Services That Drive{" "}
              <span className="gradient-glass-text">Growth</span>
            </h2>
            <p>
              We offer comprehensive digital marketing services to help businesses
              increase visibility, attract potential customers, build brand authority,
              and achieve sustainable growth.
            </p>
          </div>

          <div className="services-glass-grid">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="glass-card service-glass-card" key={service.number}>
                  <div>
                    <div className="service-top-bar">
                      <div className="service-icon-box">
                        <Icon size={20} />
                      </div>
                      <span className="service-number-badge">{service.number}</span>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        color: "#b66bff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      {service.tag}
                    </span>

                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <a href="#contact" className="card-footer">
                    <span>Enquire About Service</span>
                    <ArrowUpRight size={15} />
                  </a>
                </article>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <a href="#contact" className="glass-btn-secondary">
              <span>View All Services</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY CHOOSE MIRAX MEDIA: 4 GLASS ICON CARDS
      ========================================================= */}
      <section className="section-padding content-visibility-auto" id="why">
        <div className="container">
          <div className="glass-panel">
            <div className="section-heading centered" style={{ marginBottom: "36px" }}>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                WHY MIRAX MEDIA
              </div>
              <h2>
                Why Businesses Choose{" "}
                <span className="gradient-glass-text">Mirax Media</span>
              </h2>
              <p>
                Every campaign is built upon four foundational agency pillars
                dedicated to turning attention into measurable business revenue.
              </p>
            </div>

            <div className="why-glass-grid">
              {benefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <div className="glass-card why-glass-card" key={b.title}>
                    <div className="why-icon-box">
                      <Icon size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#b66bff",
                        fontWeight: 700,
                        display: "block",
                        marginBottom: "6px",
                      }}
                    >
                      PILLAR 0{i + 1}
                    </span>
                    <h3>{b.title}</h3>
                    <p>{b.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          OUR WORKS: FILTERABLE FROSTED PORTFOLIO SHOWCASE
      ========================================================= */}
      <section className="section-padding content-visibility-auto" id="works">
        <div className="container">
          <div className="section-heading centered">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              OUR WORKS &amp; RESULTS
            </div>
            <h2>
              Our Work Speaks for Our{" "}
              <span className="gradient-glass-text">Strategy</span>
            </h2>
            <p>
              Explore our creative projects, digital marketing campaigns, social media
              content, and brand growth initiatives.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`glass-filter-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Works Grid */}
          <div className="works-glass-grid">
            {filteredProjects.map((p) => (
              <article className="glass-card work-glass-card" key={p.title}>
                <div className="work-img-wrap">
                  <img
                    src={p.image}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    width="400"
                    height="240"
                  />
                  <span className="work-badge">{p.metric}</span>
                </div>
                <div className="work-content-box">
                  <span className="work-category-tag">{p.category}</span>
                  <h3>{p.title}</h3>
                  <a
                    href="#contact"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      marginTop: "12px",
                      color: "#b66bff",
                      fontSize: "12px",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    <span>Discuss Similar Project</span>
                    <ArrowUpRight size={14} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CALL TO ACTION: GLASS BANNER
      ========================================================= */}
      <section className="section-padding content-visibility-auto">
        <div className="container">
          <div className="glass-cta-card">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              YOUR NEXT CHAPTER STARTS HERE
            </div>
            <h2>
              Ready to Grow Your Business{" "}
              <span className="gradient-glass-text">Online?</span>
            </h2>
            <p>
              Let&apos;s build a stronger digital presence for your brand with the right
              strategy, creative content, and performance marketing.
            </p>
            <a href="#contact" className="glass-btn-primary">
              <span>Get a Free Consultation</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================
          CONTACT US SECTION: ISOLATED MEMOIZED COMPONENT
      ========================================================= */}
      <ContactSection />

      {/* =========================================================
          FOOTER: FROSTED GLASS FOOTER
      ========================================================= */}
      <footer className="glass-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <a href="#home" className="brand" style={{ marginBottom: "14px" }}>
                <img
                  src="/mirax-logo.jpg"
                  alt="Mirax Media Logo"
                  className="brand-mark-img"
                />
                <span className="brand-name">
                  MIRAX <span>MEDIA</span>
                </span>
              </a>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", lineHeight: "1.7", maxWidth: "300px" }}>
                Results-driven digital marketing agency helping ambitious brands turn
                attention into measurable commercial growth.
              </p>
              <div className="social-links">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="social-link-btn"
                >
                  <Instagram size={17} />
                </a>
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="social-link-btn"
                >
                  <Linkedin size={17} />
                </a>
                <a
                  href="https://www.youtube.com/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="social-link-btn"
                >
                  <Youtube size={17} />
                </a>
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Navigation</h4>
              <ul>
                {navigation.map((item) => (
                  <li key={item.number}>
                    <a href={item.href}>{item.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Our Services</h4>
              <ul>
                {services.map((s) => (
                  <li key={s.number}>
                    <a href="#services">{s.title}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Direct Contact</h4>
              <ul>
                <li>
                  <a href="mailto:miraxcontact@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                    miraxcontact@gmail.com
                  </a>
                </li>
                <li>
                  <a href="tel:+917200405822" style={{ color: 'inherit', textDecoration: 'none' }}>
                    +91 7200405822
                  </a>
                </li>
                <li>India (Pan-India &amp; Global)</li>
                <li>Mon &ndash; Sat (9:00 AM &ndash; 7:00 PM IST)</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} MIRAX MEDIA. All rights reserved.</span>
            <span>
              Crafted with Premium Frosted Glassmorphism • <a href="/admin" style={{ color: "#b66bff", textDecoration: "none", fontWeight: 500 }}>Admin Portal</a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
