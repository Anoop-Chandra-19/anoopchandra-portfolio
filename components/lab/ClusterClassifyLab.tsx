import { useState } from "react";
import type { LabAccent } from "@/lib/lab-meta";
import Button from "@/components/ui/Button";
import KMeansLab from "./KMeansLab";
import PerceptronLab from "./PerceptronLab";

/* exp-003 mode switch — both modes stay mounted so switching never loses
   your points */

const MODES = [
  ["cluster", "k-means clustering"],
  ["classify", "classifier explorer"],
] as const;

export default function ClusterClassifyLab({ accent }: { accent: LabAccent }) {
  const [mode, setMode] = useState<(typeof MODES)[number][0]>("cluster");
  return (
    <div data-lab-mode={mode}>
      <div className="lx-modes">
        {MODES.map(([m, label]) => (
          <Button
            key={m}
            kind="box"
            size="sm"
            pressed={mode === m}
            accent={accent}
            onClick={() => setMode(m)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div style={{ display: mode === "cluster" ? "block" : "none" }}>
        <KMeansLab accent={accent} />
      </div>
      <div style={{ display: mode === "classify" ? "block" : "none" }}>
        <PerceptronLab accent={accent} />
      </div>
    </div>
  );
}
