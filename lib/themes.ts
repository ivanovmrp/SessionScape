export type SessionTheme = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  summary: string;
  pace: string;
  pressure: string;
  flow: string;
  music: string;
  sequence: string[];
};

export const SESSION_THEMES: SessionTheme[] = [
  { id: "relax", name: "Deep Relax", category: "Rest & Reset", tagline: "Slow down, soften, restore.", summary: "A grounding, unhurried session designed to help the client settle into rest and release everyday tension.", pace: "Slow", pressure: "Light to moderate", flow: "Long & continuous", music: "ambient piano", sequence: ["Arrival and comfort check", "Grounding back & shoulder work", "Slow leg and arm integration", "Quiet scalp or neck finish"] },
  { id: "vital", name: "Vital Pulse", category: "Energy & Recovery", tagline: "Rhythmic, warm, renewing.", summary: "A bright, rhythmic experience for clients who want to feel refreshed and physically reenergized.", pace: "Moderate", pressure: "Moderate", flow: "Rhythmic & dynamic", music: "uplifting instrumental", sequence: ["Focused intake & pressure check", "Back and shoulder warming", "Rhythmic limb work", "Grounded, slow transition to finish"] },
  { id: "ocean", name: "Ocean Bliss", category: "Sensory Escape", tagline: "A gently flowing reset.", summary: "A smooth, wave-like ritual that pairs continuous movement with an optional soft sensory atmosphere.", pace: "Slow", pressure: "Light to moderate", flow: "Fluid & soothing", music: "soft coastal ambient", sequence: ["Scent and sensitivity check", "Broad, flowing back work", "Gentle arms and legs", "Unhurried closure"] },
  { id: "restore", name: "Muscle Restore", category: "Targeted Comfort", tagline: "Focused attention, clear check-ins.", summary: "A client-led blueprint for areas of non-acute muscular tension, with regular pressure and comfort check-ins.", pace: "Moderate", pressure: "Customizable", flow: "Focused", music: "low-key instrumental", sequence: ["Goals and contraindication check", "General warming sequence", "Focused work by consent", "Integration and aftercare discussion"] },
  { id: "warm", name: "Warm Radiance", category: "Sensory Relaxation", tagline: "Comforting, polished, professional.", summary: "A luxurious spa-style experience emphasizing warmth, texture, and a calm, professional sense of care.", pace: "Slow", pressure: "Light to moderate", flow: "Nurturing", music: "warm acoustic ambient", sequence: ["Comfort and draping discussion", "Warm towel preparation", "Nurturing full-body flow", "Slow, settled finish"] },
  { id: "reset", name: "Clear Mind Reset", category: "Rest & Reset", tagline: "Space to exhale.", summary: "A quiet, simple session framework for clients who want less sensory input and a feeling of calm.", pace: "Slow", pressure: "Light", flow: "Minimal & steady", music: "quiet or client choice", sequence: ["Low-sensory room check", "Neck and shoulder easing", "Steady, simple full-body flow", "Stillness before closing"] }
];

