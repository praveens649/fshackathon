import HelpDeskForm from "@/app/components/helf-form";

export default function HelpDeskCreate() {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-1 flex-col gap-4 p-4 md:gap-8 md:px-5 md:py-2">
  <HelpDeskForm />
  </main>
  );
}