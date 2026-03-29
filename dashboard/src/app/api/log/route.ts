import { loadPlayerState, savePlayerState } from "@/lib/state";
import { loadSkillTree, loadAchievements, loadLabCatalog } from "@/lib/references";
import { logLab } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { labId } = (await request.json()) as { labId: string };

    const [state, skillTree, achievements, labCatalog] = await Promise.all([
      loadPlayerState(),
      loadSkillTree(),
      loadAchievements(),
      loadLabCatalog(),
    ]);

    const lab = labCatalog.labs.find((l) => l.id === labId);
    if (!lab) {
      return Response.json({ error: "Lab not found" }, { status: 404 });
    }

    const result = logLab(state, labId, lab, skillTree, achievements);

    if (result.alreadyCompleted) {
      return Response.json({ error: "Lab already completed", result }, { status: 409 });
    }

    await savePlayerState(state);

    return Response.json({ result, player: state });
  } catch (error) {
    console.error("Failed to log lab:", error);
    return Response.json({ error: "Failed to log lab" }, { status: 500 });
  }
}
