const { test, expect } = require("@playwright/test");

const SETTINGS_KEY = "meeting-english-coach-settings";
const HISTORY_KEY = "meeting-english-coach-history";
const BOOKMARKS_KEY = "meeting-english-coach-bookmarks";

function createSilentWavBuffer(durationSeconds = 1, sampleRate = 8000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const numSamples = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  return buffer;
}

function createAudioFilePayload(name, durationSeconds = 1) {
  return {
    name,
    mimeType: "audio/wav",
    buffer: createSilentWavBuffer(durationSeconds)
  };
}

function createAnalysisPayload(label) {
  return {
    learning_summary: {
      main_takeaway_zh: `先練習更自然地說 ${label}`,
      top_3_habits_to_improve: [
        {
          habit_zh: "少用太直接的句型",
          why_it_matters_zh: "這樣比較像真實會議裡的自然表達。",
          replacement_patterns: ["Could we...", "Would it make sense to...", "I'd suggest..."]
        }
      ],
      practice_before_next_meeting: [
        {
          sentence: `Could we review ${label} together?`,
          zh_translation: `我們可以一起看一下 ${label} 嗎？`,
          use_case_zh: "想請對方一起確認某件事。",
          tone: "polite"
        }
      ]
    },
    annotated_transcript: [
      {
        line_id: 1,
        original: `maybe we can check ${label}`,
        has_issue: true,
        suggested_version: `Could we check ${label}?`,
        spoken_version: `Could we check ${label}?`,
        professional_version: `Could we review ${label} before we decide?`,
        zh_translation: `我們可以先確認 ${label} 嗎？`,
        use_case_zh: "想禮貌提出檢查事項。",
        learning_note_zh: "把 maybe 改成 could we，會更自然也更有組織。",
        short_reason: "This sounds more confident in a meeting.",
        memory_tip: "少一點 maybe，多一點 could we。",
        meeting_example: `Could we check ${label} before Friday?`,
        difficulty: "easy",
        severity: "medium",
        category: "phrasing",
        impact: "confidence",
        issue_refs: [0]
      }
    ],
    issues: [
      {
        id: 0,
        original: `maybe we can check ${label}`,
        original_context: `I think maybe we can check ${label} before we move on.`,
        better: `Could we check ${label}?`,
        better_sentence: `Could we check ${label} before we move on?`,
        suggestions: [`Could we check ${label}?`],
        spoken_version: `Could we check ${label}?`,
        professional_version: `Could we review ${label} before we move on?`,
        zh_translation: `我們可以先確認 ${label} 嗎？`,
        reason_en: "maybe can sound hesitant in a meeting.",
        reason_zh: "maybe 會讓語氣聽起來比較沒把握。",
        learning_note_zh: "把請求換成 could we 會更像真實會議裡的自然說法。",
        memory_tip: "有請求時，先想 could we。",
        meeting_example: `Could we check ${label} before Friday?`,
        use_case_zh: "想請團隊先確認一件事。",
        category: "phrasing",
        severity: "medium",
        impact: "confidence",
        difficulty: "easy"
      }
    ],
    summary: {
      total_issues: 1,
      top_patterns: [
        {
          pattern: "Hesitant requests",
          description: "The speaker sounds slightly hesitant.",
          description_en: "The speaker sounds slightly hesitant.",
          description_zh: "提出請求時語氣稍微不夠俐落。",
          try_this: `Could we check ${label} before we move on?`,
          example_from_transcript: `maybe we can check ${label}`
        }
      ],
      filler_summary: {
        high_frequency_expressions: [],
        note: "",
        note_zh: ""
      },
      overall_rating: "developing",
      encouragement: "The message is understandable.",
      encouragement_zh: "意思很清楚，再把請求句型練順就會更自然。"
    }
  };
}

function buildGeminiResponse(text, finishReason = "STOP") {
  return {
    candidates: [
      {
        content: {
          parts: [{ text }]
        },
        finishReason
      }
    ]
  };
}

