import { loadPlayerState } from "@/lib/state";
import { loadSkillTree, loadAchievements, loadXPTables, loadLabCatalog, loadQuizBank } from "@/lib/references";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [playerState, skillTree, achievements, xpTables, labCatalog, quizBank] =
      await Promise.all([
        loadPlayerState(),
        loadSkillTree(),
        loadAchievements(),
        loadXPTables(),
        loadLabCatalog(),
        loadQuizBank(),
      ]);

    return Response.json({
      player: playerState,
      skillTree,
      achievements,
      xpTables,
      labCatalog,
      quizBank,
    });
  } catch (error) {
    console.error("Failed to load state:", error);
    return Response.json(
      { error: "Failed to load game state" },
      { status: 500 }
    );
  }
}
