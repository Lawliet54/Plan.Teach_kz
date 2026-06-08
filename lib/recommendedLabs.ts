import type { TaskPack } from "@/lib/taskPacks";

export function getRecommendedLabHref(
  pack: Pick<TaskPack, "slug" | "title" | "formula">,
): string {
  const key = `${pack.slug} ${pack.title} ${pack.formula ?? ""}`.toLocaleLowerCase("kk-KZ");

  if (key.includes("hooke") || key.includes("гук") || key.includes("серпім")) {
    return "/labs/hooke-law";
  }

  if (key.includes("archimedes") || key.includes("архимед")) {
    return "/labs/archimedes-law";
  }

  if (
    key.includes("ohm") ||
    key.includes("ом") ||
    key.includes("ток") ||
    key.includes("circuit") ||
    key.includes("тізбек") ||
    key.includes("transformer")
  ) {
    return "/labs/ohm-law";
  }

  if (
    key.includes("reflection") ||
    key.includes("шағыл") ||
    key.includes("lens") ||
    key.includes("линза") ||
    key.includes("diffraction") ||
    key.includes("interference")
  ) {
    return "/labs/reflection-law";
  }

  if (
    key.includes("newton") ||
    key.includes("ньютон") ||
    key.includes("motion") ||
    key.includes("қозғалыс") ||
    key.includes("gravity") ||
    key.includes("импульс") ||
    key.includes("work") ||
    key.includes("энергия")
  ) {
    return "/labs/newton-second-law";
  }

  return "/labs";
}
