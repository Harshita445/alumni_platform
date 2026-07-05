import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  FileText,
  GraduationCap,
  MessageCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  Users,
  UsersRound,
} from "lucide-react";

const features = [
  {
    Icon: MessageCircle,
    title: "1:1 Mentorship",
    description:
      "Book focused conversations with alumni who understand your exact path.",
  },
  {
    Icon: FileText,
    title: "Resume Reviews",
    description:
      "Get precise feedback on projects, experience, and role-specific positioning.",
  },
  {
    Icon: Users,
    title: "Mock Interviews",
    description:
      "Practice technical and behavioral rounds before the real placement season.",
  },
  {
    Icon: Calendar,
    title: "Career Guidance",
    description:
      "Plan internships, higher studies, and career moves with clearer context.",
  },
];

const audiences = [
  {
    Icon: GraduationCap,
    title: "Join as a student",
    description:
      "Create your student profile, connect with alumni, and request mentorship or guidance.",
    cta: "Join as student",
    href: "/register/student",
  },
  {
    Icon: UserRoundCheck,
    title: "Join as an alumni",
    description:
      "Create your alumni profile, guide students, and strengthen the Thapar network.",
    cta: "Join as alumni",
    href: "/register/alumni",
  },
];

const testimonials = [
  {
    name: "Aarav Mehta",
    meta: "CSE, 3rd year",
    quote:
      "The advice felt specific to Thapar placements, not generic career content.",
  },
  {
    name: "Nandini Rao",
    meta: "ECE, final year",
    quote:
      "My mentor helped me turn scattered project work into a confident interview story.",
  },
  {
    name: "Kabir Singh",
    meta: "Mechanical, 2nd year",
    quote:
      "It made internships feel less confusing because I could ask someone who had done it.",
  },
];

export default function HomePage() {
  return (
    <main className="landing-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-pill">
            <UsersRound size={16} strokeWidth={2.4} aria-hidden="true" />
            Built for students. Powered by alumni.
          </div>

          <h1>Connect with alumni who have walked your path.</h1>

          <p className="hero-description">
            Get career guidance, resume reviews, mock interviews, and
            mentorship from professionals who once studied at Thapar.
          </p>

          <div className="hero-trust-line">
            <ShieldCheck size={17} strokeWidth={2.2} aria-hidden="true" />
            Built exclusively for the Thapar community.
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" href="/search">
              Explore alumni
            </Link>

            <Link className="btn btn-secondary" href="/register/alumni">
              Join as an alumni
            </Link>
          </div>
        </div>

        <div className="hero-media">
          <div className="decor decor-dots hero-dots" aria-hidden="true" />
          <div className="decor hero-glow" aria-hidden="true" />

          <img
            src="/thapar-campus-hero.jpg"
            alt="Thapar campus red residence building"
          />

          <div className="hero-testimonial">
            <Quote size={18} strokeWidth={2.1} aria-hidden="true" />
            <p>
              Speaking to alumni helped me navigate placements with confidence.
            </p>
            <span>- CSE Student</span>
          </div>
        </div>
      </section>

      <section className="landing-section features-section">
        <div className="section-heading">
          <span className="section-kicker">
            <Sparkles size={15} strokeWidth={2.2} aria-hidden="true" />
            Guidance that compounds
          </span>
          <h2>Everything you need to grow</h2>
          <p>
            Learn directly from alumni who have already navigated internships,
            placements, higher studies, and industry careers.
          </p>
        </div>

        <div className="feature-card-grid">
          {features.map(({ Icon, title, description }) => (
            <article className="feature-card" key={title}>
              <div className="icon-badge">
                <Icon size={23} strokeWidth={2.1} aria-hidden="true" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section audience-section">
        <div className="section-heading">
          <h2>Built for every stage of your journey</h2>
          <p>Whether you&apos;re seeking guidance or giving back.</p>
        </div>

        <div className="audience-grid">
          {audiences.map(({ Icon, title, description, cta, href }) => (
            <article className="audience-card" key={title}>
              <div className="audience-icon">
                <Icon size={30} strokeWidth={1.9} aria-hidden="true" />
              </div>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <Link href={href}>
                {cta}
                <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section proof-section">
        <div className="decor proof-line" aria-hidden="true" />
        <div className="section-heading">
          <h2>Why students trust Alumly</h2>
        </div>

        <div className="testimonial-grid">
          {testimonials.map(({ name, meta, quote }) => (
            <article className="testimonial-card" key={name}>
              <div className="testimonial-person">
                <div className="avatar-placeholder">
                  {name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")}
                </div>
                <div>
                  <h3>{name}</h3>
                  <span>{meta}</span>
                </div>
              </div>
              <p>&quot;{quote}&quot;</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
