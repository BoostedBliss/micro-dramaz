import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// In-memory store for project sync & collaboration (with persistence)
const projectStore = new Map<string, any>();
const collaborationActivityLog: Array<{
  id: string;
  projectId: string;
  user: string;
  action: string;
  timestamp: string;
}> = [];

// API: Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    serverTime: new Date().toISOString(),
  });
});

// API: Script parsing into Snapchat Movie 10-second increments
app.post("/api/parse-script", async (req, res) => {
  try {
    const { scriptText, genre, stylePreset, targetBeatsCount } = req.body;
    if (!scriptText || typeof scriptText !== "string") {
      return res.status(400).json({ error: "Script text is required." });
    }

    const ai = getGenAI();

    const systemPrompt = `You are a legendary Snapchat Originals & Vertical Cinema Director and Showrunner specializing in ultra-engaging micro-series.
Snapchat movies are produced strictly in 10-second increments (00:00-00:10, 00:10-00:20, etc.) in 9:16 vertical video format.
Each 10-second increment MUST have:
1. An immediate visual hook.
2. High tension or fast-moving action.
3. A micro-cliffhanger or unresolved revelation at the 9th-10th second that compels the user to swipe/tap for the next 10-second installation.
4. Consistent character traits and signature visual styles.

Analyze the uploaded script and convert it into a sequence of 10-second beat scenes for Snapchat video production.
Extract all prominent characters into a detailed "Character Bible" with precise physical traits, face features, hair, age, build, signature wardrobe, and color palette so that generated storyboard images maintain AI-driven character consistency across all scenes.
Return strictly valid JSON matching the schema.`;

    const userPrompt = `Script Content:
"""
${scriptText.slice(0, 15000)}
"""

Preferences:
- Genre / Vibe: ${genre || "Suspense Mystery / Psychological Thriller"}
- Visual Style Preset: ${stylePreset || "Cinematic Dark Thriller (Teal & Amber, moody lighting, anamorphic rim lighting)"}
- Target number of 10-second beats: ${targetBeatsCount || "6 to 10 beats"}

Break down the story into 10-second chronological increments.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            logline: { type: Type.STRING },
            genre: { type: Type.STRING },
            visualTone: { type: Type.STRING },
            characters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  age: { type: Type.STRING },
                  role: { type: Type.STRING },
                  appearanceDescription: {
                    type: Type.STRING,
                    description: "Distinct facial features, hair style & color, skin tone, build, eye color, facial hair or scars for strict image consistency",
                  },
                  signatureWardrobe: {
                    type: Type.STRING,
                    description: "Specific clothing items, jackets, colors, accessories worn across scenes",
                  },
                  colorPalette: { type: Type.STRING },
                },
                required: ["id", "name", "role", "appearanceDescription", "signatureWardrobe"],
              },
            },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  beatNumber: { type: Type.INTEGER },
                  timecode: { type: Type.STRING, description: "e.g. 00:00 - 00:10" },
                  duration: { type: Type.STRING, description: "10s" },
                  title: { type: Type.STRING },
                  visualAction: { type: Type.STRING, description: "What happens visually on screen in this 10 seconds" },
                  dialogue: { type: Type.STRING, description: "Spoken line or intense voiceover" },
                  soundEffects: { type: Type.STRING, description: "SFX, musical stings, heartbeats, riser audio" },
                  cameraSetup: {
                    type: Type.STRING,
                    description: "Vertical camera framing: Extreme Close-Up, Dutch Tilt, Snap Push-In, Overhead POV, Low Angle",
                  },
                  lighting: {
                    type: Type.STRING,
                    description: "Lighting setup: Rim lighting, neon glare, harsh shadows, flashlight flare, silhouette",
                  },
                  suspenseScore: {
                    type: Type.INTEGER,
                    description: "Suspense rating from 1 to 10 for audience retention",
                  },
                  cliffhangerHook: {
                    type: Type.STRING,
                    description: "The micro-cliffhanger that forces viewers to tap for the next 10-second installation",
                  },
                  charactersInScene: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  imagePrompt: {
                    type: Type.STRING,
                    description: "Highly detailed 9:16 vertical cinematic storyboard prompt with lighting, camera composition, character description, and suspense tone",
                  },
                },
                required: [
                  "beatNumber",
                  "timecode",
                  "duration",
                  "title",
                  "visualAction",
                  "cameraSetup",
                  "lighting",
                  "suspenseScore",
                  "cliffhangerHook",
                  "charactersInScene",
                  "imagePrompt",
                ],
              },
            },
          },
          required: ["title", "logline", "genre", "characters", "scenes"],
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json(parsedData);
  } catch (error: any) {
    console.error("Script parsing error:", error);
    return res.status(500).json({
      error: error.message || "Failed to parse script.",
    });
  }
});

// API: Generate Storyboard Image using gemini-3-pro-image-preview
app.post("/api/generate-storyboard-image", async (req, res) => {
  try {
    const {
      prompt,
      scenePrompt,
      characterBibles,
      characterBible,
      stylePreset,
      aspectRatio = "9:16",
      imageSize = "1K", // affordance: 1K, 2K, 4K
      compositionNotes,
      cameraSetup,
      lightingNotes,
      lightingSetup,
    } = req.body;

    const effectivePrompt = prompt || scenePrompt;
    if (!effectivePrompt) {
      return res.status(400).json({ error: "Image generation prompt is required." });
    }

    const ai = getGenAI();

    // Construct enriched consistency prompt
    let fullPrompt = `Vertical 9:16 cinematic storyboard frame for a high-suspense Snapchat movie installation.\n`;
    fullPrompt += `Scene Visual: ${effectivePrompt}\n`;

    const effectiveBibles = characterBibles || (characterBible ? [{ name: "Cast", appearanceDescription: characterBible, role: "Cast", signatureWardrobe: "Signature" }] : []);
    if (effectiveBibles && Array.isArray(effectiveBibles) && effectiveBibles.length > 0) {
      fullPrompt += `Character Consistency Bible (MUST follow strictly for consistent faces, hair, build, and clothing across all scenes):\n`;
      for (const char of effectiveBibles) {
        fullPrompt += `- ${char.name} (${char.role || "Cast"}): ${char.appearanceDescription}. Wearing: ${char.signatureWardrobe}. Palette: ${char.colorPalette || "cinematic tones"}.\n`;
      }
    }

    if (stylePreset) {
      fullPrompt += `Visual Cinematic Style: ${stylePreset}\n`;
    }
    const comp = compositionNotes || cameraSetup;
    if (comp) {
      fullPrompt += `Composition & Camera Framing: ${comp}, strictly 9:16 vertical cinema framing.\n`;
    }
    const light = lightingNotes || lightingSetup;
    if (light) {
      fullPrompt += `Lighting & Mood: ${light}, high dynamic range, intense suspense shadows.\n`;
    }
    fullPrompt += `Production Quality: Masterclass cinema storyboard, sharp focus, movie still, color graded, photorealistic tension, 8k resolution look.`;

    const normalizedSize = ["1K", "2K", "4K"].includes(imageSize) ? imageSize : "1K";
    const normalizedAspect = ["9:16", "16:9", "1:1", "4:3", "3:4"].includes(aspectRatio)
      ? aspectRatio
      : "9:16";

    // Attempt generation with gemini-3-pro-image-preview as requested
    const targetModel = "gemini-3-pro-image-preview";

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: normalizedAspect,
            imageSize: normalizedSize,
          },
        },
      });

      let base64Data: string | null = null;
      let mimeType = "image/png";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Data = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }

      if (!base64Data) {
        throw new Error("No image data returned from model.");
      }

      return res.json({
        imageUrl: `data:${mimeType};base64,${base64Data}`,
        mimeType,
        modelUsed: targetModel,
        imageSize: normalizedSize,
        aspectRatio: normalizedAspect,
      });
    } catch (primaryErr: any) {
      console.warn("Primary image model failed, falling back to gemini-3.1-flash-image:", primaryErr.message);

      // Graceful fallback to gemini-3.1-flash-image
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: fullPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: normalizedAspect,
            imageSize: normalizedSize,
          },
        },
      });

      let base64Data: string | null = null;
      let mimeType = "image/png";

      if (fallbackResponse.candidates?.[0]?.content?.parts) {
        for (const part of fallbackResponse.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Data = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }

      if (!base64Data) {
        throw new Error("No image data returned from fallback model.");
      }

      return res.json({
        imageUrl: `data:${mimeType};base64,${base64Data}`,
        mimeType,
        modelUsed: "gemini-3.1-flash-image",
        imageSize: normalizedSize,
        aspectRatio: normalizedAspect,
      });
    }
  } catch (error: any) {
    console.error("Image generation error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate storyboard image.",
    });
  }
});

// API: Generate Placeholder Storyboard Thumbnail (9:16 vertical concept draft)
app.post("/api/generate-placeholder-thumbnail", async (req, res) => {
  try {
    const { sceneTitle, visualAction, genre, stylePreset, beatNumber = 1, cameraSetup } = req.body;

    const actionText = visualAction || sceneTitle || "Suspense mystery scene beat";
    const ai = getGenAI();

    const sketchPrompt = `Vertical 9:16 movie storyboard concept art thumbnail. Beat ${beatNumber}: ${sceneTitle || "Scene Beat"}.
Scene Action: ${actionText}.
Genre & Atmosphere: ${genre || "Psychological Suspense Thriller"}, ${stylePreset || "Cinematic Dark Noir"}.
Camera Framing: ${cameraSetup || "Vertical 9:16 Close-Up"}.
Visual Style: Professional film storyboard concept sketch, chiaroscuro shading, dramatic suspense shadows, quick charcoal & digital concept painting, vertical mobile cinema framing, production storyboard draft style.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: sketchPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16",
            imageSize: "1K",
          },
        },
      });

      let base64Data: string | null = null;
      let mimeType = "image/png";

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Data = part.inlineData.data;
            if (part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            break;
          }
        }
      }

      if (base64Data) {
        return res.json({
          thumbnailUrl: `data:${mimeType};base64,${base64Data}`,
          isAiGenerated: true,
          beatNumber,
        });
      }
    } catch (aiErr: any) {
      console.warn("AI placeholder thumbnail model error:", aiErr.message);
    }

    // Graceful fallback response
    return res.json({
      thumbnailUrl: null,
      message: "AI thumbnail generation unavailable, fallback to curated thematic placeholder.",
    });
  } catch (error: any) {
    console.error("Placeholder generation error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate placeholder thumbnail." });
  }
});

