import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Check,
  FileText,
  GraduationCap,
  Handshake,
  Heart,
  Mail,
  MessageCircle,
  Quote,
  Send,
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

      <section className="mission-section">
        <div className="mission-dots mission-dots-top" aria-hidden="true" />
        <div className="mission-dots mission-dots-bottom" aria-hidden="true" />
        <div className="mission-building" aria-hidden="true" />

        <div className="mission-copy fade-up">
          <div className="mission-label-wrap">
            <span className="mission-label">Our Mission</span>
            <span className="mission-label-line" aria-hidden="true" />
          </div>
          <h2>
            Built for <span>meaningful</span> connections
          </h2>
          <p className="mission-lede">
            We believe every student deserves guidance, and every alumnus has
            experiences worth sharing. Alumly brings the two together in a
            trusted space designed for career clarity, mentorship, and
            relationships that last beyond a single conversation.
          </p>

          <div className="mission-stats">
            {[
              { label: "Verified Alumni", value: "500+" },
              { label: "Sessions", value: "1000+" },
              { label: "Companies", value: "100+" },
            ].map((stat) => (
              <div className="mission-stat" key={stat.label}>
                <div className="mission-stat-value">{stat.value}</div>
                <div className="mission-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <Link className="mission-cta" href="/search">
            Explore Alumni
            <ArrowRight size={18} strokeWidth={2.2} aria-hidden="true" />
          </Link>
        </div>

        <div className="mission-card-wrap fade-up">
          <div className="mission-card-illustration" aria-hidden="true" />
          <article className="mission-card">
            <div className="mission-icon">
              <Handshake size={34} strokeWidth={1.8} aria-hidden="true" />
            </div>
            <h3>Connecting today, empowering tomorrow.</h3>
            <p>
              Alumly is more than a platform. It is a movement to create lasting
              relationships, unlock opportunities, and build a stronger future
              for every student.
            </p>
            <div className="mission-benefits">
              {[
                "Verified Alumni",
                "Structured Mentorship",
                "Community Discussions",
                "Events & Updates",
              ].map((benefit) => (
                <div className="mission-benefit-row" key={benefit}>
                  <div className="mission-benefit-check">
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                  </div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="contact-section fade-up">
        <div className="contact-card" aria-labelledby="landing-contact-title">
          <div className="contact-dots" aria-hidden="true" />
          <div className="contact-rings" aria-hidden="true" />
          <div className="contact-divider contact-divider-top" aria-hidden="true" />

          <div className="contact-icon">
            <Mail size={34} strokeWidth={1.9} aria-hidden="true" />
          </div>

          <p id="landing-contact-title" className="contact-question">
            Questions, feedback or partnership ideas?
          </p>

          <a className="contact-email" href="mailto:harshitak0456@gmail.com">
            harshitak0456@gmail.com
          </a>

          <a className="contact-button" href="mailto:harshitak0456@gmail.com">
            <Send size={24} strokeWidth={2.1} aria-hidden="true" />
            <span>
              Contact Us
            </span>
          </a>

          <div className="contact-divider contact-divider-bottom" aria-hidden="true" />

          <p className="contact-closing">
            Built with <Heart size={26} strokeWidth={1.9} aria-hidden="true" /> for
            the Thapar community.
          </p>
        </div>
      </section>
    </main>
  );
}
