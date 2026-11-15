import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Achievements } from "@/components/sections/Achievements";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Achievements />
        <Contact />
      </main>
    </>
  );
}