// API: Edit Storyboard Image (Lighting & Composition AI Re-touch)
app.post("/api/edit-storyboard-image", async (req, res) => {
  try {
    const {
      imageBase64,
      editInstruction,
      compositionAdjustments,
      lightingAdjustments,
      aspectRatio = "9:16",
      imageSize = "1K",
    } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Source image is required for editing." });
    }

    const ai = getGenAI();
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    let promptText = `Modify this vertical 9:16 storyboard frame while preserving exact character identity and scene continuity.\n`;
    promptText += `Edit Request: ${editInstruction || "Adjust lighting and composition for enhanced suspense"}\n`;

    if (compositionAdjustments) {
      promptText += `Composition Changes: ${compositionAdjustments}\n`;
    }
    if (lightingAdjustments) {
      promptText += `Lighting & Shadow Adjustments: ${lightingAdjustments}\n`;
    }
    promptText += `Maintain vertical 9:16 cinematic framing and character facial consistency.`;

    const normalizedSize = ["1K", "2K", "4K"].includes(imageSize) ? imageSize : "1K";
    const normalizedAspect = ["9:16", "16:9", "1:1", "4:3", "3:4"].includes(aspectRatio)
      ? aspectRatio
      : "9:16";

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: "image/png",
            },
          },
          { text: promptText },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: normalizedAspect,
          imageSize: normalizedSize,
        },
      },
    });

    let base64Data: string | null = null;
    let mimeType = "image/png";

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Data = part.inlineData.data;
          if (part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          break;
        }
      }
    }

    if (!base64Data) {
      throw new Error("No edited image returned from model.");
    }

    return res.json({
      imageUrl: `data:${mimeType};base64,${base64Data}`,
      mimeType,
      imageSize: normalizedSize,
    });
  } catch (error: any) {
    console.error("Image editing error:", error);
    return res.status(500).json({
      error: error.message || "Failed to edit storyboard image.",
    });
  }
});

