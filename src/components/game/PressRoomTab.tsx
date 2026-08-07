import { PRESS_ROOM_ACTIONS } from "@/lib/game/pressRoom";
import type { PressRoomActionId } from "@/lib/game/pressRoom";
import type { GameState } from "@/lib/game/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PressRoomTab({
  g, onAction,
}: {
  g: GameState;
  onAction: (action: PressRoomActionId, horseId?: number) => void;
}) {
  return (
    <div>
      <div className="font-mono px-3.5 pt-2.5 text-muted text-xs">
        Go and make some noise — or don&apos;t. Each of these is worth doing once a day.
      </div>
      {PRESS_ROOM_ACTIONS.map(a => {
        const used = !!g.pressRoomUsed[a.id];
        return (
          <Card key={a.id}>
            <div className="font-bold text-base">{a.label}</div>
            <div className="font-mono text-[11.5px] text-muted-dim mb-1.5">{a.blurb}</div>
            {a.id === "talkUp" ? (
              <div className="flex gap-1.5 flex-wrap">
                {g.horses.map(h => (
                  <Button key={h.id} disabled={used} onClick={() => onAction(a.id, h.id)}>
                    TALK UP {h.name.toUpperCase()}
                  </Button>
                ))}
              </div>
            ) : (
              <Button disabled={used} onClick={() => onAction(a.id)}>
                {used ? "ALREADY DONE TODAY" : a.label.toUpperCase()}
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
