import { Container } from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-10 sm:py-14">
        <div className="mb-8 h-3 w-40 animate-pulse bg-stone lg:mb-10" />
        <div className="mb-8 space-y-3 lg:mb-10">
          <div className="h-2.5 w-20 animate-pulse bg-stone" />
          <div className="h-8 w-64 animate-pulse bg-stone" />
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="aspect-[3/4] animate-pulse bg-stone" />
          <div className="space-y-7">
            <div className="h-10 w-3/4 animate-pulse bg-stone" />
            <div className="h-16 w-full animate-pulse bg-stone" />
            <div className="h-6 w-32 animate-pulse bg-stone" />
            <div className="h-12 w-full animate-pulse bg-stone" />
          </div>
        </div>
      </Container>
    </div>
  );
}
