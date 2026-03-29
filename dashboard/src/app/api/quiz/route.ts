import { loadPlayerState, savePlayerState } from "@/lib/state";
import { loadSkillTree, loadAchievements } from "@/lib/references";
import { submitQuizAnswer } from "@/lib/engine";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { questionId, quality } = (await request.json()) as {
      questionId: string;
      quality: number;
    };

    if (quality < 0 || quality > 5) {
      return Response.json({ error: "Quality must be 0-5" }, { status: 400 });
    }

    const [state, skillTree, achievements] = await Promise.all([
      loadPlayerState(),
      loadSkillTree(),
      loadAchievements(),
    ]);

    const result = submitQuizAnswer(state, questionId, quality, skillTree, achievements);

    await savePlayerState(state);

    return Response.json({ result, player: state });
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return Response.json({ error: "Failed to submit quiz answer" }, { status: 500 });
  }
}
