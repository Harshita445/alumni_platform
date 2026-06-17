import { mockAlumni } from "./mockAlumni";

const alumniCompanies = mockAlumni.map(
  (alumni) => alumni.company
);

export const companies = [
  "Google",
  "Microsoft",
  "Amazon",
  "Adobe",
  "Uber",
  "Atlassian",
  "Goldman Sachs",
  "Flipkart",
  "Zomato",
  "Swiggy",
  ...alumniCompanies,
];

export const uniqueCompanies = [
  ...new Set(companies),
];