import { Nav } from "@/components/ui/Nav";
import { Cursor } from "@/components/ui/Cursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/hero/Hero";
import { Ideas } from "@/components/sections/Ideas";
import { Journey } from "@/components/sections/Journey";
import { DoorsExperience } from "@/components/doors/DoorsExperience";
import { Work } from "@/components/work/Work";
import { Intelligence } from "@/components/sections/Intelligence";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <ScrollProgress />
      <Cursor />
      <main>
        <Hero />
        <Ideas />
        <Journey />
        <DoorsExperience />
        <Work />
        <Intelligence />
        <Recognition />
        <Contact />
      </main>
    </>
  );
}
