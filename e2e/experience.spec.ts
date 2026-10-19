import { test, expect, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";
import {
  createPlaythrough,
  publicView,
  transition,
} from "../src/lib/game-rules/engine";
import { QUESTIONS } from "../src/data/questions";
import type { GameAction, GameId } from "../src/types/game";

declare global {
  interface Window {
    __audioProbe: {
      blocked: number;
      contexts: number;
      effects: { duration: number; loop: boolean }[];
      active: number;
      music?: HTMLAudioElement;
    };
  }
}
// Observe actual Web Audio source starts; retain native decoding/playback and browser policy.
async function probeAudio(page: Page, forceBlocked = false) {
  await page.addInitScript((forceBlocked) => {
    const probe = (window.__audioProbe = {
      blocked: 0,
      contexts: 0,
      effects: [] as { duration: number; loop: boolean }[],
      active: 0,
    });
    let activated = !forceBlocked;
    document.addEventListener(
      "pointerdown",
      (event) => {
        if (event.isTrusted) activated = true;
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (event) => {
        if (event.isTrusted) activated = true;
      },
      true,
    );
    const nativePlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!activated) {
        probe.blocked++;
        return Promise.reject(
          new DOMException("Test autoplay gate", "NotAllowedError"),
        );
      }
      return nativePlay.call(this);
    };
    const NativeContext = window.AudioContext;
    window.AudioContext = class extends NativeContext {
      constructor(options?: AudioContextOptions) {
        super(options);
        probe.contexts++;
      }
      createBufferSource() {
        const source = super.createBufferSource(),
          start = source.start.bind(source),
          stop = source.stop.bind(source);
        let active = false;
        const end = () => {
          if (active) {
            active = false;
            probe.active--;
          }
        };
        source.addEventListener("ended", end);
        source.start = (...args: Parameters<typeof start>) => {
          active = true;
          probe.active++;
          probe.effects.push({
            duration: source.buffer?.duration ?? 0,
            loop: source.loop,
          });
          start(...args);
        };
        source.stop = (...args: Parameters<typeof stop>) => {
          end();
          stop(...args);
        };
        return source;
      }
    };
  }, forceBlocked);
}

