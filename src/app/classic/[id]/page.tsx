import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchGutendexBook } from "@/lib/gutendex";
import ClassicImportRunner from "./ClassicImportRunner";
import ClassicImportLoadingUI from "./ClassicImportLoadingUI";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id: raw } = await params;
  const id = parseInt(raw, 10);
  if (!Number.isFinite(id) || id < 1) return { title: "Classic" };
  const meta = await fetchGutendexBook(id);
  if (!meta) return { title: "Classic not found" };
  return {
    title: `${meta.title} · Importing classic`,
    description: meta.summaries?.[0]?.slice(0, 160),
  };
}

export default function ClassicLandingPage({ params }: PageProps) {
  return (
    <Suspense fallback={<ClassicImportLoadingUI />}>
      <ClassicImportRunner params={params} />
    </Suspense>
  );
}
