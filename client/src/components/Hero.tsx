import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { fadeIn } from "@/lib/animation";

const Hero = () => {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate elements on component mount
    if (titleRef.current) {
      fadeIn(titleRef.current, 0.2, 0.8);
    }
    
    if (descRef.current) {
      fadeIn(descRef.current, 0.4, 0.8);
    }
    
    if (buttonContainerRef.current) {
      fadeIn(buttonContainerRef.current, 0.6, 0.8);
    }
  }, []);

  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <svg
            className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>

          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 
                ref={titleRef}
                className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl opacity-0 transform translate-y-4"
              >
                <span className="block xl:inline">Find handyman jobs</span>{" "}
                <span className="block text-primary xl:inline">that match your skills</span>
              </h1>
              <p 
                ref={descRef}
                className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 opacity-0 transform translate-y-4"
              >
                Upload your resume, showcase your skills, and get matched with the perfect handyman jobs in your area.
              </p>
              <div 
                ref={buttonContainerRef}
                className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start opacity-0 transform translate-y-4"
              >
                <div className="rounded-md shadow">
                  <Link href="#upload-resume">
                    <Button size="lg" className="w-full sm:w-auto">
                      Upload Resume
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Link href="#job-search">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Search Jobs
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
          alt="Handyman working"
        />
      </div>
    </div>
  );
};

export default Hero;
