import { labs, type LabDefinition } from "@/data/labs";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LabCatalogEntry = LabDefinition & {
  databaseId: string | null;
  databaseReady: boolean;
};

type DatabaseLab = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  content_status: "ready" | "partial" | "placeholder";
};

export async function getLabsDatabaseFirst(): Promise<LabCatalogEntry[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("labs")
      .select("id, slug, title, description, content_status")
      .eq("is_active", true)
      .in("slug", labs.map((lab) => lab.slug))
      .order("order_index", { ascending: true });

    if (error) throw error;

    const databaseRows = (data ?? []) as DatabaseLab[];
    const bySlug = new Map(databaseRows.map((row) => [row.slug, row]));

    return labs.map((lab) => {
      const databaseLab = bySlug.get(lab.slug);
      return {
        ...lab,
        title: databaseLab?.title ?? lab.title,
        description: databaseLab?.description ?? lab.description,
        databaseId: databaseLab?.id ?? null,
        databaseReady: databaseLab?.content_status === "ready",
      };
    });
  } catch {
    return labs.map((lab) => ({
      ...lab,
      databaseId: null,
      databaseReady: false,
    }));
  }
}
