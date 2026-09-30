import { Clock } from "lucide-react";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PageHeader from "@/components/ui/PageHeader";

interface ComingSoonProps {
  title: string;
  description: string;
  /** Short label rendered as a pill at the top of the page. */
  sectionLabel: string;
  /** Which module this surface ships with. Used in the "Ships with" tag. */
  shipsWithModule: number;
  /** What the user can expect when this ships. */
  upcomingFeatures: string[];
}

/**
 * Honest "coming soon" body used by placeholder pages for sidebar entries
 * that haven't been built yet. Renders a PageHeader + a Card with a Clock
 * icon and a short bulleted list of what's coming. No fake data.
 */
export default function ComingSoon({
  title,
  description,
  sectionLabel,
  shipsWithModule,
  upcomingFeatures,
}: ComingSoonProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <Badge tone="info">
            <Clock className="mr-1 inline-block h-3 w-3" aria-hidden />
            Ships with Module {shipsWithModule}
          </Badge>
        }
      />
      <Card>
        <EmptyState
          title={`${sectionLabel} is coming up`}
          description={`This area is reserved for a future module of the platform. The sidebar entry is here so navigation stays consistent while the feature is being designed.`}
        />
      </Card>
      <Card>
        <h3 className="text-card-title font-semibold text-text">
          What you'll be able to do here
        </h3>
        <ul className="mt-3 space-y-2 text-default text-text-muted">
          {upcomingFeatures.map((feature) => (
            <li key={feature} className="flex gap-3">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald"
              />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}