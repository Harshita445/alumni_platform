"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, CircleDashed, Save, Sparkles } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { getStoredUser, mergeProfileIntoStoredUser, saveStoredUser, updateProfile } from "@/lib/api";
import { getAdmissionYear, getGraduationYear } from "@/lib/auth";
import { uniqueCompanies } from "@/data/companies";
import { mergeMentorshipGoals, parseGoalsToChips } from "@/lib/onboarding";

const STEPS = [
  "Academic information",
  "Career interests",
  "Target companies",
  "Mentorship goals",
  "Skills",
];

const careerInterests = [
  "Software Engineering",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "Product Management",
  "Consulting",
  "Finance",
  "Research",
  "Higher Studies",
  "Entrepreneurship",
];

const targetCompanies = [
  "Google",
  "Microsoft",
  "Adobe",
  "Amazon",
  "Atlassian",
  "Flipkart",
  "Uber",
  "Goldman Sachs",
];

const mentorshipGoals = [
  "Career Guidance",
  "Resume Review",
  "Mock Interviews",
  "Internship Advice",
  "Placement Preparation",
  "Higher Studies",
  "Startup Advice",
];

const expertiseOptions = [
  "Backend",
  "Frontend",
  "AI",
  "Machine Learning",
  "Product",
  "Cloud",
  "Cybersecurity",
  "DevOps",
  "Research",
  "Consulting",
  "Finance",
  "UI/UX",
  "Data Science",
  "System Design",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => ({
    full_name: user?.profile?.full_name || "",
    branch: user?.profile?.branch || "",
    graduation_year: user?.profile?.graduation_year?.toString() || "",
    skills: user?.profile?.skills || [],
    career_interests: user?.profile?.career_interests || [],
    target_companies: user?.profile?.target_companies || [],
    goals: user?.profile?.goals || "",
    mentorship_goals: user?.profile?.goals ? parseGoalsToChips(user.profile.goals) : [] as string[],
    bio: user?.profile?.bio || "",
    company: user?.profile?.company || "",
    designation: user?.profile?.designation || "",
    expertise: user?.profile?.expertise || [],
  }));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
  }, [router, user]);

  const buildProfilePayload = () => ({
    full_name: form.full_name || undefined,
    branch: form.branch || undefined,
    graduation_year: form.graduation_year ? Number(form.graduation_year) : undefined,
    company: user?.role === "alumni" ? form.company || undefined : undefined,
    designation: user?.role === "alumni" ? form.designation || undefined : undefined,
    bio: form.bio || undefined,
    skills: form.skills,
    career_interests: form.career_interests,
    goals: form.goals || undefined,
    target_companies: form.target_companies,
    expertise: form.expertise,
  });

  useEffect(() => {
    if (!user?.access_token) {
      return;
    }

    const saveDraft = async () => {
      setStatus("saving");
      try {
        const payload = buildProfilePayload();
        const profile = await updateProfile(user.access_token, payload);
        saveStoredUser({
          ...mergeProfileIntoStoredUser(user, profile),
          onboarding_step: step,
        });
        setStatus("saved");
        setLastSaved(new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
      } catch {
        setStatus("idle");
      }
    };

    const timer = window.setTimeout(saveDraft, 450);
    return () => window.clearTimeout(timer);
  }, [form, step, user]);

  const admissionYear = useMemo(() => getAdmissionYear(user?.email || ""), [user?.email]);
  const computedGraduationYear = useMemo(() => {
    if (!admissionYear) {
      return "";
    }
    return String(getGraduationYear(admissionYear));
  }, [admissionYear]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const toggleChip = (list: "career_interests" | "target_companies" | "mentorship_goals" | "expertise", value: string) => {
    setForm((current) => {
      const currentList = current[list] as string[];
      const nextList = currentList.includes(value)
        ? currentList.filter((item) => item !== value)
        : [...currentList, value];

      if (list === "mentorship_goals") {
        return {
          ...current,
          mentorship_goals: nextList,
          goals: mergeMentorshipGoals(nextList),
        };
      }

      return {
        ...current,
        [list]: nextList,
      };
    });
  };

  const handleTagInput = (value: string) => {
    const next = value.split(",").map((item) => item.trim()).filter(Boolean);
    setForm((current) => ({ ...current, skills: [...current.skills, ...next.filter((item) => !current.skills.includes(item))] }));
  };

  const completeOnboarding = async () => {
    const authUser = user ?? getStoredUser();
    const token = authUser?.access_token;

    if (!token) {
      return;
    }

    setStatus("saving");
    setErrorMessage(null);

    const payload = buildProfilePayload();

    try {
      const profile = await updateProfile(token, payload);
      saveStoredUser({
        ...mergeProfileIntoStoredUser(authUser, profile),
        onboarding_step: 5,
      });
    } catch (error: unknown) {
      saveStoredUser({
        ...mergeProfileIntoStoredUser(authUser, payload),
        onboarding_step: 5,
      });
      setStatus("error");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your profile draft was saved locally, but the final sync could not be completed."
      );
    } finally {
      router.replace("/dashboard");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <main className="auth-page" style={{ padding: "24px" }}>
      <div className="auth-bg-pattern auth-bg-pattern-one" aria-hidden="true" />
      <div className="auth-bg-pattern auth-bg-pattern-two" aria-hidden="true" />

      <section className="auth-card" style={{ maxWidth: "1100px", minHeight: "780px" }}>
        <div className="auth-form-panel" style={{ padding: "36px 34px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px" }}>
            <div>
              <p style={{ color: "var(--primary)", fontWeight: 700, margin: 0 }}>Onboarding</p>
              <h1 style={{ fontSize: "clamp(28px, 3.2vw, 36px)", margin: "6px 0 0" }}>Complete your {user.role === "student" ? "student" : "mentor"} profile</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: "#fffdf9", border: "1px solid var(--border)" }}>
              {status === "saving" ? <CircleDashed size={14} /> : <CheckCircle2 size={14} />}
              <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{status === "saving" ? "Saving..." : status === "saved" ? `Saved · ${lastSaved}` : "Ready"}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", marginBottom: "22px", flexWrap: "wrap" }}>
            {STEPS.map((label, index) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", borderRadius: "999px", background: index <= step ? "rgba(122,75,46,0.12)" : "#fffdf9", border: index <= step ? "1px solid rgba(122,75,46,0.22)" : "1px solid var(--border)" }}>
                <span style={{ width: "24px", height: "24px", display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: index <= step ? "var(--primary)" : "#efe2d2", color: index <= step ? "#fff" : "var(--text-secondary)", fontSize: "12px", fontWeight: 700 }}>{index + 1}</span>
                <span style={{ fontSize: "13px", color: index <= step ? "var(--primary)" : "var(--text-secondary)" }}>{label}</span>
              </div>
            ))}
          </div>

          {step === 0 ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <label style={fieldStyle}>
                  <span>Full name</span>
                  <input name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle} />
                </label>
                {user.role === "student" ? (
                  <label style={fieldStyle}>
                    <span>Branch</span>
                    <select name="branch" value={form.branch} onChange={handleChange} style={inputStyle}>
                      <option value="">Select branch</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Civil">Civil</option>
                      <option value="Chemical">Chemical</option>
                      <option value="Biotech">Biotech</option>
                    </select>
                  </label>
                ) : null}
                <label style={fieldStyle}>
                  <span>Graduation year</span>
                  <input name="graduation_year" value={form.graduation_year} onChange={handleChange} style={inputStyle} placeholder={computedGraduationYear || "2027"} />
                </label>
                {user.role === "alumni" ? (
                  <>
                    <label style={fieldStyle}>
                      <span>Current company</span>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        list="company-suggestions"
                        placeholder="Type or select a company"
                        style={inputStyle}
                      />
                      <datalist id="company-suggestions">
                        {uniqueCompanies.map((company) => (
                          <option key={company} value={company} />
                        ))}
                      </datalist>
                    </label>
                    <label style={fieldStyle}>
                      <span>Current designation</span>
                      <input name="designation" value={form.designation} onChange={handleChange} style={inputStyle} />
                    </label>
                  </>
                ) : null}
              </div>
              {user.role === "alumni" ? (
                <label style={fieldStyle}>
                  <span>Bio</span>
                  <textarea name="bio" value={form.bio} onChange={handleChange} style={{ ...inputStyle, minHeight: "112px" }} />
                </label>
              ) : null}
            </div>
          ) : null}

          {step === 1 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {careerInterests.map((option) => (
                <button key={option} type="button" onClick={() => toggleChip("career_interests", option)} style={{ ...chipStyle, ...(form.career_interests.includes(option) ? activeChipStyle : {}) }}>{option}</button>
              ))}
            </div>
          ) : null}

          {step === 2 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {targetCompanies.map((option) => (
                <button key={option} type="button" onClick={() => toggleChip("target_companies", option)} style={{ ...chipStyle, ...(form.target_companies.includes(option) ? activeChipStyle : {}) }}>{option}</button>
              ))}
            </div>
          ) : null}

          {step === 3 ? (
            <div style={{ display: "grid", gap: "12px" }}>
              {mentorshipGoals.map((option) => (
                <button key={option} type="button" onClick={() => toggleChip("mentorship_goals", option)} style={{ ...cardStyle, ...(form.mentorship_goals.includes(option) ? activeCardStyle : {}) }}>
                  <span>{option}</span>
                  <CheckCircle2 size={18} />
                </button>
              ))}
            </div>
          ) : null}

          {step === 4 ? (
            <div style={{ display: "grid", gap: "16px" }}>
              <label style={fieldStyle}>
                <span>Skills</span>
                <input placeholder="React, Design, Analytics" onBlur={(event) => {
                  handleTagInput(event.currentTarget.value);
                  event.currentTarget.value = "";
                }} style={inputStyle} />
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {form.skills.map((skill) => (
                  <button key={skill} type="button" onClick={() => setForm((current) => ({ ...current, skills: current.skills.filter((item) => item !== skill) }))} style={chipStyle}>{skill} ×</button>
                ))}
              </div>
              {user.role === "alumni" ? (
                <>
                  <label style={fieldStyle}>
                    <span>Expertise</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {expertiseOptions.map((option) => (
                        <button key={option} type="button" onClick={() => toggleChip("expertise", option)} style={{ ...chipStyle, ...(form.expertise.includes(option) ? activeChipStyle : {}) }}>{option}</button>
                      ))}
                    </div>
                  </label>
                </>
              ) : null}
            </div>
          ) : null}

          {errorMessage ? (
            <p style={{ color: "var(--danger)", margin: "0 0 12px", fontSize: "0.95rem" }}>{errorMessage}</p>
          ) : null}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setStep((current) => Math.max(0, current - 1))} className="auth-google-button" style={{ width: "auto", padding: "0 18px" }}>Back</button>
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={() => setStep((current) => current + 1)} className="auth-primary-button" style={{ width: "auto", padding: "0 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>Continue <ArrowRight size={16} /></button>
            ) : (
              <button type="button" onClick={completeOnboarding} className="auth-primary-button" style={{ width: "auto", padding: "0 20px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>{status === "saving" ? "Finishing..." : <>Finish <Sparkles size={16} /></>}</button>
            )}
          </div>
        </div>

        <aside className="auth-brand-panel" aria-hidden="true" style={{ minHeight: "100%" }}>
          <img src="/thapar-campus-hero.jpg" alt="" className="auth-campus-image" />
          <div className="auth-brand-overlay" />
          <div className="auth-brand-content" style={{ padding: "28px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", marginBottom: "16px" }}>
              <Save size={16} />
              Auto-save enabled
            </div>
            <h2 style={{ fontSize: "28px", marginBottom: "10px" }}>Your progress is always safe</h2>
            <p>Every change is saved quietly in the background so your onboarding can resume whenever you return.</p>
            <button type="button" onClick={() => { logout(); router.push("/login"); }} style={{ marginTop: "16px", background: "rgba(255,255,255,0.16)", color: "#fff", border: "1px solid rgba(255,255,255,0.26)", borderRadius: "999px", padding: "10px 14px", cursor: "pointer" }}>Logout</button>
          </div>
        </aside>
      </section>
    </main>
  );
}

const fieldStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
  fontWeight: 600,
  color: "var(--text-primary)",
};

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid var(--border)",
  background: "#fffdf9",
};

const chipStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
  borderRadius: "999px",
  border: "1px solid var(--border)",
  padding: "10px 14px",
  background: "#fffdf9",
  cursor: "pointer",
  color: "var(--text-primary)",
};

const activeChipStyle = {
  background: "rgba(122,75,46,0.12)",
  borderColor: "rgba(122,75,46,0.22)",
  color: "var(--primary)",
};

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  background: "#fffdf9",
  cursor: "pointer",
  color: "var(--text-primary)",
};

const activeCardStyle = {
  borderColor: "rgba(122,75,46,0.24)",
  background: "rgba(122,75,46,0.12)",
  color: "var(--primary)",
};