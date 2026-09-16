import { staffName } from "@/lib/clinic";
import { ClinicShell } from "@/components/clinic/clinic-shell";

export const dynamic = "force-dynamic";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClinicShell staffName={staffName()}>{children}</ClinicShell>;
}