// API: Apply Global Style / Tone Preset across all scene prompts
app.post("/api/apply-global-style", async (req, res) => {
  try {
    const {
      stylePreset,
      stylePromptModifier = "",
      customStylePrompt = "",
      scenes = [],
      characters = [],
      genre = "Suspense Thriller",
      useAiHarmonizer = false,
    } = req.body;

    if (!stylePreset) {
      return res.status(400).json({ error: "Style preset is required." });
    }

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return res.status(400).json({ error: "Scenes array is required." });
    }

    // If AI harmonizer is requested, use Gemini to intelligently rewrite all prompts
    if (useAiHarmonizer) {
      try {
        const ai = getGenAI();
        const characterSummary = characters
          .map((c: any) => `${c.name}: ${c.appearanceDescription}`)
          .join("; ");

        const promptText = `You are a Master Film Cinematographer and Visual Tone Director for a vertical 9:16 Snapchat Movie.
Your job is to apply a UNIFIED GLOBAL STYLE & TONE across all scene beats to ensure visual aesthetic consistency across the entire film.

GLOBAL STYLE PRESET: "${stylePreset}"
STYLE VISUAL DIRECTIVES: "${stylePromptModifier}"
CUSTOM DIRECTOR STYLE NOTES: "${customStylePrompt || "None"}"
GENRE: "${genre}"
CHARACTER CONSISTENCY BIBLE: "${characterSummary || "None specified"}"

Here are the scenes to harmonize:
${JSON.stringify(
  scenes.map((s: any) => ({
    id: s.id,
    beatNumber: s.beatNumber,
    title: s.title,
    visualAction: s.visualAction,
    currentPrompt: s.imagePrompt,
    cameraSetup: s.cameraSetup,
  })),
  null,
  2
)}

Rewrite the imagePrompt for each scene beat to strictly embody the global visual style, color palette, lighting atmosphere, and 9:16 vertical cinema framing, while faithfully retaining the exact narrative action, characters, and camera angles.

Return ONLY a valid JSON array of objects with the exact schema:
[
  {
    "id": "scene_id",
    "updatedImagePrompt": "string (Vertical 9:16 cinematic storyboard still of...)",
    "suggestedLighting": "string (short lighting note for this beat in the global tone)"
  }
]`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: { parts: [{ text: promptText }] },
          config: {
            responseMimeType: "application/json",
          },
        });

        const jsonText = response.text || "";
        const harmonizedList = JSON.parse(jsonText);

        if (Array.isArray(harmonizedList) && harmonizedList.length > 0) {
          const harmonizedMap = new Map(harmonizedList.map((item: any) => [item.id, item]));
          const updatedScenes = scenes.map((s: any) => {
            const h = harmonizedMap.get(s.id);
            return {
              id: s.id,
              imagePrompt: h?.updatedImagePrompt || s.imagePrompt,
              lighting: h?.suggestedLighting || s.lighting,
            };
          });

          return res.json({
            success: true,
            method: "ai_harmonized",
            stylePreset,
            updatedScenes,
          });
        }
      } catch (aiErr: any) {
        console.warn("AI harmonizer failed, falling back to deterministic template:", aiErr.message);
      }
    }

    // Deterministic fallback / fast local transform
    const updatedScenes = scenes.map((s: any) => {
      let baseAction = s.visualAction || s.imagePrompt || s.title;
      // Strip common prefixes
      baseAction = baseAction.replace(/^Vertical 9:16 cinematic storyboard (?:still|frame).*?:/i, "").trim();
      baseAction = baseAction.split(/(?:Visual Cinematic Style:|Production Quality:)/i)[0].trim();
      baseAction = baseAction.replace(/[.,;]+$/, "").trim();

      const customText = customStylePrompt?.trim() ? ` ${customStylePrompt.trim()}.` : "";
      const updatedPrompt = `Vertical 9:16 cinematic storyboard still: ${baseAction}. Visual Cinematic Style: ${stylePreset}. ${stylePromptModifier}${customText} Camera Framing: ${s.cameraSetup || "Vertical 9:16 cinema framing"}. Production Quality: Masterclass cinema storyboard, color graded, photorealistic tension, 8k resolution look.`;

      return {
        id: s.id,
        imagePrompt: updatedPrompt,
      };
    });

    return res.json({
      success: true,
      method: "deterministic",
      stylePreset,
      updatedScenes,
    });
  } catch (error: any) {
    console.error("Apply global style error:", error);
    return res.status(500).json({ error: error.message || "Failed to apply global style preset." });
  }
});

