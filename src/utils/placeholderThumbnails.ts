/**
 * Storyboard Placeholder Thumbnails System
 * Provides atmospheric 9:16 vertical storyboard thumbnails for newly created scenes
 * and scenes awaiting final AI visual frame generation.
 */

export interface StoryboardPlaceholderStyle {
  id: string;
  name: string;
  category: "thriller" | "subway" | "cyberpunk" | "horror" | "noir";
  description: string;
  imageUrl: string;
  accentColor: string;
}

export const STORYBOARD_PLACEHOLDER_STYLES: StoryboardPlaceholderStyle[] = [
  {
    id: "noir_corridor",
    name: "Noir Suspense Corridor",
    category: "noir",
    description: "Deep shadows, silhouette at the end of a long dimly-lit hallway",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#f59e0b",
  },
  {
    id: "subway_dread",
    name: "Subterranean Transit Car",
    category: "subway",
    description: "Flickering sickly fluorescent overheads in an accelerating train",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#10b981",
  },
  {
    id: "shadow_intruder",
    name: "Shadow Intruder in Doorway",
    category: "thriller",
    description: "Chiaroscuro backlight, ominous silhouette stepping forward",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#ef4444",
  },
  {
    id: "surveillance_lab",
    name: "Glitch Surveillance Control",
    category: "cyberpunk",
    description: "Cathode blue screens, digital glitch noise, surveillance monitoring",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#06b6d4",
  },
  {
    id: "foggy_streetlight",
    name: "Foggy Night Alley",
    category: "horror",
    description: "Dense mist, amber streetlight glow, wet pavement reflections",
    imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#eab308",
  },
  {
    id: "red_darkroom",
    name: "Crimson Dread Chamber",
    category: "horror",
    description: "Deep red safelight illumination, stark contrasts and suspense",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#dc2626",
  },
  {
    id: "rearview_storm",
    name: "Rain Windshield Night",
    category: "noir",
    description: "Rain streaks on glass, city neon bokeh, nervous rear-view gaze",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#3b82f6",
  },
  {
    id: "spiral_descent",
    name: "Vertigo Stairwell Descent",
    category: "thriller",
    description: "Dizzying high angle vertical geometric shadows looking down",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=720&h=1280&q=80",
    accentColor: "#a855f7",
  },
];

/**
 * Creates an SVG-based stylized 9:16 storyboard sketch concept thumbnail.
 * Perfect for offline instant rendering and zero-latency visual placeholders.
 */
