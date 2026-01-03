import Hero from "@/components/home/hero";

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="rounded-full blur-3xl bg-primary/40 w-96 h-96 absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="rounded-full blur-3xl bg-primary/40 w-96 h-96 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
