import { loadPlayerState, savePlayerState } from "@/lib/state";
import { loadSkillTree, loadAchievements, loadLabCatalog } from "@/lib/references";
import { logLab } from "@/lib/engine";
import { getLevelForXP } from "@/lib/calculations";

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

export async function DELETE(request: Request) {
  try {
    const { labId } = (await request.json()) as { labId: string };

    const [state, labCatalog] = await Promise.all([
      loadPlayerState(),
      loadLabCatalog(),
    ]);

    const lab = labCatalog.labs.find((l) => l.id === labId);
    if (!lab) {
      return Response.json({ error: "Lab not found" }, { status: 404 });
    }

    const topicId = lab.topic;
    const difficulty = lab.difficulty as "apprentice" | "practitioner" | "expert";
    const topicProg = state.progress[topicId];

    if (!topicProg?.[difficulty]?.completed.includes(labId)) {
      return Response.json({ error: "Lab not completed" }, { status: 404 });
    }

    // Remove from completed
    topicProg[difficulty]!.completed = topicProg[difficulty]!.completed.filter((id) => id !== labId);

    // Deduct XP
    const baseXP = difficulty === "expert" ? 500 : difficulty === "practitioner" ? 250 : 100;
    state.player.total_xp = Math.max(0, state.player.total_xp - baseXP);
    state.stats.total_labs = Math.max(0, state.stats.total_labs - 1);

    // Recalc level
    const levelInfo = getLevelForXP(state.player.total_xp);
    state.player.level = levelInfo.level;
    state.player.title = levelInfo.title;

    await savePlayerState(state);

    return Response.json({ success: true, player: state });
  } catch (error) {
    console.error("Failed to undo lab:", error);
    return Response.json({ error: "Failed to undo lab" }, { status: 500 });
  }
}
