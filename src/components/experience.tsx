import { useRef, useState } from "react";
import { ditherMaskStyle } from "@/lib/dither";
import { MAX_SEGMENTS, TimelineField } from "@/components/timeline-field";
import type { TimelineUniforms } from "@/components/timeline-field";
import { experience } from "@/content";
import type { Job, Role } from "@/content";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Time is counted in months since year 0, so ranges are plain subtraction.
const toMonth = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return year * 12 + month - 1;
};
const today = new Date();
const NOW = today.getFullYear() * 12 + today.getMonth() + (today.getDate() - 1) / 31;

// The axis runs from January of the first start to the end of the current year.
const AXIS_START = Math.floor(Math.min(...experience.flatMap((job) => job.roles.map((r) => toMonth(r.start)))) / 12) * 12;
const AXIS_END = (Math.floor(NOW / 12) + 1) * 12;
const YEARS = Array.from({ length: (AXIS_END - AXIS_START) / 12 }, (_, i) => AXIS_START / 12 + i);
const toPercent = (month: number) => ((month - AXIS_START) / (AXIS_END - AXIS_START)) * 100;

const formatMonth = (value: string) => {
  const month = toMonth(value);
  return `${MONTHS[month % 12]} ${Math.floor(month / 12)}`;
};
const formatRange = (role: Role) => `${formatMonth(role.start)} – ${role.end ? formatMonth(role.end) : "Present"}`;

/**
 * Density rises with seniority inside a company: the oldest role is sparse,
 * later ones denser, and the current role is solid.
 */
const levelFor = (job: Job, role: Role) => {
  if (!role.end) return 1;
  const past = job.roles.filter((r) => r.end).sort((a, b) => toMonth(a.start) - toMonth(b.start));
  if (past.length === 1) return 0.5;
  return 0.25 + (0.25 * past.indexOf(role)) / (past.length - 1);
};

const span = (role: Role) => {
  const start = toPercent(toMonth(role.start));
  const end = toPercent(role.end ? toMonth(role.end) + 1 : NOW);
  return { start, end, width: Math.max(end - start, 0.6) };
};

// Every role, flattened, with the lane it sits in.
const SEGMENTS = experience
  .flatMap((job, lane) => job.roles.map((role) => ({ job, role, lane })))
  .slice(0, MAX_SEGMENTS);

const LANE_HEIGHT = 112;

const Chart = () => {
  const [uniforms] = useState<TimelineUniforms>(() => {
    const out = {
      tlLanes: experience.length,
      tlNow: toPercent(NOW) / 100,
      tlYears: [toPercent(YEARS[0] * 12) / 100, 12 / (AXIS_END - AXIS_START)],
      tlFocus: -1,
    } as TimelineUniforms;
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      const segment = SEGMENTS[i];
      if (!segment) {
        out[`tlSeg${i}`] = [0, 0, 0, 0];
        continue;
      }
      const { start, end } = span(segment.role);
      out[`tlSeg${i}`] = [start / 100, end / 100, segment.lane, levelFor(segment.job, segment.role)];
    }
    return out;
  });
  // Mutated in place: the shader reads it on its next frame, no re-render.
  const live = useRef(uniforms);
  const focus = (index: number) => {
    live.current.tlFocus = index;
  };

  return (
    <div className="relative hidden xl:block">
      <div className="flex">
        <div className="mr-8 w-44 shrink-0" />
        <div className="relative h-7 flex-1 font-mono text-xs text-muted-foreground">
          {YEARS.map((year) => (
            <span key={year} className="absolute" style={{ left: `${toPercent(year * 12)}%` }}>
              {year}
            </span>
          ))}
          <span className="absolute -translate-x-full pr-2 text-foreground" style={{ left: `${toPercent(NOW)}%` }}>
            Now
          </span>
        </div>
      </div>

      <div className="flex">
        <div className="mr-8 w-44 shrink-0">
          {experience.map((job) => (
            <div key={job.company} className="flex flex-col justify-end pb-5" style={{ height: LANE_HEIGHT }}>
              <span className="text-lg font-medium tracking-tight">{job.company}</span>
              <span className="text-sm text-muted-foreground">{job.type}</span>
            </div>
          ))}
        </div>

        <div className="relative flex-1" style={{ height: LANE_HEIGHT * experience.length }} onPointerLeave={() => focus(-1)}>
          <TimelineField uniforms={uniforms} className="absolute inset-0" />
          {SEGMENTS.map(({ role, lane }, index) => {
            const { start, end } = span(role);
            const current = !role.end;
            // Labels start at the beam, unless that would run off the right edge.
            const alignEnd = start > 62;
            return (
              <div
                key={`${lane}-${role.title}`}
                className={`group/role absolute flex flex-col gap-1 bg-background px-1.5 py-1 whitespace-nowrap select-none ${alignEnd ? "items-end text-right" : "-ml-1.5"}`}
                style={{
                  top: lane * LANE_HEIGHT + LANE_HEIGHT * 0.74 - 64,
                  ...(alignEnd ? { right: `calc(${100 - end}% + 14px)` } : { left: `${start}%` }),
                }}
                onPointerEnter={() => focus(index)}
              >
                <span
                  className={`transition-[color] duration-150 group-hover/role:text-foreground ${current ? "text-foreground" : "text-muted-foreground"}`}
                >
                  {role.title}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{formatRange(role)}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

// Below the chart's width: a vertical timeline per company. A dotted rail
// with a node per role, dithered by seniority like the beams, solid when current.
const List = () => (
  <div className="grid gap-12 xl:hidden">
    {experience.map((job) => (
      <div key={job.company}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <span className="text-xl font-medium tracking-tight">{job.company}</span>
          <span className="text-sm text-muted-foreground">{job.type}</span>
        </div>
        <ol className="relative mt-5 grid gap-6">
          {job.roles.length > 1 && (
            <div
              aria-hidden
              className="absolute top-2 bottom-2 left-[5px] w-px bg-foreground/50"
              style={ditherMaskStyle(0.5, { cell: 2 })}
            />
          )}
          {job.roles.map((role) => {
            const level = levelFor(job, role);
            const current = !role.end;
            return (
              <li key={role.title} className="relative grid grid-cols-[11px_minmax(0,1fr)] gap-x-4">
                <span
                  aria-hidden
                  className="mt-1.5 size-[11px] bg-foreground"
                  style={level < 1 ? ditherMaskStyle(level, { cell: 2 }) : undefined}
                />
                <div className="grid gap-1">
                  <span className={current ? "text-foreground" : "text-muted-foreground"}>{role.title}</span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{formatRange(role)}</span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    ))}
  </div>
);

export const Experience = () => (
  <section id="experience" className="scroll-mt-20 py-24 sm:py-32">
    <div className="mx-auto w-full max-w-6xl px-6">
      <h2 className="text-sm text-muted-foreground">Experience</h2>
      <div className="relative isolate -mx-6 mt-8 border-y bg-background p-6 sm:mx-0 sm:border sm:p-8">
        <Chart />
        <List />
      </div>
    </div>
  </section>
);
