import { describe, expect, it } from "vitest";
import { createPlaythrough, transition } from "../game-rules/engine";
import { escapeHtml, resultEmail } from "./template";

describe("result notification content", () => {
  it("has a plain-text audit, correct result subject, and escaped HTML", () => {
    let state = transition(createPlaythrough(), {
      type: "select_game",
      game: "wheel",
    });
    state = transition(state, { type: "show_rules" });
    state = transition(state, { type: "start_game" });
    state = transition(state, { type: "forfeit" });
    state.final!.preference = "<script>private preference</script>";
    const email = resultEmail(state);
    expect(email.subject).toContain("forfeited");
    expect(email.text).toContain(state.id);
    expect(email.text).toContain("Asia/Ho_Chi_Minh");
    expect(email.text).toContain("Begging unlocks: 0");
    expect(email.html).not.toContain("<script>");
    expect(email.html).toContain("&lt;script&gt;");
    expect(escapeHtml("Tom & Aurora")).toBe("Tom &amp; Aurora");
  });

  it("does not generate a notification before finalization", () => {
    expect(() => resultEmail(createPlaythrough())).toThrow("Only finalized");
  });
});