// Deterministic browser fixtures exercise every UI branch. Separate tests below use real HTTP/persistence.
async function fixture(page: Page, game?: GameId, random = 0) {
  let state = createPlaythrough();
  let loggedIn = !!game;
  if (game) {
    state = transition(state, { type: "select_game", game });
    state = transition(state, { type: "show_rules" });
  }
  const response = () => ({
    authenticated: loggedIn,
    demo: true,
    state: loggedIn ? publicView(state) : null,
    emailStatus: state.final ? "demo" : null,
  });
  await page.route("**/api/session", (r) => r.fulfill({ json: response() }));
  await page.route("**/api/login", (r) => {
    loggedIn = true;
    return r.fulfill({ json: response() });
  });
  await page.route("**/api/game", (r) => {
    const req = r.request().postDataJSON() as {
      action: GameAction | { type: "new_playthrough" };
    };
    try {
      state =
        req.action.type === "new_playthrough"
          ? createPlaythrough()
          : transition(state, req.action, { randomInt: () => random });
      return r.fulfill({ json: response() });
    } catch (e) {
      return r.fulfill({ status: 409, json: { error: (e as Error).message } });
    }
  });
  return () => state;
}
async function start(page: Page, game: GameId, random = 0) {
  const current = await fixture(page, game, random);
  await page.goto("/");
  await page.getByRole("button", { name: "Start Challenge" }).click();
  return current;
}
async function chooseReward(page: Page) {
  await expect(page.locator(".game-outcome")).toBeVisible();
  await expect(page.locator(".reward-choice")).toHaveCount(0);
  if (await page.locator(".victory-score").count()) {
    await expect(page.locator(".victory-score")).toContainText("10");
    await page.screenshot({
      path: "artifacts/phase3-quiz-victory-desktop.png",
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: "artifacts/phase3-quiz-victory-mobile.png",
      fullPage: true,
    });
  }
  await page.getByRole("button", { name: "Next: Choose Your Reward" }).click();
  await page.getByRole("button", { name: /One special gift/ }).click();
  await page
    .getByLabel(/A gift you have your eye on/)
    .fill("Something thoughtful");
  await page.getByRole("button", { name: "Choose This Reward" }).click();
  await page.getByRole("button", { name: "Yes, This One!" }).click();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await expect(
    page.getByText("AURORA’S OFFICIAL LITTLE HAPPINESS"),
  ).toBeVisible();
}
test("opening, timed manual gift, selection, full rules, photos and mobile layout", async ({
  page,
}) => {
  const current = await fixture(page);
  await page.goto("/");
  await page.getByLabel("Our secret password").fill("aurora");
  await page.getByRole("button", { name: "Unlock My Surprise" }).click();
  await expect(
    page.getByRole("heading", { name: /For my favorite/ }),
  ).toBeVisible();
  await expect(page.locator(".greeting-copy p").last()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(page.locator(".opening .polaroid")).toHaveCount(8);
  await expect
    .poll(() =>
      page
        .locator(".opening .polaroid")
        .evaluateAll((cards) =>
          cards.every(
            (card) =>
              !!card.querySelector(".photo-placeholder") ||
              (card.querySelector("img") as HTMLImageElement)?.naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: "artifacts/garden-desktop.png",
    fullPage: true,
  });
  await expect(
    page.getByRole("button", { name: "Open My Surprise" }),
  ).toBeVisible({ timeout: 15000 });
  expect(current().phase).toBe("hub");
  await page.getByRole("button", { name: "Open My Surprise" }).click();
  await expect(
    page.getByRole("img", { name: /Tom, your illustrated boyfriend/ }),
  ).toBeVisible();
  await expect(page.locator(".tom-character img")).toHaveCount(8);
  await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
    "data-sprite",
    "greeting",
  );
  await page.screenshot({
    path: "artifacts/phase3-greeting-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "artifacts/phase3-greeting-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1050 });
  await expect(page.locator(".wordmark")).toHaveText("Dear Aurora.");
  await page.getByRole("button", { name: "Let’s Play, Tom!" }).click();
  await page.getByRole("button", { name: /Lucky Wheel/ }).click();
  expect(current().phase).toBe("hub");
  await page.getByRole("button", { name: /Dice Challenge/ }).click();
  expect(current().game).toBe("dice");
  await page.screenshot({ path: "artifacts/hub-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "artifacts/hub-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Play This Game" }).click();
  await expect(
    page.getByRole("button", { name: "Start Challenge" }),
  ).toBeVisible();
  expect(current().phase).toBe("rules");
  await page.getByRole("button", { name: "Start Challenge" }).click();
  expect(current().phase).toBe("playing");
  await expect(
    page.getByRole("button", { name: "Roll the Dice" }),
  ).toBeDisabled();
});
test("wheel success, keep reward, screenshot and fresh replay", async ({
  page,
}) => {
  const current = await start(page, "wheel");
  await page.getByRole("button", { name: "Spin the Wheel" }).click();
  await expect(
    page.getByText("One Gift — 500,000–1,000,000 VND", { exact: true }).first(),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/wheel-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Keep This Reward" }).click();
  expect(current().final?.status).toBe("won");
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  const old = current().id;
  await page.screenshot({
    path: "artifacts/finale-desktop.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Play Again" }).click();
  await expect(
    page.getByRole("heading", { name: /For my favorite/ }),
  ).toBeVisible();
  expect(current().id).not.toBe(old);
});
test("wheel no-prize path and begging word counter", async ({ page }) => {
  const current = await start(page, "wheel", 5);
  await page.getByRole("button", { name: "Spin the Wheel" }).click();
  for (let i = 0; i < 2; i++)
    await page.getByRole("button", { name: "Spin Again", exact: true }).click();
  await page.getByRole("button", { name: "Unlock Next Spin" }).click();
  await page
    .getByLabel("Your most convincing words")
    .fill(Array(30).fill("please").join(" "));
  await expect(
    page.getByRole("button", { name: "Please, Tom?" }),
  ).toBeDisabled();
  await page
    .getByLabel("Your most convincing words")
    .fill(Array(31).fill("please").join(" "));
  await page.getByRole("button", { name: "Please, Tom?" }).click();
  expect(current().begging).toHaveLength(1);
  await page.getByRole("button", { name: "Spin Again", exact: true }).click();
  await page
    .getByRole("button", { name: "Finish without a prize", exact: true })
    .click();
  await expect(page.locator(".game-outcome.comfort")).toBeVisible();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await expect(
    page.getByText("AURORA’S OFFICIAL LITTLE HAPPINESS"),
  ).toBeVisible();
  expect(current().final?.status).toBe("lost");
  expect(current().final?.reward).toBeNull();
});
test("dice success unlocks exactly one reward", async ({ page }) => {
  const current = await start(page, "dice");
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await chooseReward(page);
  expect(current().final?.status).toBe("won");
  expect(current().dice.rolls).toHaveLength(1);
});
test("dice loss offers explicit no-prize result on mobile", async ({
  page,
}) => {
  const current = await start(page, "dice");
  await page.setViewportSize({ width: 360, height: 800 });
  await page.getByRole("button", { name: "Odd", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.getByText("1 + 1 = 2", { exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/dice-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: /No more rolls/ }).click();
  expect(current().final?.status).toBe("lost");
});
for (const win of [true, false])
  test(`quiz ${win ? "success" : "failure"} and tenth answer review`, async ({
    page,
  }) => {
    const current = await start(page, "quiz");
    for (let i = 0; i < 10; i++) {
      const q = publicView(current()).quiz.currentQuestion!;
      const key = QUESTIONS.find((x) => x.id === q.id)!.correctAnswer;
      const answer = win ? key : q.options.find((o) => o.label !== key)!.label;
      await page
        .locator(".quiz-options .answer")
        .filter({ hasText: new RegExp(`^${answer}`) })
        .click();
      await expect(page.getByText(/Correct answer:/)).toBeVisible();
      if (i === 0)
        await page.screenshot({
          path: `artifacts/quiz-${win ? "win" : "loss"}.png`,
          fullPage: true,
        });
      await page
        .getByRole("button", {
          name: i === 9 ? "See My Score" : "Next Question",
        })
        .click();
    }
    if (win) {
      await chooseReward(page);
      expect(current().final?.status).toBe("won");
    } else {
      await expect(
        page.getByRole("heading", { name: "0 out of 10" }),
      ).toBeVisible();
      await page
        .getByRole("button", { name: "Finish without a prize" })
        .click();
      expect(current().final?.status).toBe("lost");
    }
  });
test("real HTTP: auth, origin, duplicate operations, reload and logout forfeit", async ({
  request,
}) => {
  expect(
    (
      await request.post("/api/game", {
        headers: { origin: "http://localhost:3000" },
        data: {},
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.post("/api/login", { data: { password: "aurora" } })
    ).status(),
  ).toBe(403);
  const login = await request.post("/api/login", {
    headers: { origin: "http://localhost:3000" },
    data: { password: "aurora" },
  });
  expect(login.ok()).toBe(true);
  let state = (await login.json()).state;
  async function action(action: GameAction, operationId = randomUUID()) {
    const res = await request.post("/api/game", {
      headers: { origin: "http://localhost:3000" },
      data: {
        action,
        expectedVersion: state.version,
        playthroughId: state.id,
        operationId,
      },
    });
    expect(res.ok()).toBe(true);
    state = (await res.json()).state;
    return state;
  }
  await action({ type: "select_game", game: "wheel" });
  await action({ type: "show_rules" });
  await action({ type: "start_game" });
  const payload = {
    action: { type: "spin" },
    expectedVersion: state.version,
    playthroughId: state.id,
    operationId: randomUUID(),
  };
  const results = await Promise.all([
    request.post("/api/game", {
      headers: { origin: "http://localhost:3000" },
      data: payload,
    }),
    request.post("/api/game", {
      headers: { origin: "http://localhost:3000" },
      data: payload,
    }),
  ]);
  for (const r of results) {
    expect(r.ok()).toBe(true);
    expect((await r.json()).state.wheel.spins).toHaveLength(1);
  }
  const reload = await request.get("/api/session");
  expect((await reload.json()).state.wheel.spins).toHaveLength(1);
  const logout = await request.post("/api/logout", {
    headers: { origin: "http://localhost:3000" },
  });
  expect(logout.ok()).toBe(true);
  expect((await (await request.get("/api/session")).json()).authenticated).toBe(
    false,
  );
});

for (const correct of [true, false])
  test(`Sprites: ${correct ? "correct" : "wrong"} answer changes the actual sprite, preserves framing, locks input and returns to idle`, async ({
    page,
  }) => {
    const current = await start(page, "quiz");
    const ids = current().quiz.attempts[0].questionIds;
    const index = ids.indexOf("q1");
    if (index >= 0) [ids[0], ids[index]] = [ids[index], ids[0]];
    else ids[0] = "q1";
    await page.reload();
    await expect(page.locator(".question")).toHaveText(
      "Who loves the other more?",
    );
    const sprites = page.locator(".tom-sprite-stack");
    await expect(sprites).toHaveAttribute("data-sprite", "idle");
    const framing = await sprites.boundingBox();
    await page
      .locator(".quiz-options .answer")
      .filter({ hasText: new RegExp(`^${correct ? "A" : "B"}`) })
      .dblclick();
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-expression",
      correct ? "blushing" : "shocked",
    );
    await expect(sprites).toHaveAttribute(
      "data-sprite",
      correct ? "happy" : "shocked",
    );
    expect(await sprites.boundingBox()).toEqual(framing);
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-gesture",
      correct ? "heart" : "point",
    );
    await expect(page.locator(".tom-speech")).toContainText(
      correct ? "unlimited" : "obsessed",
    );
    expect(current().quiz.attempts[0].answers).toHaveLength(1);
    for (const button of await page.locator(".quiz-options .answer").all())
      await expect(button).toBeDisabled();
    await page.screenshot({
      path: `artifacts/phase3-quiz-${correct ? "correct" : "wrong"}-desktop.png`,
      fullPage: true,
    });
    if (!correct) {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.screenshot({
        path: "artifacts/phase3-quiz-wrong-mobile.png",
        fullPage: true,
      });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const nextButton = page.getByRole("button", { name: "Next Question" });
      await nextButton.scrollIntoViewIfNeeded();
      const dock = await page.locator(".character-zone").boundingBox();
      expect(dock!.y).toBeGreaterThanOrEqual(0);
      expect(
        await nextButton.evaluate((el) => {
          const b = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(
              b.left + b.width / 2,
              b.top + b.height / 2,
            ),
          );
        }),
      ).toBe(true);
    }
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-expression",
      "neutral",
      { timeout: 7500 },
    );
    await expect(page.locator(".tom-character")).toHaveAttribute(
      "data-gesture",
      "none",
    );
    await expect(sprites).toHaveAttribute("data-sprite", "idle");
  });
test("Sprites: dice celebration freezes values, complete raised-arm sprite, particles clean up, Next alone opens rewards", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const current = await start(page, "dice");
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect(page.locator(".frozen-sum")).toHaveText("1 + 1 = 2");
  await expect(page.locator(".reward-choice")).toHaveCount(0);
  await expect(page.locator(".tom-character")).toHaveAttribute(
    "data-expression",
    "celebrating",
  );
  await expect(page.getByTestId("celebration-effects")).toHaveCSS(
    "pointer-events",
    "none",
  );
  await page
    .getByRole("button", { name: "Next: Choose Your Reward" })
    .waitFor();
  await expect(page.locator(".tom-sprite-stack")).toHaveAttribute(
    "data-sprite",
    "excited",
  );
  await expect(page.locator(".tom-sprite.is-active")).toHaveAttribute(
    "src",
    "/assets/tom/sprites/excited.webp",
  );
  await page.screenshot({
    path: "artifacts/phase3-dice-celebration-desktop.png",
    fullPage: true,
  });
  await expect(page.getByTestId("celebration-effects")).toHaveCount(0, {
    timeout: 6500,
  });
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  expect(current().dice.rolls).toHaveLength(1);
  expect(current().final).toBeNull();
  const version = current().version;
  await page.getByRole("button", { name: "Next: Choose Your Reward" }).click();
  await expect(page.locator(".reward-choice")).toBeVisible();
  expect(current().version).toBe(version);
  await page.reload();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  expect(current().dice.rolls).toHaveLength(1);
});
test("Sprites: final dice failure waits for Next and does not refinalize", async ({
  page,
}) => {
  const current = await start(page, "dice");
  await page.setViewportSize({ width: 320, height: 740 });
  await page.getByRole("button", { name: "Odd", exact: true }).click();
  for (let i = 0; i < 5; i++) {
    if (i >= 3) {
      await page.getByRole("button", { name: "Unlock Next Roll" }).click();
      await page.getByLabel("Your most convincing words").fill(
        Array(31)
          .fill(i === 3 ? "please" : "princess")
          .join(" "),
      );
      await page.getByRole("button", { name: "Please, Tom?" }).click();
    }
    await page.getByRole("button", { name: "Roll the Dice" }).click();
  }
  await expect(page.locator(".game-outcome.comfort")).toBeVisible();
  await expect(page.locator(".finale")).toHaveCount(0);
  expect(current().final?.status).toBe("lost");
  expect(current().final?.reward).toBeNull();
  const id = current().final!.id,
    version = current().version;
  await page.screenshot({
    path: "artifacts/phase3-failure-mobile.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await expect(page.locator(".finale")).toBeVisible();
  expect(current().final!.id).toBe(id);
  expect(current().version).toBe(version);
});
test("Sprites: missing photographs retain elegant placeholders", async ({
  page,
}) => {
  await fixture(page);
  await page.route("**/_next/image**", (route) => route.abort());
  await page.goto("/");
  await page.getByLabel("Our secret password").fill("aurora");
  await page.getByRole("button", { name: "Unlock My Surprise" }).click();
  await expect(page.locator(".opening .photo-placeholder")).toHaveCount(8);
  await expect(page.locator(".wordmark")).toHaveText("Dear Aurora.");
});

test("Sprites: decoded poses crossfade in one stable frame during rapid events", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await start(page, "quiz");
  await page.reload();
  const stack = page.locator(".tom-sprite-stack");
  await expect(stack).toHaveAttribute("data-sprite", "idle");
  await expect(page.locator(".adventure-layout")).toHaveCSS("opacity", "1");
  await expect
    .poll(() =>
      stack
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth === 512,
          ),
        ),
    )
    .toBe(true);
  const frame = await stack.boundingBox();
  expect(
    await stack
      .locator("img")
      .first()
      .evaluate((el) => getComputedStyle(el).objectFit),
  ).toBe("contain");
  await page.screenshot({
    path: "artifacts/phase3-idle-desktop.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Give Tom a playful poke" })
    .click({ clickCount: 5 });
  await expect(stack).toHaveAttribute("data-sprite", "happy");
  const next = await stack.boundingBox();
  expect(Math.abs(frame!.width - next!.width)).toBeLessThan(2);
  expect(Math.abs(frame!.height - next!.height)).toBeLessThan(2);
  expect(
    await stack
      .locator(".is-active")
      .evaluate((el) => getComputedStyle(el).transitionProperty),
  ).toContain("opacity");
  await page.locator(".quiz-options .answer").first().click();
  await expect(page.locator(".tom-character")).not.toHaveAttribute(
    "data-expression",
    "laughing",
  );
  await expect(stack.locator(".is-active")).toHaveCount(1);
});

test("Sprites: a delayed next pose retains the previous decoded artwork until ready", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/assets/tom/sprites/shocked.webp", async (route) => {
    await gate;
    await route.continue();
  });
  await fixture(page, "dice");
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Start Challenge" }).click();
  const stack = page.locator(".tom-sprite-stack");
  await expect(stack).toHaveAttribute("data-sprite", "happy");
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(stack).toHaveAttribute("data-requested-sprite", "shocked");
  await expect(stack).toHaveAttribute("data-sprite", "happy");
  release();
  await expect(stack).toHaveAttribute("data-sprite", "shocked");
  await expect(stack).toHaveAttribute("data-sprite", "excited");
  await expect(stack.locator(".is-active")).toHaveCount(1);
});

