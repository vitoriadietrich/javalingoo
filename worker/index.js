import {handleReasoning} from "./reasoning.js";
// A room is shared state in D1. The client never receives a player's secret.
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});
const error = (message, status = 400) => json({ error: message }, status);
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
const random = (length) => Array.from(crypto.getRandomValues(new Uint8Array(length)),
  b => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32]).join("");
const hash = async value => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))),
  b => b.toString(16).padStart(2, "0")).join("");
const bossMax = wave => [0, 700, 1000, 1400][wave] || 1400;
const queries = [
  { correct: 1 }, // Java: int vidas = 3;
  { correct: 2 }, // for (int i=0; i<3; i++)
  { correct: 0 }, // extends
];

async function snapshot(db, code, now) {
  const room = await db.prepare("SELECT code, arena, host_id, phase, wave, boss_hp, buff_until, created_at FROM squad_rooms WHERE code=?").bind(code).first();
  if (!room) return null;
  const players = (await db.prepare("SELECT id, name, hero, role, x, y, hp, shield, ammo, power, last_seen, answer_wave, score FROM squad_players WHERE room_code=? AND last_seen>? ORDER BY id").bind(code, now - 40000).all()).results;
  return { room: { ...room, boss_max: bossMax(room.wave), server_time: now }, players };
}