async function seedLocalStorage(page) {
  await page.addInitScript(
    ({ settingsKey, historyKey, bookmarksKey }) => {
      localStorage.setItem(
        settingsKey,
        JSON.stringify({
          apiKey: "fake-gemini-key",
          useProxy: false,
          endpointOverride: ""
        })
      );
      localStorage.removeItem(historyKey);
      localStorage.removeItem(bookmarksKey);
    },
    {
      settingsKey: SETTINGS_KEY,
      historyKey: HISTORY_KEY,
      bookmarksKey: BOOKMARKS_KEY
    }
  );
}

async function goToBatchTab(page) {
  await page.goto("/");
  await page.locator('.tab[data-tab="batch"]').click();
  await expect(page.locator("#main-panel")).toContainText("批次處理");
}

async function installGeminiMock(page, handler) {
  await page.route("https://generativelanguage.googleapis.com/**", async (route) => {
    const request = route.request();
    const body = request.postDataJSON();
    const parts = body?.contents?.[0]?.parts || [];
    const hasInlineAudio = parts.some((part) => part.inline_data);
    const textPayload = parts.filter((part) => typeof part.text === "string").map((part) => part.text).join("\n");
    const kind = hasInlineAudio ? "transcription" : textPayload.includes("Say: OK") ? "connection" : "analysis";
    const result = await handler({ route, request, body, kind, textPayload });

    if (result === "handled") return;

    if (result?.status) {
      await route.fulfill({
        status: result.status,
        contentType: "application/json",
        body: JSON.stringify(result.body || {
          error: {
            code: result.status,
            message: result.message || "mock failure",
            status: "ERROR"
          }
        })
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(result)
    });
  });
}

test.beforeEach(async ({ page }) => {
  await seedLocalStorage(page);
});

test("停止後可以繼續處理剩餘項目", async ({ page }) => {
  let transcriptionCount = 0;
  let analysisCount = 0;

  await installGeminiMock(page, async ({ kind }) => {
    if (kind === "transcription") {
      transcriptionCount += 1;
      if (transcriptionCount === 1) {
        await new Promise((resolve) => setTimeout(resolve, 400));
      }
      return buildGeminiResponse(`maybe we can check chunk ${transcriptionCount}`);
    }

    if (kind === "analysis") {
      analysisCount += 1;
      return buildGeminiResponse(JSON.stringify(createAnalysisPayload(`chunk ${analysisCount}`)));
    }

    return buildGeminiResponse("OK");
  });

  await goToBatchTab(page);
  await page.locator("#batch-file-input").setInputFiles([
    createAudioFilePayload("chunk-1.wav"),
    createAudioFilePayload("chunk-2.wav")
  ]);

  await page.locator('[data-action="queue-start"]').click();
  await expect(page.locator('[data-action="queue-stop"]')).toBeVisible();
  await page.locator('[data-action="queue-stop"]').click();

  await expect(page.locator("#main-panel")).toContainText("處理已暫停");
  await expect(page.locator("#main-panel")).toContainText("還有 1 個待處理");
  await expect(page.locator('[data-action="queue-start"]')).toContainText("繼續處理剩餘項目");

  await page.locator('[data-action="queue-start"]').click();
  await expect(page.locator("#main-panel")).toContainText("2 個完成");
  await expect(page.locator('[data-action="queue-view-history"]')).toBeVisible();
});

test("部分成功與部分失敗時，佇列會繼續並顯示摘要", async ({ page }) => {
  let transcriptionCount = 0;

  await installGeminiMock(page, async ({ kind }) => {
    if (kind === "transcription") {
      transcriptionCount += 1;
      if (transcriptionCount === 1) {
        return buildGeminiResponse("maybe we can check first item");
      }
      return {
        status: 503,
        message: "mock unavailable"
      };
    }

    if (kind === "analysis") {
      return buildGeminiResponse(JSON.stringify(createAnalysisPayload("first item")));
    }

    return buildGeminiResponse("OK");
  });

  await goToBatchTab(page);
  await page.locator("#batch-file-input").setInputFiles([
    createAudioFilePayload("success.wav"),
    createAudioFilePayload("fail.wav")
  ]);

  await page.locator('[data-action="queue-start"]').click();

  await expect(page.locator("#main-panel")).toContainText("1 個完成，1 個失敗");
  await expect(page.locator("#main-panel")).toContainText("成功寫入回顧紀錄");
  await expect(page.locator("#main-panel")).toContainText("需要重新處理的項目");
  await expect(page.locator("#main-panel")).toContainText("fail.wav");
});

test("查看回顧紀錄按鈕會切到回顧紀錄並看得到新項目", async ({ page }) => {
  await installGeminiMock(page, async ({ kind }) => {
    if (kind === "transcription") {
      return buildGeminiResponse("maybe we can review the timeline");
    }
    if (kind === "analysis") {
      return buildGeminiResponse(JSON.stringify(createAnalysisPayload("timeline")));
    }
    return buildGeminiResponse("OK");
  });

  await goToBatchTab(page);
  await page.locator("#batch-file-input").setInputFiles([
    createAudioFilePayload("review-me.wav")
  ]);

  await page.locator('[data-action="queue-start"]').click();
  await expect(page.locator('[data-action="queue-view-history"]')).toBeVisible();
  await page.locator('[data-action="queue-view-history"]').click();

  await expect(page.locator('.tab.active[data-tab="history"]')).toBeVisible();
  await expect(page.locator("#main-panel")).toContainText("回顧紀錄");
  await expect(page.locator("#main-panel")).toContainText("review-me.wav");
});

test("清除佇列會回到空狀態", async ({ page }) => {
  await installGeminiMock(page, async ({ kind }) => {
    if (kind === "transcription") {
      return buildGeminiResponse("maybe we can check the queue");
    }
    if (kind === "analysis") {
      return buildGeminiResponse(JSON.stringify(createAnalysisPayload("queue")));
    }
    return buildGeminiResponse("OK");
  });

  await goToBatchTab(page);
  await page.locator("#batch-file-input").setInputFiles([
    createAudioFilePayload("clear-1.wav"),
    createAudioFilePayload("clear-2.wav")
  ]);

  await expect(page.locator("#main-panel .issue-card")).toHaveCount(2);
  await page.locator('[data-action="queue-clear"]').click();
  await expect(page.locator("#main-panel")).toContainText("目前還沒有加入任何檔案");
  await expect(page.locator("#main-panel .issue-card")).toHaveCount(0);
});

test("切換 tab 後回來，批次佇列狀態仍保持一致", async ({ page }) => {
  let firstTranscription = true;

  await installGeminiMock(page, async ({ kind }) => {
    if (kind === "transcription") {
      if (firstTranscription) {
        firstTranscription = false;
        await new Promise((resolve) => setTimeout(resolve, 700));
      }
      return buildGeminiResponse("maybe we can align on the schedule");
    }
    if (kind === "analysis") {
      return buildGeminiResponse(JSON.stringify(createAnalysisPayload("schedule")));
    }
    return buildGeminiResponse("OK");
  });

  await goToBatchTab(page);
  await page.locator("#batch-file-input").setInputFiles([
    createAudioFilePayload("tab-stability.wav")
  ]);

  await page.locator('[data-action="queue-start"]').click();
  await expect(page.locator('[data-action="queue-stop"]')).toBeVisible();

  await page.locator('.tab[data-tab="settings"]').click();
  await expect(page.locator("#main-panel")).toContainText("Gemini API key");

  await page.locator('.tab[data-tab="batch"]').click();
  await expect(page.locator("#main-panel")).toContainText("tab-stability.wav");
  await expect(page.locator("#main-panel")).toContainText(/讀取中|轉錄中|分析中|完成/);

  await expect(page.locator('[data-action="queue-view-history"]')).toBeVisible();
  await expect(page.locator("#main-panel")).toContainText("1 個完成");
});
