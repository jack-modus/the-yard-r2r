// Yard/boss data, extracted verbatim from reference/rags-to-riches-v6.jsx.
// Hard rule: no real named people — these are fictional, real-sounding names only.
import type { Yard, YardId } from "./types";

export const YARDS: Record<YardId, Yard> = {
  berrow: {
    boss: "Frank Berrow", yardName: "Berrow Racing, Malton",
    persona: "A blunt, old-school Yorkshireman who has forgotten more about sprinters than most trainers learn. Suffers no fools, rewards graft.",
    tracks: ["York", "Chester"], jockey: { name: "Kaiya Dods", skill: 82 },
    style: "sprint-leaning", greeting: n => `"Right, ${n}. You'll get no speeches from me. There's a horse in the bottom box nobody else will touch. Make something of it and we'll talk."`,
    praise: ["\"Aye. That'll do.\"", "\"Not bad. Don't let it go to your head.\"", "\"I've seen worse. Keep on.\""],
    scold: ["\"That were a mess. Sort it.\"", "\"My name's on that yard sign, remember.\"", "\"Do that again and you're mucking out till Christmas.\""],
  },
  delacroix: {
    boss: "Marina Delacroix-Hale", yardName: "Delacroix-Hale Racing, Newmarket",
    persona: "Elegant, exacting, quietly terrifying. Plans campaigns like chess games and expects her assistants to see three moves ahead.",
    tracks: ["Newmarket", "Ascot"], jockey: { name: "Rossa Bellini", skill: 88 },
    style: "miler-leaning", greeting: n => `"${n}. I hire for judgement, not enthusiasm. There is a horse here whose entries I cannot justify to its owner. It is yours to prove me wrong about."`,
    praise: ["\"Competent. Continue.\"", "\"I noticed. Others will too.\"", "\"That was... correct.\""],
    scold: ["\"Explain your thinking. Slowly.\"", "\"We do not guess in this yard.\"", "\"Disappointing. Twice would be a pattern.\""],
  },
  okafor: {
    boss: "Sonny Okafor", yardName: "Okafor Racing, Lambourn",
    persona: "A young insurgent renting twenty boxes on a shoestring, all energy and ambition. Treats his assistants like partners — and expects them to hustle like it.",
    tracks: ["Epsom", "Sandown"], jockey: { name: "Saffie Quill", skill: 79 },
    style: "middle-distance-leaning", greeting: n => `"${n}! Brilliant. Look — I can't pay much and half our tack is borrowed, but I promise you this: win with the horse in box four and I'll put your name on everything we do."`,
    praise: ["\"YES! That's what I'm talking about!\"", "\"Knew it. KNEW it. More of that.\"", "\"Owners are calling ME now. That's you, that is.\""],
    scold: ["\"Ah mate. That one hurt.\"", "\"We can't afford days like that. Literally.\"", "\"Chin up — but fix it, yeah?\""],
  },
};
