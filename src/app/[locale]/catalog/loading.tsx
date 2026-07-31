import { Container } from "@/components/ui/Container";

export default function CatalogLoading() {
  return (
    <div>
      <div className="border-b border-line bg-white">
        <Container className="py-10 sm:py-14">
          <div className="h-3 w-20 animate-pulse bg-stone" />
          <div className="mt-4 h-9 w-40 animate-pulse bg-stone" />
        </Container>
      </div>
      <Container className="py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-[16.5rem_1fr] lg:gap-12">
          <div className="hidden space-y-8 lg:block">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-3 w-16 animate-pulse bg-stone" />
                <div className="h-8 w-full animate-pulse bg-stone" />
              </div>
            ))}
          </div>
          <div>
            <div className="mb-8 h-4 w-24 animate-pulse bg-stone lg:hidden" />
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="aspect-[3/4] animate-pulse bg-stone" />
                  <div className="mt-4 h-2.5 w-14 animate-pulse bg-stone" />
                  <div className="mt-2 h-3.5 w-28 animate-pulse bg-stone" />
                  <div className="mt-2 h-3 w-16 animate-pulse bg-stone" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