test("Audio: blocked autoplay unlocks, MP3 decodes and loops, one player persists, all audio mutes and resumes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await probeAudio(page, true);
  await fixture(page, "quiz");
  await page.goto("/");
  const music = page.getByTestId("background-music");
  await expect(music).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => window.__audioProbe.blocked))
    .toBeGreaterThan(0);
  expect(await music.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);
  await expect(music).toHaveAttribute("src", "/assets/music/background.mp3");
  await page.getByRole("button", { name: "Start Challenge" }).click();
  await expect
    .poll(() =>
      music.evaluate(
        (el: HTMLAudioElement) => !el.paused && el.currentTime > 0,
      ),
    )
    .toBe(true);
  await expect
    .poll(() => music.evaluate((el: HTMLAudioElement) => el.duration))
    .toBeGreaterThan(30);
  expect(
    await music.evaluate((el: HTMLAudioElement) => ({
      volume: el.volume,
      loop: el.loop,
      error: el.error,
    })),
  ).toEqual({ volume: 0.35, loop: true, error: null });
  await music.evaluate((el: HTMLAudioElement) => {
    window.__audioProbe.music = el;
    el.currentTime = 10;
  });
  await page.locator(".quiz-options .answer").first().click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) =>
            Math.abs(s.duration - 0.45) < 0.001 ||
            Math.abs(s.duration - 0.28) < 0.001,
        ),
      ),
    )
    .toBe(true);
  expect(await music.evaluate((el) => el === window.__audioProbe.music)).toBe(
    true,
  );
  expect(
    await music.evaluate((el: HTMLAudioElement) => el.currentTime),
  ).toBeGreaterThan(9);
  await page.getByRole("button", { name: "Mute all audio" }).click();
  expect(
    await music.evaluate((el: HTMLAudioElement) => el.paused && el.muted),
  ).toBe(true);
  expect(await page.evaluate(() => window.__audioProbe.active)).toBe(0);
  const position = await music.evaluate(
    (el: HTMLAudioElement) => el.currentTime,
  );
  const count = await page.evaluate(() => window.__audioProbe.effects.length);
  await page.getByRole("button", { name: "Next Question" }).click();
  await page.locator(".quiz-options .answer").first().click();
  expect(await page.evaluate(() => window.__audioProbe.effects.length)).toBe(
    count,
  );
  expect(
    await music.evaluate((el: HTMLAudioElement) => el.currentTime),
  ).toBeCloseTo(position, 1);
  await page.getByRole("button", { name: "Unmute all audio" }).click();
  await expect
    .poll(() => music.evaluate((el: HTMLAudioElement) => !el.paused))
    .toBe(true);
  expect(
    await music.evaluate((el: HTMLAudioElement) => el.currentTime),
  ).toBeGreaterThanOrEqual(position);
  expect(await page.evaluate(() => window.__audioProbe.contexts)).toBe(1);
  await music.evaluate((el: HTMLAudioElement) => {
    el.currentTime = el.duration - 0.15;
  });
  await expect
    .poll(() => music.evaluate((el: HTMLAudioElement) => el.currentTime), {
      timeout: 5000,
    })
    .toBeLessThan(2);
  expect(await music.evaluate((el: HTMLAudioElement) => el.paused)).toBe(false);
  await page.getByRole("button", { name: "Mute all audio" }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Unmute all audio" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next Question" }).click();
  expect(
    await music.evaluate((el: HTMLAudioElement) => el.paused && el.muted),
  ).toBe(true);
  expect(await page.evaluate(() => window.__audioProbe.contexts)).toBe(0);
  expect(requests.some((url) => url.includes("garden.mp3"))).toBe(false);
  await expect(page.locator(".audio-note")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe("Touch audio", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  test("first trusted tap unlocks the supplied music and saved mute survives later taps", async ({
    page,
  }) => {
    await probeAudio(page, true);
    await fixture(page, "dice");
    await page.goto("/");
    const music = page.getByTestId("background-music");
    await expect
      .poll(() => page.evaluate(() => window.__audioProbe.blocked))
      .toBeGreaterThan(0);
    await page.getByRole("button", { name: "Start Challenge" }).tap();
    await expect
      .poll(() =>
        music.evaluate(
          (el: HTMLAudioElement) => !el.paused && el.currentTime > 0,
        ),
      )
      .toBe(true);
    await page.getByRole("button", { name: "Mute all audio" }).tap();
    await page.getByRole("button", { name: "Even", exact: true }).tap();
    await page.getByRole("button", { name: "Roll the Dice" }).tap();
    await expect(page.locator(".game-outcome.victory")).toBeVisible();
    expect(
      await music.evaluate((el: HTMLAudioElement) => el.paused && el.muted),
    ).toBe(true);
    expect(await page.evaluate(() => window.__audioProbe.active)).toBe(0);
    await page.getByRole("button", { name: "Unmute all audio" }).tap();
    await expect
      .poll(() => music.evaluate((el: HTMLAudioElement) => !el.paused))
      .toBe(true);
  });
});

