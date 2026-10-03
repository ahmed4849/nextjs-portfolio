import Portfolio from "./portfolio";
import { defaultProfile, sampleProjects } from "../lib/content";

export default function Home() {
  return <Portfolio initialProfile={defaultProfile} initialProjects={sampleProjects} />;
}
