import { mockAlumni } from "@/data/mockAlumni";

export function getRecommendations(
  targetCompanies: string[]
) {
  return mockAlumni.filter((alumni) =>
    targetCompanies.includes(
      alumni.company
    )
  );
}