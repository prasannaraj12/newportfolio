import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/hero/Hero";
import { Perspective } from "@/components/sections/Perspective";
import { Journey } from "@/components/sections/Journey";
import { Laboratory } from "@/components/lab/Laboratory";
import { Intelligence } from "@/components/sections/Intelligence";
import { Recognition } from "@/components/sections/Recognition";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Perspective />
        <Journey />
        <Laboratory />
        <Intelligence />
        <Recognition />
        <Contact />
      </main>
    </>
  );
}
