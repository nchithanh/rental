"use client";

import {
  getAttrValue,
  getAttributeDefs,
  getAttributeGroups,
  parseChipValues,
  type AttrDef,
  type AttrGroupMeta,
} from "@/lib/attribute-defs";
import { useVertical } from "@/lib/vertical";
import { cn } from "@/lib/utils";
import type { Garment } from "@/types";

export function ShowcaseAttrList({ item }: { item: Garment }) {
  const vertical = useVertical();
  const groups = getAttributeGroups(vertical);
  const defs = getAttributeDefs(vertical);

  return (
    <div className="space-y-5">
      {groups.map((group) => {
        const groupDefs = defs.filter((d) => d.group === group.id);
        const filled = groupDefs
          .map((def) => ({ def, value: getAttrValue(item, def) }))
          .filter(({ value }) => value && value !== "—");
        if (!filled.length) return null;
        return (
          <AttrGroupSection key={group.id} group={group} items={filled} />
        );
      })}
    </div>
  );
}

function AttrGroupSection({
  group,
  items,
}: {
  group: AttrGroupMeta;
  items: { def: AttrDef; value: string }[];
}) {
  const kind = items[0]?.def.kind ?? "text";
  const allChips = items.every((x) => (x.def.kind ?? "text") === "chips");
  const allLong = items.every((x) => (x.def.kind ?? "text") === "long");
  const allText = items.every((x) => (x.def.kind ?? "text") === "text");

  return (
    <section aria-labelledby={`attr-g-${group.id}`}>
      <div className="mb-2 flex items-baseline gap-2">
        <h3 id={`attr-g-${group.id}`} className="text-base font-bold">
          {group.label}
        </h3>
        {group.hint ? (
          <span className="text-xs text-slate-400">{group.hint}</span>
        ) : null}
      </div>

      {allChips ? (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2.5">
          {items.flatMap(({ value }) =>
            parseChipValues(value).map((chip) => (
              <li
                key={chip}
                className="flex items-center gap-2 text-sm text-slate-800"
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[8px] bg-[var(--brand-50)] text-[10px] font-bold text-[var(--brand-600)]"
                  aria-hidden
                >
                  ✓
                </span>
                {chip}
              </li>
            )),
          )}
        </ul>
      ) : allLong && group.id === "documents" ? (
        <ul className="space-y-2">
          {items.map(({ def, value }) => (
            <li
              key={def.key}
              className="rounded-[10px] border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--brand-50)] text-[10px] font-bold text-[var(--brand-600)]">
                {def.key.endsWith("1") ? "1" : "2"}
              </span>
              {value}
            </li>
          ))}
        </ul>
      ) : allLong ? (
        <div className="space-y-2 text-sm leading-relaxed text-slate-600">
          {items.map(({ def, value }) => (
            <p key={def.key}>{value}</p>
          ))}
        </div>
      ) : allText || kind === "text" ? (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map(({ def, value }) => (
            <div key={def.key} className="min-w-0">
              <dt className="text-xs text-slate-400">{def.label}</dt>
              <dd className="truncate text-sm font-bold">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {items.map(({ def, value }) => (
            <div
              key={def.key}
              className={cn(
                "rounded-[10px] border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900",
                def.kind === "long" && "col-span-2",
              )}
            >
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                {def.label}
              </dt>
              <dd className="font-semibold whitespace-pre-wrap">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
