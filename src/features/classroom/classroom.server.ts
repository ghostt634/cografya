import fs from "fs";
import path from "path";
import crypto from "crypto";
import { z } from "zod";
import type { ClassroomRequest } from "./classroom.functions";
import type {
  RoomState,
  Settings,
  Team,
  VisualQuestion,
  RoomView,
  Capability,
  Player,
  JokerType,
  CoinAward,
} from "./types";
import {
  eligible,
  ranked,
  letters,
  JOKER_PRICES,
  calculateCoinReward,
  DEFAULT_ACTIVE_JOKERS,
  TEAM_COLORS,
} from "./types";
import { questions as defaultQuestions, type Letter } from "@/data/questions";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "classroom_store.json");

interface StoredRoom {
  id: string;
  pin: string;
  workspace_id: string;
  host_hash: string;
  mode: "live" | "teams";
  state: RoomState;
  version: number;
  created_at: string;
  expires_at: string;
  players: Record<
    string,
    { id: string; name: string; token_hash: string; seen_at: string; removed: boolean }
  >;
  answers: Record<
    string,
    {
      player_id: string;
      question_id: number;
      choice: Letter;
      points: number;
      correct: boolean;
      created_at: string;
    }
  >;
  adjustments: { team_id: string; delta: number; reason: string; created_at: string }[];
}

interface StoredWorkspace {
  id: string;
  token_hash: string;
  created_at: string;
}

interface ClassroomDatabase {
  workspaces: Record<string, StoredWorkspace>;
  rooms: Record<string, StoredRoom>;
  edits: Record<string, Record<number, Partial<VisualQuestion>>>;
}

// In-memory cache backed by local disk storage
let memoryDb: ClassroomDatabase | null = null;
let saveTimeout: NodeJS.Timeout | null = null;

function loadStore(): ClassroomDatabase {
  if (memoryDb) return memoryDb;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      memoryDb = JSON.parse(raw);
    }
  } catch (err) {
    console.warn("[ClassroomStore] Failed to read store from disk, initializing fresh", err);
  }

  if (!memoryDb) {
    memoryDb = { workspaces: {}, rooms: {}, edits: {} };
  }
  return memoryDb;
}

function persistStore() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const tmpFile = `${STORE_FILE}.tmp`;
      await fs.promises.writeFile(tmpFile, JSON.stringify(memoryDb, null, 2), "utf-8");
      await fs.promises.rename(tmpFile, STORE_FILE);
    } catch (e) {
      console.error("[ClassroomStore] Disk persistence failed", e);
    }
  }, 100);
}

const settingsSchema = z.object({
  units: z.array(z.number().int().min(1).max(7)).min(1),
  difficulties: z.array(z.enum(["kolay", "orta", "zor"])).min(1),
  count: z.number().int().min(1).max(42),
  random: z.boolean(),
  seconds: z.union([
    z.literal(0),
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(30),
    z.literal(45),
    z.literal(60),
  ]),
  explanations: z.boolean(),
  autoClose: z.boolean(),
  leaderboard: z.boolean(),
  steal: z.boolean().optional(),
  manualTurn: z.boolean(),
  coins: z.boolean().optional(),
  jokerShop: z.boolean().optional(),
  activeJokersList: z
    .array(
      z.enum([
        "doubleAnswer",
        "halfAndHalf",
        "extraTime",
        "hint",
        "switchQuestion",
        "doublePoints",
      ]),
    )
    .optional(),
  skipAnimations: z.boolean().optional(),
  sound: z.boolean().optional(),
});

const generateToken = () =>
  crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

async function hashToken(s: string): Promise<string> {
  return crypto.createHash("sha256").update(s).digest("hex");
}

const cleanName = (s: string) => {
  const n = s.trim().replace(/\s+/g, " ");
  if (!n || n.length > 30) throw new Error("Ad 1–30 karakter olmalı.");
  return n;
};

function getQuestionBank(workspaceId: string): VisualQuestion[] {
  const db = loadStore();
  const overrides = db.edits[workspaceId] ?? {};
  return defaultQuestions.map((q) => {
    const edit = overrides[q.id];
    return {
      ...q,
      ...(edit ?? {}),
      id: q.id,
      unit: q.unit,
      difficulty: q.difficulty,
      points: q.points,
    } as VisualQuestion;
  });
}