async function handle(request, env) {
  if (!env.DB) return error("Salas online indisponíveis no momento.", 503);
  if (request.method !== "POST") return error("Método inválido.", 405);
  if (Number(request.headers.get("content-length") || 0) > 4096) return error("Pedido muito grande.", 413);
  let body;
  try { body = await request.json(); } catch { return error("Dados inválidos."); }
  if (!body || typeof body !== "object") return error("Dados inválidos.");
  const db = env.DB, now = Date.now(), path = new URL(request.url).pathname;
  if (path === "/api/squad/create" || path === "/api/squad/join") {
    const name = String(body.name || "").trim().replace(/[<>]/g, "").slice(0, 18);
    if (!name) return error("Escolha um nome para entrar.");
    const hero = Math.floor(clamp(body.hero, 0, 29)), role = Math.floor(hero / 10);
    const token = random(32), id = random(10), tokenHash = await hash(token);
    let code = String(body.code || "").toUpperCase().replace(/[^A-Z2-9]/g, "");
    let room, activeCount = 0;
    if (path.endsWith("create")) {
      code = random(6);
      await db.prepare("INSERT INTO squad_rooms (code, arena, host_id, created_at, updated_at) VALUES (?,?,?,?,?)").bind(code, Math.floor(clamp(body.arena, 0, 29)), id, now, now).run();
    } else {
      if (code.length !== 6) return error("Digite o código de 6 caracteres.");
      room = await db.prepare("SELECT phase, created_at FROM squad_rooms WHERE code=?").bind(code).first();
      if (!room || now - room.created_at > 7200000) return error("Sala não encontrada ou expirada.", 404);
      if (room.phase !== "lobby") return error("A partida já começou. Crie uma nova sala.");
      const count = await db.prepare("SELECT COUNT(*) AS n FROM squad_players WHERE room_code=? AND last_seen>?").bind(code, now - 40000).first();
      activeCount = count.n;
    }
    const position = 300 + activeCount * 125, row = 425 + (activeCount % 2) * 65;
    if (room) {
      const joined = await db.prepare("INSERT INTO squad_players (room_code,id,token_hash,name,hero,role,x,y,last_seen) SELECT ?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM squad_players WHERE room_code=? AND last_seen>?)<4")
        .bind(code, id, tokenHash, name, hero, role, position, row, now, code, now - 40000).run();
      if (!joined.meta.changes) return error("A sala já tem quatro alunos.");
    } else await db.prepare("INSERT INTO squad_players (room_code,id,token_hash,name,hero,role,x,y,last_seen) VALUES (?,?,?,?,?,?,?,?,?)")
      .bind(code, id, tokenHash, name, hero, role, position, row, now).run();
    return json({ code, id, token, state: await snapshot(db, code, now) });
  }
  const code = String(body.code || "").toUpperCase();
  const id = String(body.id || ""), token = String(body.token || "");
  if (!/^[A-Z2-9]{6}$/.test(code) || !/^[A-Z2-9]{10}$/.test(id) || token.length !== 32) return error("Sessão inválida.", 401);
  const player = await db.prepare("SELECT * FROM squad_players WHERE room_code=? AND id=?").bind(code, id).first();
  if (!player || player.token_hash !== await hash(token)) return error("Sessão expirada. Entre novamente.", 401);
  let room = await db.prepare("SELECT * FROM squad_rooms WHERE code=?").bind(code).first();
  if (!room || now - room.created_at > 7200000) return error("Sala expirada.", 404);
  if (room.phase === "lobby" && room.host_id !== id) {
    const host = await db.prepare("SELECT last_seen FROM squad_players WHERE room_code=? AND id=?").bind(code, room.host_id).first();
    if (!host || now - host.last_seen > 40000) {
      await db.prepare("UPDATE squad_rooms SET host_id=? WHERE code=? AND host_id=?").bind(id, code, room.host_id).run();
      room.host_id = id;
    }
  }
  if (path === "/api/squad/leave") {
    await db.prepare("DELETE FROM squad_players WHERE room_code=? AND id=?").bind(code, id).run();
    if (id === room.host_id) {
      const next = await db.prepare("SELECT id FROM squad_players WHERE room_code=? AND last_seen>? LIMIT 1").bind(code, now - 40000).first();
      if (next) await db.prepare("UPDATE squad_rooms SET host_id=? WHERE code=?").bind(next.id, code).run();
      else await db.prepare("DELETE FROM squad_rooms WHERE code=?").bind(code).run();
    }
    return json({ ok: true });
  }
  if (path !== "/api/squad/state") return error("Rota desconhecida.", 404);
  if (room.phase === "lobby" && body.start && id === room.host_id) {
    await db.prepare("UPDATE squad_rooms SET phase='playing',updated_at=? WHERE code=? AND phase='lobby'").bind(now, code).run();
    await db.prepare("UPDATE squad_players SET last_hit=? WHERE room_code=?").bind(now, code).run();
    player.last_hit = now;
    room.phase = "playing";
  }
  const x = clamp(body.x ?? player.x, 24, 936), y = clamp(body.y ?? player.y, 35, 565);
  // The game sends a position at most a few times a second; reject large jumps.
  const travel = clamp((now - player.last_seen) * .36 + 55, 55, 280);
  const distance = Math.hypot(x - player.x, y - player.y);
  const scale = distance > travel ? travel / distance : 1;
  let px = Math.round(player.x + (x - player.x) * scale), py = Math.round(player.y + (y - player.y) * scale);
  let hp = player.hp, shield = player.shield, ammo = player.ammo, power = player.power, score = player.score;
  let lastShot = player.last_shot, lastHit = player.last_hit, answerWave = player.answer_wave;
  if (room.phase === "playing") {
    const bossX = 480 + Math.sin(now / 1800) * 170, bossY = 155 + Math.cos(now / 2400) * 40;
    if (body.reload) ammo = 28;
    if (body.fire && hp > 0 && ammo > 0 && now - lastShot >= 170) {
      ammo--; lastShot = now; power = Math.min(100, power + 6); score += 10;
      const damage = room.buff_until > now ? 33 : 21;
      await db.prepare("UPDATE squad_rooms SET boss_hp=MAX(0,boss_hp-?),updated_at=? WHERE code=? AND phase='playing'").bind(damage, now, code).run();
    }
    if (body.power && power >= 100 && hp > 0) {
      power = 0;
      if (player.role === 1) {
        await db.prepare("UPDATE squad_players SET shield=MIN(100,shield+55),hp=MIN(100,hp+20) WHERE room_code=?").bind(code).run();
        shield = Math.min(100, shield + 55); hp = Math.min(100, hp + 20);
      } else {
        const damage = player.role === 0 ? 150 : 100;
        await db.prepare("UPDATE squad_rooms SET boss_hp=MAX(0,boss_hp-?) WHERE code=? AND phase='playing'").bind(damage, code).run();
        if (player.role === 2) hp = Math.min(100, hp + 35);
      }
    }
    if (body.revive && hp > 0) {
      const ally = await db.prepare("SELECT id,x,y FROM squad_players WHERE room_code=? AND id=? AND hp=0 AND last_seen>?")
        .bind(code, String(body.revive), now - 40000).first();
      if (ally && Math.hypot(ally.x - px, ally.y - py) < 110) {
        await db.prepare("UPDATE squad_players SET hp=40,shield=15 WHERE room_code=? AND id=? AND hp=0").bind(code, ally.id).run();
        score += 80;
      }
    }
    if (body.answer !== undefined && answerWave !== room.wave) {
      answerWave = room.wave;
      if (Number(body.answer) === queries[room.wave - 1].correct) {
        score += 100;
        await db.prepare("UPDATE squad_rooms SET buff_until=?,boss_hp=MAX(0,boss_hp-90) WHERE code=? AND wave=?")
          .bind(now + 12000, code, room.wave).run();
        await db.prepare("UPDATE squad_players SET shield=MIN(100,shield+15) WHERE room_code=?").bind(code).run();
        shield = Math.min(100, shield + 15);
      }
    }
    if (now - lastHit > 3600 && hp > 0 && Math.hypot(px - bossX, py - bossY) < 410) {
      const damage = room.buff_until > now ? 5 : 10;
      const absorbed = Math.min(shield, damage);
      shield -= absorbed; hp = Math.max(0, hp - (damage - absorbed)); lastHit = now;
    }
    if (now - room.teacher_at > 7000) {
      const tick = await db.prepare("UPDATE squad_rooms SET teacher_at=? WHERE code=? AND teacher_at=?").bind(now, code, room.teacher_at).run();
      if (tick.meta.changes) {
        await db.prepare("UPDATE squad_rooms SET boss_hp=MAX(0,boss_hp-28) WHERE code=? AND phase='playing'").bind(code).run();
        await db.prepare("UPDATE squad_players SET hp=MIN(100,hp+8) WHERE room_code=? AND hp>0").bind(code).run();
        hp = Math.min(100, hp + 8);
      }
    }
  }
  await db.prepare("UPDATE squad_players SET x=?,y=?,hp=?,shield=?,ammo=?,power=?,last_shot=?,last_hit=?,last_seen=?,answer_wave=?,score=? WHERE room_code=? AND id=?")
    .bind(px, py, hp, shield, ammo, power, lastShot, lastHit, now, answerWave, score, code, id).run();
  if (room.phase === "playing") {
    const current = await db.prepare("SELECT wave,boss_hp FROM squad_rooms WHERE code=?").bind(code).first();
    if (current.boss_hp <= 0) {
      if (current.wave >= 3) await db.prepare("UPDATE squad_rooms SET phase='won',boss_hp=0 WHERE code=? AND phase='playing'").bind(code).run();
      else {
        const next = current.wave + 1;
        await db.prepare("UPDATE squad_rooms SET wave=?,boss_hp=?,buff_until=0 WHERE code=? AND wave=? AND boss_hp<=0").bind(next, bossMax(next), code, current.wave).run();
        await db.prepare("UPDATE squad_players SET hp=MIN(100,hp+35),shield=MIN(100,shield+30),ammo=28 WHERE room_code=?").bind(code).run();
      }
    }
    const alive = await db.prepare("SELECT COUNT(*) AS n FROM squad_players WHERE room_code=? AND hp>0 AND last_seen>?").bind(code, now - 40000).first();
    if (!alive.n) await db.prepare("UPDATE squad_rooms SET phase='lost' WHERE code=? AND phase='playing'").bind(code).run();
  }
  return json({ state: await snapshot(db, code, now) });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path.startsWith("/api/reasoning/")) {
      try { return await handleReasoning(request, env); }
      catch (e) { console.error("reasoning", e); return error("O tutor está temporariamente indisponível. Tente novamente.", 503); }
    }
    if (!path.startsWith("/api/squad/")) return env.ASSETS?.fetch(request) ?? new Response("Not found", { status: 404 });
    try { return await handle(request, env); }
    catch (e) { console.error("squad", e); return error("A sala está temporariamente indisponível. Tente novamente.", 503); }
  },
};
