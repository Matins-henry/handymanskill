import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <i className="ri-tools-fill text-primary text-2xl mr-2"></i>
              <span className="text-lg font-bold">SkillMatch</span>
            </div>
            <p className="text-gray-400 text-sm">Connecting skilled handymen with the right opportunities based on their experience and location.</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">For Job Seekers</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-primary text-sm">Create Profile</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-primary text-sm">Upload Resume</a></Link></li>
              <li><Link href="/job-matches"><a className="text-gray-400 hover:text-primary text-sm">Job Alerts</a></Link></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm">Career Resources</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">For Employers</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm">Post a Job</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm">Browse Candidates</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm">Pricing Plans</a></li>
              <li><a href="#" className="text-gray-400 hover:text-primary text-sm">Recruitment Tools</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-400 text-sm">
                <i className="ri-mail-line mr-2"></i> support@skillmatch.com
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <i className="ri-phone-line mr-2"></i> (555) 123-4567
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <i className="ri-map-pin-line mr-2"></i> San Francisco, CA
              </li>
            </ul>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="ri-twitter-fill text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="ri-linkedin-fill text-lg"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <i className="ri-instagram-fill text-lg"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2023 SkillMatch. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-primary text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