function findRoom(key: string): StoredRoom {
  const db = loadStore();
  const cleanKey = key.trim();
  if (/^\d{6}$/.test(cleanKey)) {
    const found = Object.values(db.rooms).find((r) => r.pin === cleanKey);
    if (found) return found;
  }
  const found = db.rooms[cleanKey];
  if (!found) throw new Error("Oda bulunamadı. PIN veya oda kodunu kontrol edin.");
  if (new Date(found.expires_at) < new Date()) throw new Error("Bu odanın süresi doldu.");
  return found;
}

function deadline(s: RoomState) {
  s.paused = false;
  s.remaining = null;
  s.deadline = s.settings.seconds
    ? new Date(Date.now() + s.settings.seconds * 1000).toISOString()
    : null;
}

function remember(s: RoomState) {
  const prior = JSON.parse(JSON.stringify(s));
  prior.history = [];
  s.history = [...(s.history ?? []).slice(-20), prior];
}

async function authorize(kind: "workspace" | "host" | "player", key: string, cap?: Capability) {
  if (!cap?.token) throw new Error("Bu ekran için oturum gerekli.");
  const db = loadStore();
  const hashed = await hashToken(cap.token);

  if (kind === "workspace") {
    const ws = db.workspaces[key];
    if (!ws || ws.token_hash !== hashed)
      throw new Error("Öğretmen oturumu geçersiz veya süresi dolmuş.");
    return;
  }

  const room = findRoom(key);
  if (kind === "host") {
    const isDirectHost = room.host_hash === hashed;
    const ws = db.workspaces[room.workspace_id];
    const isWorkspaceOwner = ws && ws.token_hash === hashed;
    if (!isDirectHost && !isWorkspaceOwner) {
      throw new Error("Öğretmen/yönetici oturumu doğrulanamadı.");
    }
  } else {
    const player = room.players[cap.id];
    if (!player || player.token_hash !== hashed || player.removed) {
      throw new Error("Oyuncu oturumu geçersiz veya odadan çıkarılmışsınız.");
    }
  }
}

function buildRoomView(room: StoredRoom, cap?: Capability, host = false): RoomView {
  const s = room.state;
  const q = s.questions[s.index];
  const playerList = Object.values(room.players).filter((p) => !p.removed);
  const answerList = Object.values(room.answers);
  const currAnswers = answerList.filter((a) => a.question_id === q?.id);

  // Auto-close question if timer expired
  const expired =
    s.phase === "open" && !s.paused && s.deadline && Date.parse(s.deadline) <= Date.now();

  if (room.mode === "live" && s.phase === "open" && !s.paused) {
    const allAnswered =
      s.settings.autoClose && playerList.length > 0 && currAnswers.length >= playerList.length;
    if (expired || allAnswered) {
      s.phase = "closed";
      s.deadline = null;
      room.version++;
      persistStore();
    }
  }

  if (room.mode === "teams" && s.phase === "open" && !s.paused && expired) {
    remember(s);
    s.phase = "closed";
    s.deadline = null;
    room.version++;
    persistStore();
  }

  const reveal = s.phase === "closed" || s.phase === "finished";

  // Build ranked players
  const players = ranked(
    playerList.map((p) => {
      const pAnswers = answerList.filter((a) => a.player_id === p.id);
      const answeredCurr = currAnswers.some((a) => a.player_id === p.id);
      const isConnected = Date.now() - Date.parse(p.seen_at) < 25000;
      const score = pAnswers
        .filter((a) => reveal || a.question_id !== q?.id)
        .reduce((n, a) => n + a.points, 0);
      const correct = pAnswers.filter(
        (a) => a.correct && (reveal || a.question_id !== q?.id),
      ).length;
      const myChoice = currAnswers.find((a) => a.player_id === p.id)?.choice;

      return {
        id: p.id,
        name: p.name,
        answered: answeredCurr,
        connected: isConnected,
        score,
        correct,
        ...(reveal ? { choice: myChoice } : {}),
      };
    }),
  ) as Player[];

  const mine = host ? undefined : players.find((p) => p.id === cap?.id);

  // SANITIZE QUESTION: NEVER expose correctAnswer or explanation before closure/finish!
  let question: RoomView["question"] = null;
  if (q && !["lobby", "board"].includes(s.phase)) {
    const { correctAnswer, explanation, hint, ...safeQuestion } = q;
    question = {
      ...safeQuestion,
      ...(reveal
        ? {
            correctAnswer,
            explanation: s.settings.explanations || s.phase === "finished" ? explanation : "",
          }
        : {}),
      // Reveal hint if joker was used or if host view
      ...(s.activeJokers?.hintRevealed || host ? { hint } : {}),
    };
  }

  const distribution = reveal
    ? letters.map((l) => currAnswers.filter((a) => a.choice === l).length)
    : [];

  return {
    id: room.id,
    pin: room.pin,
    mode: room.mode,
    phase: s.phase,
    question,
    index: s.index,
    total: s.questions.length,
    deadline: s.deadline,
    paused: s.paused,
    remaining: s.remaining,
    teams: ranked(s.teams ?? []),
    active: s.active,
    used: s.used,
    board: s.questions.map((item) => ({
      id: item.id,
      unit: item.unit,
      difficulty: item.difficulty,
      points: item.points,
    })),
    settings: s.settings,
    signal: s.signal,
    players,
    mine,
    distribution,
    stealing: s.stealing,
    choices: s.choices,
    activeJokers: s.activeJokers ?? {},
    lastCoinAward: s.lastCoinAward ?? null,
    version: room.version,
  };
}