// API: Multi-turn Chat using Gemini with role-specific system instructions
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      role = "director",
      modelPreference = "gemini-3.5-flash",
      projectContext,
    } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGenAI();

    // Select model based on task complexity instructions:
    // "Use gemini-3.1-pro-preview for particularly complex tasks, gemini-3.5-flash for general tasks, and gemini-3.1-flash-lite for tasks that should happen fast."
    let selectedModel = "gemini-3.5-flash";
    if (modelPreference === "gemini-3.1-pro-preview") {
      selectedModel = "gemini-3.1-pro-preview";
    } else if (modelPreference === "gemini-3.1-flash-lite") {
      selectedModel = "gemini-3.1-flash-lite";
    }

    // Role-based system instruction
    const roleInstructions: Record<string, string> = {
      director: `You are the Lead Snapchat Movie Director and Showrunner.
You specialize in 10-second vertical cinema (9:16) narrative pacing, suspense hooks, cliffhangers, viewer retention, and visual impact.
Provide creative, punchy, actionable advice for directing scenes, framing camera moves, and keeping audiences swiping for the next episode.`,

      script_doctor: `You are a Hollywood Script Doctor and 10-Second Pacing Specialist.
Your job is to restructure dialogue, amplify suspense, ensure every 10-second increment ends on a high-stakes cliffhanger, and eliminate story bloat.`,

      cinematographer: `You are an Award-Winning Director of Photography (DoP) and Lighting Designer.
You specialize in vertical framing (9:16), Dutch angles, volumetric fog, dramatic rim lighting, noir chiaroscuro, and camera focal lengths that heighten psychological dread.`,

      character_artist: `You are a Lead Concept Artist and Character Consistency Specialist.
You craft detailed character bibles (features, wardrobe, color accents, hair styles) to ensure AI generation tools produce 100% consistent characters across all storyboard panels.`,
    };

    let systemInstruction = roleInstructions[role] || roleInstructions.director;

    if (projectContext) {
      systemInstruction += `\n\nCurrent Project Context:
Title: ${projectContext.title || "Untitled Snapchat Project"}
Genre: ${projectContext.genre || "Thriller"}
Current Scene Count: ${projectContext.sceneCount || 0}
Active Characters: ${JSON.stringify(projectContext.characters || [])}`;
    }

    // Format messages for @google/genai
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || "No response generated.";

    return res.json({
      reply,
      modelUsed: selectedModel,
      role,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return res.status(500).json({
      error: error.message || "Failed to process chat message.",
    });
  }
});

// API: Cloud Sync & Team Collaboration
app.post("/api/cloud-sync/save", (req, res) => {
  try {
    const { projectId = "snap-project-default", projectData, user = "Director" } = req.body;
    projectStore.set(projectId, {
      ...projectData,
      lastSyncedAt: new Date().toISOString(),
      updatedBy: user,
    });

    collaborationActivityLog.unshift({
      id: crypto.randomUUID(),
      projectId,
      user,
      action: `Saved changes to project "${projectData?.title || projectId}"`,
      timestamp: new Date().toISOString(),
    });

    if (collaborationActivityLog.length > 50) {
      collaborationActivityLog.pop();
    }

    return res.json({
      success: true,
      lastSyncedAt: new Date().toISOString(),
      projectId,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/api/cloud-sync/load/:projectId", (req, res) => {
  const { projectId } = req.params;
  const project = projectStore.get(projectId);
  if (!project) {
    return res.status(404).json({ error: "Project not found on cloud." });
  }
  return res.json({ project });
});

app.get("/api/cloud-sync/activity", (_req, res) => {
  return res.json({ activities: collaborationActivityLog.slice(0, 20) });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SnapStory AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
