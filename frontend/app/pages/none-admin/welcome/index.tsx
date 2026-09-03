import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import {
  Menu,
  X,
  GraduationCap,
  Users,
  Award,
  Star,
  Target,
  Eye,
  FlaskConical,
  Cpu,
  Trophy,
  Palette,
  Languages,
  FileText,
  CreditCard,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { fetchPublicSettings, type PublicOrganizationSettings } from "../../../services/settingsService";
import { submitPublicInquiry } from "../../../services/inquiryService";

const FALLBACK_ORG_NAME = "University of Puthisastra";
const FALLBACK_SLOGAN = "Shaping Minds. Building Futures.";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Academics", href: "#academics" },
  { label: "Admissions", href: "#admissions" },
  { label: "Contact", href: "#contact" },
];

const STATS = [
  { icon: <GraduationCap size={22} />, value: "25+", label: "Years of Excellence" },
  { icon: <Users size={22} />, value: "1500+", label: "Students Enrolled" },
  { icon: <Award size={22} />, value: "120+", label: "Expert Teachers" },
  { icon: <Star size={22} />, value: "98%", label: "Parent Satisfaction" },
];

const PROGRAMS = [
  { icon: <FlaskConical size={22} />, title: "Science Program", desc: "Building critical thinking and problem-solving through hands-on inquiry.", color: "bg-blue-50 text-blue-600" },
  { icon: <Cpu size={22} />, title: "Technology Program", desc: "Hands-on learning in computing, coding, and engineering fundamentals.", color: "bg-orange-50 text-orange-600" },
  { icon: <Trophy size={22} />, title: "Sports Program", desc: "Encouraging physical fitness, teamwork, and leadership on the field.", color: "bg-emerald-50 text-emerald-600" },
  { icon: <Palette size={22} />, title: "Arts Program", desc: "Nurturing creativity and expression through visual and performing arts.", color: "bg-pink-50 text-pink-600" },
  { icon: <Languages size={22} />, title: "Language Program", desc: "Building strong communication skills and global language fluency.", color: "bg-purple-50 text-purple-600" },
];

const ADMISSION_STEPS = [
  { icon: <FileText size={20} />, title: "1. Apply Online", desc: "Fill out our short application form — no office visit required." },
  { icon: <CheckCircle2 size={20} />, title: "2. Submit Documents", desc: "Log in to your new student portal and upload documents for review." },
  { icon: <CreditCard size={20} />, title: "3. Pay & Get Enrolled", desc: "Pay your fees online and get confirmed once admissions approves you." },
];

