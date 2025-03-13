import { Wrench, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <Wrench className="h-6 w-6 text-white mr-2" />
              <span className="text-xl font-bold text-white">SkillMatch</span>
            </div>
            <p className="mt-4 text-base text-gray-300">
              Connecting skilled handymen with the perfect jobs based on their unique skills and experience.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Resume Tips
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Interview Prep
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Skill Building
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Career Advice
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-base text-gray-300 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </Link>
            <Link href="#" className="text-gray-400 hover:text-gray-300">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </Link>
          </div>
          
          <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
            &copy; {new Date().getFullYear()} SkillMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