export function generateSvgStoryboardPlaceholder(options: {
  beatNumber: number;
  timecode: string;
  title: string;
  genre?: string;
  cameraSetup?: string;
  lighting?: string;
}): string {
  const { beatNumber, timecode, title, genre = "Suspense Thriller", cameraSetup = "Vertical 9:16 Close-Up" } = options;
  const cleanTitle = title.replace(/[<>&"]/g, "");
  const cleanGenre = genre.replace(/[<>&"]/g, "");
  const cleanCamera = cameraSetup.replace(/[<>&"]/g, "");

  // Choose accent tint based on beat number
  const hues = [
    { primary: "#f59e0b", secondary: "#1e1b4b", glow: "#d97706" }, // Amber / Indigo
    { primary: "#06b6d4", secondary: "#09090b", glow: "#0891b2" }, // Cyan / Obsidian
    { primary: "#ef4444", secondary: "#18181b", glow: "#b91c1c" }, // Crimson / Black
    { primary: "#10b981", secondary: "#022c22", glow: "#059669" }, // Emerald / Dark Green
    { primary: "#a855f7", secondary: "#1e1b4b", glow: "#7e22ce" }, // Purple / Dark Blue
  ];
  const color = hues[(beatNumber - 1) % hues.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="720" height="1280">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a" />
      <stop offset="40%" stop-color="#141417" />
      <stop offset="70%" stop-color="${color.secondary}" />
      <stop offset="100%" stop-color="#050505" />
    </linearGradient>
    <radialGradient id="spotlight" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="${color.primary}" stop-opacity="0.22" />
      <stop offset="60%" stop-color="${color.glow}" stop-opacity="0.05" />
      <stop offset="100%" stop-color="#000000" stop-opacity="0.8" />
    </radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    </pattern>
  </defs>

  <!-- Background Canvas -->
  <rect width="720" height="1280" fill="url(#bg)" />
  <rect width="720" height="1280" fill="url(#grid)" />
  <rect width="720" height="1280" fill="url(#spotlight)" />

  <!-- Director 9:16 Aspect Frame & Rule of Thirds Guide -->
  <rect x="36" y="64" width="648" height="1152" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="2" stroke-dasharray="8 6" rx="16" />
  
  <!-- Thirds Lines -->
  <line x1="252" y1="64" x2="252" y2="1216" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
  <line x1="468" y1="64" x2="468" y2="1216" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
  <line x1="36" y1="448" x2="684" y2="448" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
  <line x1="36" y1="832" x2="684" y2="832" stroke="rgba(255,255,255,0.05)" stroke-width="1" />

  <!-- Center Framing Crosshair -->
  <circle cx="360" cy="560" r="54" fill="none" stroke="${color.primary}" stroke-width="1.5" stroke-opacity="0.4" />
  <circle cx="360" cy="560" r="6" fill="${color.primary}" fill-opacity="0.8" />
  <line x1="360" y1="490" x2="360" y2="530" stroke="${color.primary}" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="360" y1="590" x2="360" y2="630" stroke="${color.primary}" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="290" y1="560" x2="330" y2="560" stroke="${color.primary}" stroke-width="1.5" stroke-opacity="0.6" />
  <line x1="390" y1="560" x2="430" y2="560" stroke="${color.primary}" stroke-width="1.5" stroke-opacity="0.6" />

  <!-- Storyboard Silhouette Sketch Graphic -->
  <path d="M 360 410 C 330 410 310 435 310 470 C 310 500 325 520 345 530 C 300 550 260 595 250 670 C 290 690 430 690 470 670 C 460 595 420 550 375 530 C 395 520 410 500 410 470 C 410 435 390 410 360 410 Z" fill="rgba(0,0,0,0.65)" stroke="${color.primary}" stroke-width="2" stroke-opacity="0.3" />

  <!-- Top Metadata Bar -->
  <rect x="60" y="90" width="600" height="42" rx="8" fill="rgba(0,0,0,0.65)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
  <text x="76" y="117" fill="${color.primary}" font-family="monospace" font-size="16" font-weight="bold">BEAT ${beatNumber} &bull; ${timecode}</text>
  <text x="644" y="117" fill="#a1a1aa" font-family="monospace" font-size="14" text-anchor="end">9:16 VERTICAL DRAFT</text>

  <!-- Title & Action Overlay Container -->
  <rect x="60" y="960" width="600" height="210" rx="16" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.12)" stroke-width="1" />
  
  <text x="90" y="1005" fill="#f4f4f5" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold">${cleanTitle}</text>
  <text x="90" y="1042" fill="${color.primary}" font-family="monospace" font-size="17" font-weight="bold">SETUP: ${cleanCamera}</text>
  <text x="90" y="1075" fill="#a1a1aa" font-family="system-ui, -apple-system, sans-serif" font-size="18">GENRE: ${cleanGenre}</text>

  <!-- Call to action badge -->
  <rect x="90" y="1105" width="540" height="44" rx="8" fill="${color.primary}" fill-opacity="0.18" stroke="${color.primary}" stroke-width="1" />
  <text x="360" y="1133" fill="${color.primary}" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">STORYBOARD THUMBNAIL PLACEHOLDER &bull; READY FOR AI RENDER</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Automatically picks an evocative, high-quality 9:16 vertical placeholder thumbnail
 * based on the scene's genre, beat sequence, and action.
 */
export function getThematicPlaceholderThumbnail(
  genre: string = "",
  beatNumber: number = 1,
  visualAction: string = ""
): string {
  const g = genre.toLowerCase();
  const v = visualAction.toLowerCase();

  // If specific scene action keywords match
  if (v.includes("subway") || v.includes("train") || v.includes("transit") || g.includes("subway")) {
    return STORYBOARD_PLACEHOLDER_STYLES[1].imageUrl; // Subterranean transit
  }
  if (v.includes("mirror") || v.includes("reflection") || v.includes("surveillance") || v.includes("camera") || v.includes("phone") || g.includes("sci-fi") || g.includes("cyber")) {
    return STORYBOARD_PLACEHOLDER_STYLES[3].imageUrl; // Glitch Surveillance
  }
  if (v.includes("shadow") || v.includes("intruder") || v.includes("door") || v.includes("threat")) {
    return STORYBOARD_PLACEHOLDER_STYLES[2].imageUrl; // Shadow Intruder
  }
  if (v.includes("red") || v.includes("blood") || v.includes("horror") || g.includes("horror")) {
    return STORYBOARD_PLACEHOLDER_STYLES[5].imageUrl; // Crimson dread
  }
  if (v.includes("car") || v.includes("rain") || v.includes("drive") || v.includes("street")) {
    return STORYBOARD_PLACEHOLDER_STYLES[6].imageUrl; // Rain windshield
  }
  if (v.includes("stair") || v.includes("run") || v.includes("chase") || v.includes("height")) {
    return STORYBOARD_PLACEHOLDER_STYLES[7].imageUrl; // Spiral descent
  }

  // Otherwise cycle through curated styles based on beat number
  const styleIndex = (beatNumber - 1) % STORYBOARD_PLACEHOLDER_STYLES.length;
  return STORYBOARD_PLACEHOLDER_STYLES[styleIndex].imageUrl;
}

/**
 * Call the backend to generate a fresh AI placeholder thumbnail or get an instant concept thumbnail.
 */
export async function generateAIPlaceholderThumbnail(params: {
  sceneTitle: string;
  visualAction: string;
  genre?: string;
  stylePreset?: string;
  beatNumber: number;
  cameraSetup?: string;
}): Promise<string> {
  try {
    const res = await fetch("/api/generate-placeholder-thumbnail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.thumbnailUrl) {
        return data.thumbnailUrl;
      }
    }
  } catch (err) {
    console.warn("AI placeholder generation fell back to thematic curated thumbnail:", err);
  }

  // Graceful fallback to thematic curated 9:16 vertical thumbnail
  return getThematicPlaceholderThumbnail(params.genre, params.beatNumber, params.visualAction);
}
