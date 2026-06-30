import HeroSection from "../components/sections/Home/HeroSection";
import StatsBar from "../components/sections/Home/StatsBar";
import HowItWorks from "../components/sections/Home/HowItWorks";
import FeaturedSection from "../components/sections/Home/Featured";
import Categories from "../components/sections/Home/Categories";
import AboutSection from "../components/sections/Home/About";
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <FeaturedSection />
      <AboutSection />
      <Categories />
    </>
  );
};

export default HomePage;