export default function WelcomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState<PublicOrganizationSettings | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  useEffect(() => {
    fetchPublicSettings()
      .then(setSettings)
      .catch(() => setSettings(null));
  }, []);

  const orgName = settings?.orgName && settings.orgName !== "My School" ? settings.orgName : FALLBACK_ORG_NAME;
  const slogan = settings?.slogan || FALLBACK_SLOGAN;
  const contactEmail = settings?.primaryEmail || "admissions@school.edu";
  const contactPhone = settings?.supportPhone || "+1 (555) 010-2000";
  const address = [settings?.streetAddress, settings?.city, settings?.country].filter(Boolean).join(", ") || "Campus address on request";

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setContactStatus("submitting");
    try {
      await submitPublicInquiry(contactForm);
      setContactStatus("sent");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setContactStatus("error");
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-800">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#home" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">{orgName}</span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm font-medium text-slate-600 hover:text-blue-600">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600">
              Log In
            </Link>
            <Link
              to="/apply"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Apply Now
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="text-slate-700 lg:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <nav className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="text-sm font-medium text-slate-700">
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Link to="/login" className="text-sm font-semibold text-slate-700">Log In</Link>
                <Link to="/apply" className="rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white">
                  Apply Now
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-24">
          <div>
            <p className="mb-3 text-sm font-bold uppercase tracking-widest text-blue-600">{slogan}</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              For A Better <span className="text-blue-600">Tomorrow</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 sm:text-lg">
              Empowering students with knowledge, values, and skills to become responsible global citizens —
              and now, apply, track your admission, and manage everything online.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/apply"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
              >
                Apply Now →
              </Link>
              <Link
                to="/login"
                className="rounded-md border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
              >
                Student Portal Log In
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/up-image.png"
              alt={orgName}
              className="h-72 w-full rounded-2xl object-cover shadow-xl sm:h-96"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-blue-100 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  {stat.icon}
                </span>
                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">About Us</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">Our Mission &amp; Vision</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
              <Target size={20} />
            </span>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Our Mission</h3>
            <p className="text-sm text-slate-600">
              To provide a nurturing and inclusive environment that encourages academic excellence, creativity, and
              character development to prepare students for a successful future.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
              <Eye size={20} />
            </span>
            <h3 className="mb-2 text-xl font-bold text-slate-900">Our Vision</h3>
            <p className="text-sm text-slate-600">
              To be a leading institution recognized for delivering quality education and inspiring students to
              achieve their full potential and make a positive impact on the world.
            </p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="academics" className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Academics</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900">Programs We Offer</p>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
              A wide range of academic and co-curricular programs designed to bring out the best in every student.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PROGRAMS.map((program) => (
              <div key={program.title} className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md">
                <span className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${program.color}`}>
                  {program.icon}
                </span>
                <h3 className="mb-1 text-base font-bold text-slate-900">{program.title}</h3>
                <p className="text-xs text-slate-500">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admissions CTA */}
      <section id="admissions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Admissions</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">Enrolling Made Easy</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
            Apply online in minutes. As soon as you apply, we set up your Student Portal so you can track your
            application, submit documents, and pay fees — all in one place.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {ADMISSION_STEPS.map((step) => (
            <div key={step.title} className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
              <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                {step.icon}
              </span>
              <h3 className="mb-1 text-sm font-bold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/apply" className="rounded-md bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            Start Your Application →
          </Link>
        </div>
      </section>

      {/* Already a student callout */}
      <section className="bg-blue-600">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center sm:px-6 lg:flex-row lg:text-left lg:px-8">
          <div>
            <h3 className="text-lg font-bold text-white">Already applied or enrolled?</h3>
            <p className="text-sm text-blue-100">Use your Student Portal to submit documents, pay fees online, and message us anytime.</p>
          </div>
          <Link to="/login" className="whitespace-nowrap rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-50">
            Go to Student Portal
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600">Contact</h2>
          <p className="mt-2 text-3xl font-bold text-slate-900">Have a Question?</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
            Send us a message and our admissions team will get back to you.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Email</p>
                <p className="text-sm text-slate-500">{contactEmail}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Phone</p>
                <p className="text-sm text-slate-500">{contactPhone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">Address</p>
                <p className="text-sm text-slate-500">{address}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 lg:col-span-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                required
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
              <input
                required
                type="email"
                placeholder="Your email"
                value={contactForm.email}
                onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
              />
            </div>
            <input
              required
              placeholder="Subject"
              value={contactForm.subject}
              onChange={(e) => setContactForm((f) => ({ ...f, subject: e.target.value }))}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            />
            <textarea
              required
              rows={4}
              placeholder="How can we help?"
              value={contactForm.message}
              onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
              className="w-full rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm focus:border-blue-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={contactStatus === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageSquare size={16} />
              {contactStatus === "submitting" ? "Sending…" : "Send Message"}
            </button>
            {contactStatus === "sent" && (
              <p className="text-sm font-medium text-emerald-600">Thanks! We'll be in touch soon.</p>
            )}
            {contactStatus === "error" && (
              <p className="text-sm font-medium text-red-600">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-slate-900 py-10 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <GraduationCap size={18} />
            </span>
            <span className="text-sm font-bold text-white">{orgName}</span>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} {orgName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
