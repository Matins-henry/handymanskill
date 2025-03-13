import { Link } from "wouter";

interface AppTabsProps {
  activeTab: "profile" | "job-matches" | "portfolio";
}

export default function AppTabs({ activeTab }: AppTabsProps) {
  return (
    <div className="border-b border-gray-200 mb-8">
      <div className="flex space-x-8">
        <Link href="/">
          <a className={`py-4 px-1 text-sm font-medium border-b-2 ${
            activeTab === "profile" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}>
            Profile & Resume
          </a>
        </Link>
        <Link href="/job-matches">
          <a className={`py-4 px-1 text-sm font-medium border-b-2 ${
            activeTab === "job-matches" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}>
            Job Matches
          </a>
        </Link>
        <Link href="/portfolio">
          <a className={`py-4 px-1 text-sm font-medium border-b-2 ${
            activeTab === "portfolio" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}>
            My Portfolio
          </a>
        </Link>
      </div>
    </div>
  );
}
