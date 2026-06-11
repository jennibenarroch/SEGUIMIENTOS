import { MOCK_SUGGESTED_PROSPECTS } from "@/lib/mock-data";
import NuevosClient from "./NuevosClient";

export const dynamic = "force-dynamic";

export default function NuevosProspectosPage() {
  return (
    <NuevosClient
      prospects={MOCK_SUGGESTED_PROSPECTS}
      semana="9–15 jun 2026"
      meta={10}
    />
  );
}
