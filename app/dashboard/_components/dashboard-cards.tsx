import { Card } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Heart, 
  HandHelpingIcon, 
  MapPin, 
  Calendar 
} from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#e2e8f0] via-[#94a3b8] to-[#475569]">
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff40_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl text-zinc-900">
            Welcome to Your Friendly Neighbourhood
          </h1>
          <p className="mt-6 text-xl leading-8 text-zinc-700">
            Connect, Share, and Build a Stronger Community Together
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="backdrop-blur-md bg-white/30 border-white/50 border p-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 rounded-full shadow-inner">
                <Users className="h-6 w-6 text-zinc-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-800">Connect with Neighbors</h3>
                <p className="text-zinc-600">Build meaningful relationships locally</p>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-md bg-white/30 border-white/50 border p-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 rounded-full shadow-inner">
                <Heart className="h-6 w-6 text-zinc-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-800">Community Support</h3>
                <p className="text-zinc-600">Help and get help from your community</p>
              </div>
            </div>
          </Card>

          <Card className="backdrop-blur-md bg-white/30 border-white/50 border p-6 hover:shadow-xl hover:shadow-black/5 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/80 rounded-full shadow-inner">
                <Calendar className="h-6 w-6 text-zinc-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-zinc-800">Local Events</h3>
                <p className="text-zinc-600">Stay updated with community activities</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-12 flex justify-center space-x-6">
          <button className="px-8 py-4 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 shadow-lg transition-all duration-300">
            Join Community
          </button>
          <button className="px-8 py-4 bg-white/30 backdrop-blur-sm text-zinc-800 rounded-full hover:bg-white/50 transition-all duration-300 border border-white/50">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}