import { loadLocalConfig } from "@/config/local-config";

import { provisionCanonAction } from "./actions";
import { SetupSurface } from "./setup-surface";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  return (
    <SetupSurface
      configResult={loadLocalConfig(process.env)}
      provisionAction={provisionCanonAction}
    />
  );
}
