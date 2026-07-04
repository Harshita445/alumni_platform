"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import AlumniCard from "@/components/AlumniCard";
import EmptyState from "@/components/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import { Alumni, fetchAlumni } from "@/lib/api";
import styles from "./search.module.css";

const POPULAR_COMPANIES = [
  "Google",
  "Amazon",
  "Microsoft",
  "Adobe",
  "Goldman Sachs",
  "JP Morgan",
  "Flipkart",
  "Uber",
];

const FEATURES = [
  {
    icon: "👥",
    title: "1:1 Mentorship",
    description: "Learn from experienced alumni.",
  },
  {
    icon: "📄",
    title: "Resume Reviews",
    description: "Get feedback and improve your resume.",
  },
  {
    icon: "🎤",
    title: "Mock Interviews",
    description: "Practice interviews and build confidence.",
  },
  {
    icon: "🎯",
    title: "Career Guidance",
    description: "Receive personalized career advice.",
  },
];

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadAlumni = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await fetchAlumni(user?.access_token);
        if (active) {
          setAlumni(result);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load alumni."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAlumni();

    return () => {
      active = false;
    };
  }, [user]);

  const filteredAlumni = useMemo(() => {
    return alumni.filter((alumniItem) => {
      const matchesCompany = alumniItem.company
        ?.toLowerCase()
        .includes(companyFilter.toLowerCase());
      const matchesRole = alumniItem.designation
        ?.toLowerCase()
        .includes(roleFilter.toLowerCase());

      return (
        matchesCompany !== false &&
        matchesRole !== false
      );
    });
  }, [alumni, companyFilter, roleFilter]);

  const handleCompanyClick = (company: string) => {
    setCompanyFilter(company);
  };

  const handleClearFilters = () => {
    setCompanyFilter("");
    setRoleFilter("");
  };

  return (
    <main className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>Explore Alumni</h1>
            <p className={styles.heroDescription}>
              Connect with experienced Thapar alumni working across leading companies and industries. Find mentors, get guidance, and grow your career.
            </p>
          </div>
        </section>

        {/* SEARCH & FILTERS SECTION */}
        <section className={styles.searchSection}>
          <div className={styles.searchCard}>
            <h2 className={styles.searchCardTitle}>
              <span className={styles.searchIcon}>🔍</span>
              Find Your Mentor
            </h2>
            <div className={styles.searchGrid}>
              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Company</label>
                <input
                  type="text"
                  placeholder="e.g., Google, Amazon, Microsoft..."
                  value={companyFilter}
                  onChange={(e) =>
                    setCompanyFilter(e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Role</label>
                <input
                  type="text"
                  placeholder="e.g., Software Engineer, Product Manager..."
                  value={roleFilter}
                  onChange={(e) =>
                    setRoleFilter(e.target.value)
                  }
                  className={styles.filterInput}
                />
              </div>
            </div>
          </div>
        </section>

        {/* POPULAR COMPANIES SECTION */}
        {alumni.length > 0 && (
          <section className={styles.companiesSection}>
            <h2 className={styles.sectionTitle}>Popular Companies</h2>
            <div className={styles.companiesList}>
              {POPULAR_COMPANIES.map((company) => (
                <button
                  key={company}
                  className={styles.companyPill}
                  onClick={() => handleCompanyClick(company)}
                  title={`Filter by ${company}`}
                >
                  {company}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* PLATFORM FEATURES SECTION */}
        {alumni.length > 0 && (
          <section className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>Everything you need to grow</h2>
            <div className={styles.featuresGrid}>
              {FEATURES.map((feature) => (
                <div key={feature.title} className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    {feature.icon}
                  </div>
                  <h3 className={styles.featureTitle}>
                    {feature.title}
                  </h3>
                  <p className={styles.featureDescription}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div style={{ fontSize: "48px" }}>⏳</div>
            <p className={styles.loadingText}>Loading alumni...</p>
          </div>
        ) : error ? (
          /* ERROR STATE */
          <div className={styles.errorState}>
            <div className={styles.errorStateIcon}>⚠️</div>
            <h3 className={styles.errorStateTitle}>Unable to load alumni</h3>
            <p className={styles.errorStateMessage}>Please try again in a few moments.</p>
          </div>
        ) : filteredAlumni.length === 0 ? (
          /* EMPTY STATE */
          <section>
            <EmptyState
              title="No alumni found"
              description="Try adjusting your filters or search criteria."
              onClearFilters={handleClearFilters}
            />
          </section>
        ) : (
          /* ALUMNI RESULTS SECTION */
          <section>
            <div className={styles.resultsToolbar}>
              <p className={styles.resultCount}>
                Showing <strong>{filteredAlumni.length}</strong> {filteredAlumni.length === 1 ? "alumnus" : "alumni"}
              </p>
              <button
                onClick={handleClearFilters}
                className={styles.clearButton}
              >
                Clear Filters
              </button>
            </div>

            <div className={styles.alumniGrid}>
              {filteredAlumni.map((alumniPerson) => (
                <AlumniCard
                  key={alumniPerson.id}
                  id={alumniPerson.id}
                  name={alumniPerson.full_name || "Alumnus"}
                  profileImage="/default-avatar.png"
                  company={alumniPerson.company || "Independent"}
                  role={alumniPerson.designation || "Alumni"}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
