import { Container } from "@/components/ui/Container";

export default function ProductLoading() {
  return (
    <div className="border-b border-line bg-white">
      <Container className="py-10 sm:py-14">
        <div className="mb-8 h-3 w-40 skeleton lg:mb-10" />
        <div className="mb-8 space-y-3 lg:mb-10">
          <div className="h-2.5 w-20 skeleton" />
          <div className="h-8 w-64 skeleton" />
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="aspect-[3/4] skeleton" />
          <div className="space-y-7">
            <div className="h-10 w-3/4 skeleton" />
            <div className="h-16 w-full skeleton" />
            <div className="h-6 w-32 skeleton" />
            <div className="h-12 w-full skeleton" />
          </div>
        </div>
      </Container>
    </div>
  );
}
