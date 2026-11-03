import type { PlanLevel } from "@/lib/titles";

const accessLevelOrder: Record<PlanLevel, number> = {
	FREE: 0,
	BASIC: 1,
	PREMIUM: 2,
};

export function hasPlanAccess(currentLevel: PlanLevel, requiredLevel: PlanLevel) {
	return accessLevelOrder[currentLevel] >= accessLevelOrder[requiredLevel];
}
