import type { Cover } from "@/content";
import { AMEKZ_FIELD } from "./amekz-field";
import { ELEVINTIA_FIELD } from "./elevintia-field";
import { VINTIA_FIELD } from "./vintia-field";

// One GLSL field per cover kind, drawn with DitherShader.
export const COVER_FIELDS: Record<Cover, string> = {
  mark: AMEKZ_FIELD,
  peaks: ELEVINTIA_FIELD,
  levels: VINTIA_FIELD,
};
