import { Nav } from "@/components/ui/Nav";
import { Cursor } from "@/components/ui/Cursor";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { Hero } from "@/components/hero/Hero";
import { Ideas } from "@/components/sections/Ideas";
import { Journey } from "@/components/sections/Journey";
import { DoorsExperience } from "@/components/doors/DoorsExperience";
import { Laboratory } from "@/components/lab/Laboratory";
import { Intelligence } from "@/components/sections/Intelligence";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";
import { SculptureStage } from "@/components/stage/SculptureStage";

export default function Home() {
  return (
    <>
      <Nav />
      <ScrollProgress />
      <Cursor />
      <main>
        <SculptureStage>
          <Hero />
          <Ideas />
        </SculptureStage>
        <Journey />
        <DoorsExperience />
        <Laboratory />
        <Intelligence />
        <Recognition />
        <Contact />
      </main>
    </>
  );
}