test("Audio: wheel ticks end on outcome; dice, victory, reward and ending use decoded effects", async ({
  page,
}) => {
  await probeAudio(page);
  await start(page, "wheel");
  await page.getByRole("button", { name: "Spin the Wheel" }).click();
  await expect(
    page.getByRole("button", { name: "Keep This Reward" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => s.loop && Math.abs(s.duration - 0.42) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => !s.loop && Math.abs(s.duration - 0.5) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Keep This Reward" }).click();
  await page.getByRole("button", { name: "Next: Our Little Ending" }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => Math.abs(s.duration - 1.15) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await page.unrouteAll({ behavior: "wait" });
  await start(page, "dice");
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => Math.abs(s.duration - 0.95) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => Math.abs(s.duration - 1.5) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await chooseReward(page);
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => Math.abs(s.duration - 0.75) < 0.001,
        ),
      ),
    )
    .toBe(true);
});

test("Audio: mobile first interaction and graceful missing music keep the experience usable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await probeAudio(page, true);
  await fixture(page, "dice");
  await page.route("**/assets/music/background.mp3", (route) =>
    route.fulfill({ status: 404, body: "Unavailable" }),
  );
  await page.goto("/");
  await expect(page.locator(".audio-note")).toContainText(
    "Background music is unavailable",
  );
  await page.getByRole("button", { name: "Start Challenge" }).click();
  await page.getByRole("button", { name: "Even", exact: true }).click();
  await page.getByRole("button", { name: "Roll the Dice" }).click();
  await expect(page.locator(".game-outcome.victory")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__audioProbe.effects.some(
          (s) => Math.abs(s.duration - 1.5) < 0.001,
        ),
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "Mute all audio" }).click();
  expect(await page.evaluate(() => window.__audioProbe.active)).toBe(0);
});