export async function handleClassroom(req: ClassroomRequest) {
  try {
    const db = loadStore();

    // 1. WORKSPACE: Create teacher workspace
    if (req.op === "workspace") {
      const id = crypto.randomUUID();
      const token = generateToken();
      db.workspaces[id] = {
        id,
        token_hash: await hashToken(token),
        created_at: new Date().toISOString(),
      };
      persistStore();
      return { cap: { id, token } };
    }

    // 2. TEACHER PRIVILEGED OPERATIONS
    if (["bank", "edit", "rooms", "create"].includes(req.op)) {
      const c = req.cap;
      if (!c) throw new Error("Öğretmen oturumu gerekli.");
      await authorize("workspace", c.id, c);

      // GET QUESTION BANK
      if (req.op === "bank") {
        return { bank: getQuestionBank(c.id) };
      }

      // EDIT QUESTION IN BANK
      if (req.op === "edit") {
        const input = z
          .object({
            id: z.number().int().min(1).max(42),
            question: z.string().trim().min(5).max(3000),
            options: z.array(z.string().trim().min(1).max(1500)).length(5),
            correctAnswer: z.enum(["A", "B", "C", "D", "E"]),
            explanation: z.string().trim().min(5).max(3000),
            hint: z.string().trim().max(1000).optional(),
            imageUrl: z.string().trim().optional(),
            imageAlt: z.string().trim().optional(),
          })
          .parse(req.data);

        // Validate 5 distinct options
        const uniqueOptions = new Set(input.options.map((o) => o.toLowerCase()));
        if (uniqueOptions.size !== 5) {
          throw new Error("Seçenekler birbirinden farklı olmalıdır.");
        }

        db.edits[c.id] ??= {};
        db.edits[c.id][input.id] = input as Partial<VisualQuestion>;
        persistStore();
        return { bank: getQuestionBank(c.id) };
      }

      // LIST WORKSPACE ROOMS
      if (req.op === "rooms") {
        const rooms = Object.values(db.rooms)
          .filter((r) => r.workspace_id === c.id)
          .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
          .slice(0, 30)
          .map((r) => ({
            id: r.id,
            pin: r.pin,
            mode: r.mode,
            phase: r.state.phase,
          }));
        return { rooms };
      }

      // CREATE NEW ROOM (LIVE OR TEAMS)
      const d = z
        .object({
          mode: z.enum(["live", "teams"]),
          settings: settingsSchema,
          teams: z
            .array(
              z.object({
                name: z.string(),
                members: z.array(z.string()).optional(),
                color: z.string().optional(),
              }),
            )
            .optional(),
          active: z.number().int().optional(),
        })
        .parse(req.data);

      const qs = eligible(getQuestionBank(c.id), d.settings);
      if (d.settings.count > qs.length) {
        throw new Error(
          `Seçili ünite ve zorluk havuzunda ${qs.length} soru var. Soru sayısını azaltın.`,
        );
      }

      // Randomize if requested
      if (d.settings.random) {
        for (let i = qs.length - 1; i > 0; i--) {
          const j = crypto.randomInt(0, i + 1);
          [qs[i], qs[j]] = [qs[j], qs[i]];
        }
      }

      // Initialize teams with coin wallet & joker inventory & customizable color
      const teams: Team[] = (d.teams ?? []).map((t, i) => {
        const defaultColor = TEAM_COLORS[i % TEAM_COLORS.length].id;
        return {
          id: String(i + 1),
          name: cleanName(t.name),
          members: (t.members ?? []).map(cleanName),
          color: t.color || defaultColor,
          score: 0,
          correct: 0,
          coins: 0,
          coinsEarned: 0,
          coinsSpent: 0,
          jokers: {
            doubleAnswer: 0,
            halfAndHalf: 0,
            extraTime: 0,
            hint: 0,
            switchQuestion: 0,
            doublePoints: 0,
          },
          jokersUsed: 0,
        };
      });

      if (d.mode === "teams") {
        if (teams.length < 2 || teams.length > 8) {
          throw new Error("Takım yarışması için 2 ile 8 arasında takım oluşturun.");
        }
        const nameSet = new Set(teams.map((t) => t.name.toLocaleLowerCase("tr")));
        if (nameSet.size !== teams.length) {
          throw new Error("Takım isimleri birbirinden farklı olmalıdır.");
        }
      }

      const roomId = crypto.randomUUID();
      const hostToken = generateToken();

      // Generate unique 6-digit PIN
      let pin = "";
      for (let attempt = 0; attempt < 10; attempt++) {
        const candidate = String(crypto.randomInt(100000, 999999));
        if (!Object.values(db.rooms).some((r) => r.pin === candidate)) {
          pin = candidate;
          break;
        }
      }
      if (!pin) pin = String(Date.now()).slice(-6);

      const initialState: RoomState = {
        questions: qs.slice(0, d.settings.count),
        settings: {
          ...d.settings,
          steal: false,
          coins: d.settings.coins ?? true,
          jokerShop: d.settings.jokerShop ?? true,
          activeJokersList:
            (d.settings.activeJokersList as JokerType[]) ?? DEFAULT_ACTIVE_JOKERS,
          skipAnimations: d.settings.skipAnimations ?? false,
          sound: d.settings.sound ?? false,
        },
        phase: d.mode === "live" ? "lobby" : "board",
        index: 0,
        deadline: null,
        paused: false,
        remaining: null,
        teams,
        active: Math.min(Math.max(d.active ?? 0, 0), Math.max(0, teams.length - 1)),
        used: [],
        choices: {},
        stealing: null,
        awarded: false,
        activeJokers: {},
        questionStartTime: null,
        lastCoinAward: null,
        history: [],
        signal: crypto.randomUUID(),
      };

      const newRoom: StoredRoom = {
        id: roomId,
        pin,
        workspace_id: c.id,
        host_hash: await hashToken(hostToken),
        mode: d.mode,
        state: initialState,
        version: 1,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        players: {},
        answers: {},
        adjustments: [],
      };

      db.rooms[roomId] = newRoom;
      persistStore();

      const cap = { id: roomId, token: hostToken };
      return {
        cap,
        room: buildRoomView(newRoom, cap, true),
      };
    }

    // 3. JOIN ROOM (STUDENT MOBILE)
    if (req.op === "join") {
      const room = findRoom(req.key ?? "");
      const s = room.state;
      if (room.mode !== "live" || s.phase !== "lobby") {
        throw new Error("Bu odaya şu anda katılım kapalı veya yarışma başlamış.");
      }

      const name = cleanName(req.name ?? "");
      const existing = Object.values(room.players).filter((p) => !p.removed);
      if (existing.some((p) => p.name.toLocaleLowerCase("tr") === name.toLocaleLowerCase("tr"))) {
        throw new Error(
          "Bu ad kullanılıyor. Lütfen adınızın yanına sınıf numaranızı veya soyadınızı ekleyin.",
        );
      }

      const playerId = crypto.randomUUID();
      const playerToken = generateToken();

      room.players[playerId] = {
        id: playerId,
        name,
        token_hash: await hashToken(playerToken),
        seen_at: new Date().toISOString(),
        removed: false,
      };
      room.version++;
      persistStore();

      return {
        cap: { id: playerId, token: playerToken },
        room: buildRoomView(room, { id: playerId, token: playerToken }, false),
      };
    }

    // 4. ROOM VIEW OR ACTION
    const key = req.key ?? "";
    const actionData = (req.data ?? {}) as {
      role?: "host" | "player";
      action?: string;
      choice?: Letter;
      questionId?: number;
      team?: string;
      delta?: number;
      reason?: string;
      player?: string;
      joker?: JokerType;
      newName?: string;
    };

    const host = actionData.role === "host";
    await authorize(host ? "host" : "player", key, req.cap);
    const room = findRoom(key);
    const c = req.cap;
    if (!c) throw new Error("Oturum gerekli.");

    // Update presence for student
    if (!host) {
      const player = room.players[c.id];
      if (player) {
        player.seen_at = new Date().toISOString();
      }
    }

    // VIEW OPERATION
    if (req.op === "view") {
      return { room: buildRoomView(room, c, host) };
    }

    if (req.op !== "action") throw new Error("Geçersiz işlem.");

    const s = room.state;

    // 5. STUDENT ACTIONS (LIVE KAHOOT)
    if (!host) {
      if (actionData.action === "answer") {
        const choice = actionData.choice;
        const qId = actionData.questionId;
        if (!choice || !letters.includes(choice) || !Number.isInteger(qId)) {
          throw new Error("Geçersiz cevap seçeneği.");
        }
        if (s.phase !== "open" || s.paused) {
          throw new Error("Soru şu anda cevaplamaya açık değil.");
        }
        if (s.deadline && Date.parse(s.deadline) <= Date.now()) {
          throw new Error("Bu soru için verilen süre doldu.");
        }

        const q = s.questions[s.index];
        if (!q || q.id !== qId) {
          throw new Error("Cevaplanan soru mevcut soruyla eşleşmiyor.");
        }

        const existingAnswer = Object.values(room.answers).find(
          (a) => a.player_id === c.id && a.question_id === qId,
        );
        if (existingAnswer) {
          throw new Error("Cevabınız zaten kaydedildi.");
        }

        const correct = choice === q.correctAnswer;
        const points = correct ? q.points : 0;

        room.answers[`${c.id}_${qId}`] = {
          player_id: c.id,
          question_id: qId,
          choice,
          points,
          correct,
          created_at: new Date().toISOString(),
        };

        // Check if auto-close condition met
        const activePlayers = Object.values(room.players).filter((p) => !p.removed);
        const currAnswers = Object.values(room.answers).filter((a) => a.question_id === q.id);
        if (
          s.settings.autoClose &&
          activePlayers.length > 0 &&
          currAnswers.length >= activePlayers.length
        ) {
          s.phase = "closed";
          s.deadline = null;
        }

        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, false) };
      }
      throw new Error("Yetkisiz veya tanınmayan işlem.");
    }

    // 6. TEACHER HOST ACTIONS (LIVE KAHOOT & SMARTBOARD TEAMS)
    const act = actionData.action;

    // 6.1 Remove inappropriate player
    if (act === "remove") {
      const pid = actionData.player;
      if (!pid || !room.players[pid]) throw new Error("Oyuncu bulunamadı.");
      room.players[pid].removed = true;
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.2 Start competition (SUPPORT EXACTLY 1 OR MORE PLAYERS!)
    if (act === "start") {
      const activePlayers = Object.values(room.players).filter((p) => !p.removed);
      if (s.phase !== "lobby") throw new Error("Yarışma zaten başlatılmış.");
      if (activePlayers.length < 1) {
        throw new Error("Yarışmayı başlatmak için en az 1 öğrencinin katılması gereklidir.");
      }
      s.phase = "open";
      deadline(s);
      s.questionStartTime = Date.now();
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.3 Close current question
    if (act === "close") {
      if (s.phase !== "open") throw new Error("Şu anda açık soru yok.");
      s.phase = "closed";
      s.deadline = null;
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.4 Pause question timer
    if (act === "pause") {
      if (s.phase !== "open") throw new Error("Açık soru yok.");
      s.remaining = s.deadline ? Math.max(0, Date.parse(s.deadline) - Date.now()) : null;
      s.paused = true;
      s.deadline = null;
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.5 Resume question timer
    if (act === "resume") {
      if (!s.paused) throw new Error("Yarışma duraklatılmamış.");
      s.paused = false;
      s.deadline = s.remaining !== null ? new Date(Date.now() + s.remaining).toISOString() : null;
      s.remaining = null;
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.6 End competition early
    if (act === "end") {
      s.phase = "finished";
      s.deadline = null;
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 6.7 Next question (Live Kahoot mode)
    if (act === "next" && room.mode === "live") {
      if (s.phase !== "closed")
        throw new Error("Sıradaki soruya geçmeden önce mevcut soruyu kapatın.");
      s.index++;
      if (s.index >= s.questions.length) {
        s.phase = "finished";
        s.index = s.questions.length - 1;
      } else {
        s.phase = "open";
        deadline(s);
        s.questionStartTime = Date.now();
      }
      room.version++;
      persistStore();
      return { room: buildRoomView(room, c, true) };
    }

    // 7. SMARTBOARD TEAM COMPETITION ACTIONS
    if (room.mode === "teams") {
      // 7.1 Tile selection from board
      if (act === "tile") {
        const qId = actionData.questionId;
        if (s.phase !== "board" || s.used.includes(qId ?? 0)) {
          throw new Error("Bu soru daha önce kullanılmış veya pano açık değil.");
        }
        const qIndex = s.questions.findIndex((item) => item.id === qId);
        if (qIndex < 0) throw new Error("Soru bulunamadı.");

        remember(s);
        s.index = qIndex;
        s.phase = "open";
        s.choices = {};
        s.awarded = false;
        s.stealing = null;
        s.activeJokers = {};
        s.lastCoinAward = null;
        deadline(s);
        s.questionStartTime = Date.now();
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.2 Cancel opened tile before confirmation
      if (act === "cancelTile") {
        if (s.phase !== "open" || s.awarded || Object.keys(s.choices).length > 0) {
          throw new Error("Cevap verildikten sonra soru iptal edilemez.");
        }
        s.phase = "board";
        s.deadline = null;
        s.activeJokers = {};
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.3 Submit team answer on smartboard
      if (act === "teamAnswer") {
        if (!["open", "steal"].includes(s.phase) || s.paused) {
          throw new Error("Bu aşamada cevap verilemez.");
        }
        const choice = actionData.choice;
        if (!choice || !letters.includes(choice)) throw new Error("Geçersiz seçenek.");

        const activeTeam = s.stealing
          ? s.teams.find((t) => t.id === s.stealing)
          : s.teams[s.active];
        if (!activeTeam) throw new Error("Aktif takım bulunamadı.");

        const isDoubleAnswerActive = !s.stealing && Boolean(s.activeJokers?.doubleAnswer);
        const existingChoice = s.choices[activeTeam.id];

        // Handle double answer joker
        if (isDoubleAnswerActive && existingChoice) {
          const firstChoice = Array.isArray(existingChoice) ? existingChoice[0] : existingChoice;
          if (firstChoice === choice)
            throw new Error("İkinci seçenek olarak farklı bir harf seçmelisiniz.");
          s.choices[activeTeam.id] = [firstChoice, choice];
        } else {
          s.choices[activeTeam.id] = choice;
        }

        // If double answer joker is enabled and only 1 choice made, wait for second choice unless user confirmed
        remember(s);
        const q = s.questions[s.index];
        const submittedChoices = Array.isArray(s.choices[activeTeam.id])
          ? (s.choices[activeTeam.id] as Letter[])
          : [choice];

        const isCorrect = submittedChoices.includes(q.correctAnswer);
        const isDoublePointsActive = Boolean(s.activeJokers?.doublePoints);
        const pointsEarned = isDoublePointsActive ? q.points * 2 : q.points;

        if (isCorrect && !s.awarded) {
          activeTeam.score += pointsEarned;
          activeTeam.correct++;
          s.awarded = true;
          s.phase = "closed";

          // Calculate elapsed seconds for coins
          const elapsed = s.questionStartTime
            ? Math.max(1, Math.round((Date.now() - s.questionStartTime) / 1000))
            : 10;
          if (s.settings.coins) {
            const coinAmount = calculateCoinReward(elapsed);
            activeTeam.coins += coinAmount;
            activeTeam.coinsEarned += coinAmount;
            s.lastCoinAward = {
              teamId: activeTeam.id,
              teamName: activeTeam.name,
              amount: coinAmount,
              seconds: elapsed,
              timestamp: Date.now(),
            };
          }
        } else {
          // Incorrect answer -> No steal, immediately closed
          s.phase = "closed";
        }

        s.deadline = null;
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.4 Buy Joker in Joker Shop
      if (act === "buyJoker") {
        const jokerType = actionData.joker;
        if (!jokerType || !JOKER_PRICES[jokerType]) throw new Error("Geçersiz joker türü.");
        if (!s.settings.jokerShop) throw new Error("Joker mağazası bu yarışmada kapalı.");
        if (s.settings.activeJokersList && !s.settings.activeJokersList.includes(jokerType)) {
          throw new Error("Bu joker bu yarışmada aktif edilmemiştir.");
        }

        const activeTeam = s.teams[s.active];
        if (!activeTeam) throw new Error("Aktif takım bulunamadı.");

        const price = JOKER_PRICES[jokerType];
        if (activeTeam.coins < price) {
          throw new Error(
            `Yetersiz bakiye! Bu joker için ${price} altın gerekli (Mevcut: ${activeTeam.coins}).`,
          );
        }

        activeTeam.coins -= price;
        activeTeam.coinsSpent += price;
        activeTeam.jokers[jokerType] = (activeTeam.jokers[jokerType] ?? 0) + 1;

        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.5 Use Joker during question
      if (act === "useJoker") {
        const jokerType = actionData.joker;
        if (s.phase !== "open") throw new Error("Joker yalnızca soru açıkken kullanılabilir.");
        if (!jokerType) throw new Error("Joker seçilmedi.");

        const activeTeam = s.teams[s.active];
        if (!activeTeam || (activeTeam.jokers[jokerType] ?? 0) < 1) {
          throw new Error("Takımınızın envanterinde bu joker bulunmuyor.");
        }

        const q = s.questions[s.index];
        s.activeJokers ??= {};

        if (jokerType === "doubleAnswer") {
          if (s.activeJokers.doubleAnswer)
            throw new Error("Çift Cevap jokeri bu soruda zaten aktif.");
          s.activeJokers.doubleAnswer = true;
        } else if (jokerType === "halfAndHalf") {
          if (s.activeJokers.eliminatedOptions)
            throw new Error("50/50 jokeri bu soruda zaten kullanıldı.");
          const wrongOptions = letters.filter((l) => l !== q.correctAnswer);
          const shuffled = [...wrongOptions].sort(() => Math.random() - 0.5);
          s.activeJokers.eliminatedOptions = shuffled.slice(0, 2);
        } else if (jokerType === "extraTime") {
          if (s.activeJokers.extraTime)
            throw new Error("Ek süre jokeri bu soruda zaten kullanıldı.");
          s.activeJokers.extraTime = true;
          if (s.deadline) {
            s.deadline = new Date(Date.parse(s.deadline) + 20000).toISOString();
          } else {
            s.deadline = new Date(Date.now() + 20000).toISOString();
          }
        } else if (jokerType === "hint") {
          if (!q.hint) throw new Error("Bu soru için öğretmen ipucu tanımlanmamış.");
          s.activeJokers.hintRevealed = true;
        } else if (jokerType === "doublePoints") {
          if (s.activeJokers.doublePoints)
            throw new Error("Çift Puan jokeri bu soruda zaten aktif.");
          s.activeJokers.doublePoints = true;
        } else if (jokerType === "switchQuestion") {
          if (s.activeJokers.switched)
            throw new Error("Bu soruda zaten soru değiştirme jokeri kullanıldı.");
          const bank = getQuestionBank(room.workspace_id);
          const candidate = bank.find(
            (item) =>
              item.unit === q.unit &&
              item.difficulty === q.difficulty &&
              item.id !== q.id &&
              !s.used.includes(item.id),
          );
          if (!candidate) {
            throw new Error(
              "Bu ünite ve zorluk seviyesinde kullanılmamış alternatif soru bulunmuyor.",
            );
          }
          s.questions[s.index] = candidate;
          s.choices = {};
          s.activeJokers.switched = true;
          s.activeJokers.eliminatedOptions = undefined;
          deadline(s);
          s.questionStartTime = Date.now();
        }

        activeTeam.jokers[jokerType]--;
        activeTeam.jokersUsed++;
        s.activeJokers.lastUsed = {
          joker: jokerType,
          teamName: activeTeam.name,
          timestamp: Date.now(),
        };

        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.6 Answer stealing: assign question to another team
      if (act === "steal") {
        if (s.phase !== "steal" || s.stealing) throw new Error("Çalma hakkı şu an aktif değil.");
        const targetTeam = s.teams.find((t) => t.id === actionData.team);
        if (!targetTeam || targetTeam.id === s.teams[s.active].id) {
          throw new Error("Çalma hakkı için farklı bir takım seçilmelidir.");
        }
        s.stealing = targetTeam.id;
        deadline(s);
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.7 Skip answer stealing
      if (act === "skipSteal") {
        if (s.phase !== "steal") throw new Error("Çalma aşamasında değilsiniz.");
        s.phase = "closed";
        s.deadline = null;
        s.stealing = null;
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.8 Complete question and return to board
      if (act === "board") {
        if (s.phase !== "closed") throw new Error("Soruyu panoya dönmeden önce tamamlayın.");
        const currentQ = s.questions[s.index];
        if (currentQ && !s.used.includes(currentQ.id)) {
          s.used.push(currentQ.id);
        }
        s.activeJokers = {};
        s.lastCoinAward = null;

        // Advance turn order
        if (!s.settings.manualTurn) {
          s.active = (s.active + 1) % s.teams.length;
        }

        s.phase = s.used.length >= s.questions.length ? "finished" : "board";
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.9 Manual turn selection
      if (act === "turn") {
        if (s.phase !== "board") throw new Error("Sıra yalnızca panoda değiştirilebilir.");
        const tIndex = s.teams.findIndex((t) => t.id === actionData.team);
        if (tIndex < 0) throw new Error("Takım bulunamadı.");
        s.active = tIndex;
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.10 Undo last state action
      if (act === "undo") {
        const prev = s.history.pop();
        if (!prev) throw new Error("Geri alınabilecek geçmiş işlem bulunmuyor.");
        Object.assign(s, prev, { history: s.history });
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.11 Adjust team score (teacher only)
      if (act === "adjust") {
        const t = s.teams.find((item) => item.id === actionData.team);
        const delta = actionData.delta ?? 0;
        const reason = actionData.reason?.trim() ?? "Öğretmen düzenlemesi";
        if (!t || !Number.isInteger(delta) || Math.abs(delta) > 500) {
          throw new Error("Geçerli takım ve puan farkı (-500 ile +500) belirtilmelidir.");
        }
        remember(s);
        t.score += delta;
        room.adjustments.push({
          team_id: t.id,
          delta,
          reason,
          created_at: new Date().toISOString(),
        });
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.12 Adjust team coins (teacher only)
      if (act === "adjustCoins") {
        const t = s.teams.find((item) => item.id === actionData.team);
        const delta = actionData.delta ?? 0;
        if (!t || !Number.isInteger(delta)) {
          throw new Error("Geçerli takım ve altın miktarı belirtilmelidir.");
        }
        t.coins = Math.max(0, t.coins + delta);
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.13 Rename team
      if (act === "renameTeam") {
        const t = s.teams.find((item) => item.id === actionData.team);
        const newName = cleanName(actionData.newName ?? "");
        if (!t) throw new Error("Takım bulunamadı.");
        t.name = newName;
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }

      // 7.14 Update team full details (name, color, members)
      if (act === "updateTeam") {
        const t = s.teams.find((item) => item.id === actionData.team);
        if (!t) throw new Error("Takım bulunamadı.");
        const extra = actionData as { newName?: string; color?: string; members?: string[] };
        if (extra.newName) t.name = cleanName(extra.newName);
        if (extra.color) t.color = extra.color;
        if (extra.members) t.members = extra.members.map(cleanName);
        room.version++;
        persistStore();
        return { room: buildRoomView(room, c, true) };
      }
    }

    throw new Error("Tanınmayan işlem.");
  } catch (err) {
    return {
      error:
        err instanceof z.ZodError
          ? "Girdiğiniz verileri kontrol edin."
          : err instanceof Error
            ? err.message
            : "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
    };
  }
}
