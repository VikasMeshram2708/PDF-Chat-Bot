import Hero from "@/components/home/hero";

export default function Home() {
  return (
    <div className="">
      <section className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-primary/75 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-4 h-96 w-96 rounded-full bg-primary/75 blur-3xl" />
      </section>

      <Hero />
    </div>
  );
}
