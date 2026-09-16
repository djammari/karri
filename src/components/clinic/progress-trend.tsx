import { Badge } from "@/components/ui/badge";
import { progressLabel } from "@/lib/clinic";
import { formatDate } from "@/lib/format";
import { cn } from "cn";

type Point = { occurredAt: Date; progress: string };

export function ProgressTrend({ points }: { points: Point[] }) {
  const rated = points.filter((point) => point.progress !== "UNRATED");
  if (rated.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Engin framvinda skráð enn. Merktu betri / óbreytt / verra eftir
        endurhæfingartíma.
      </p>
    );
  }

  const latest = rated[rated.length - 1];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Framvinda yfir tíma</p>
        <Badge
          variant={latest.progress === "WORSE" ? "destructive" : "secondary"}
        >
          Nú: {progressLabel(latest.progress)}
        </Badge>
      </div>
      <div className="flex items-end gap-1">
        {rated.map((point, index) => (
          <div
            key={`${point.occurredAt.toISOString()}-${index}`}
            className="flex flex-1 flex-col items-center gap-1"
            title={`${formatDate(point.occurredAt)} — ${progressLabel(point.progress)}`}
          >
            <div
              className={cn(
                "w-full rounded-sm",
                point.progress === "BETTER" && "progress-better h-12",
                point.progress === "STABLE" && "progress-stable h-8",
                point.progress === "WORSE" && "progress-worse h-5",
              )}
            />
            <span className="hidden text-[10px] text-muted-foreground sm:block">
              {formatDate(point.occurredAt).replace(".", "")}
            </span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {rated.map((point, index) => (
          <Badge key={`${point.occurredAt.toISOString()}-b-${index}`} variant="outline">
            {formatDate(point.occurredAt)} · {progressLabel(point.progress)}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function ProgressBadge({ value }: { value: string }) {
  const variant =
    value === "WORSE"
      ? "destructive"
      : value === "BETTER"
        ? "default"
        : "secondary";
  return <Badge variant={variant}>{progressLabel(value)}</Badge>;
}
