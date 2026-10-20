import JSZip from "jszip";
import { ProjectData } from "../types";
import { getTransitionMeta } from "./transitionPresets";

// Generate standard EDL (Edit Decision List) format for NLE software
export function generateEDL(project: ProjectData): string {
  let edl = `TITLE: ${project.title.toUpperCase()}\nFCM: NON-DROP FRAME\n\n`;

  project.scenes.forEach((scene, index) => {
    const editNum = (index + 1).toString().padStart(3, "0");
    const startSec = index * 10;
    const endSec = (index + 1) * 10;

    const startTc = formatTimecode(startSec);
    const endTc = formatTimecode(endSec);

    const transition = scene.transitionToNext || project.defaultTransition;
    const transMeta = getTransitionMeta(transition?.type);
    const edlCode = transMeta.edlCode || "C";

    edl += `${editNum}  AX       V     ${edlCode.padEnd(8, " ")} ${startTc} ${endTc} ${startTc} ${endTc}\n`;
    edl += `* FROM CLIP: SCENE_${scene.beatNumber}_${scene.title.replace(/[^a-zA-Z0-9]/g, "_")}\n`;
    edl += `* CAMERA: ${scene.cameraSetup}\n`;
    edl += `* LIGHTING: ${scene.lighting}\n`;
    edl += `* SUSPENSE SCORE: ${scene.suspenseScore}/10 | CLIFFHANGER: ${scene.cliffhangerHook}\n`;
    if (transition && index < project.scenes.length - 1) {
      edl += `* 10S BREAK EFFECT: ${transMeta.name.toUpperCase()} (${transition.durationSeconds || 0.6}s) | AUDIO: ${transition.soundEffect || "None"}\n`;
    }
    edl += `* DIALOGUE: ${scene.dialogue || "N/A"}\n\n`;
  });

  return edl;
}

function formatTimecode(totalSeconds: number): string {
  const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const secs = (totalSeconds % 60).toString().padStart(2, "0");
  const frames = "00";
  return `${hrs}:${mins}:${secs}:${frames}`;
}

// Generate Production Shot List CSV for DaVinci / Premiere
export function generateCSV(project: ProjectData): string {
  const headers = [
    "Beat #",
    "Timecode",
    "Duration",
    "Beat Title",
    "Visual Action",
    "Camera Setup",
    "Lighting Notes",
    "Characters",
    "Dialogue",
    "Audio / SFX",
    "Suspense Score (1-10)",
    "10s Cliffhanger Hook",
    "10s Break Transition",
    "Transition Duration (s)",
    "Transition SFX Cue",
    "Resolution",
    "Status",
  ];

  const rows = project.scenes.map((scene, idx) => {
    const transition = scene.transitionToNext || project.defaultTransition;
    const transMeta = getTransitionMeta(transition?.type);
    const hasNext = idx < project.scenes.length - 1;

    return [
      scene.beatNumber,
      `"${scene.timecode}"`,
      `"${scene.duration}"`,
      `"${scene.title.replace(/"/g, '""')}"`,
      `"${scene.visualAction.replace(/"/g, '""')}"`,
      `"${scene.cameraSetup.replace(/"/g, '""')}"`,
      `"${scene.lighting.replace(/"/g, '""')}"`,
      `"${scene.charactersInScene.join(", ")}"`,
      `"${scene.dialogue.replace(/"/g, '""')}"`,
      `"${scene.soundEffects.replace(/"/g, '""')}"`,
      scene.suspenseScore,
      `"${scene.cliffhangerHook.replace(/"/g, '""')}"`,
      hasNext ? `"${transMeta.name}"` : '"End of Movie"',
      hasNext ? (transition?.durationSeconds || 0.6) : "0",
      hasNext ? `"${(transition?.soundEffect || "").replace(/"/g, '""')}"` : '""',
      scene.imageSize || project.selectedImageSize,
      scene.status,
    ];
  });

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// Export a full ZIP bundle containing images, CSV, EDL, and Project metadata
export async function exportProductionBundle(project: ProjectData): Promise<void> {
  const zip = new JSZip();
  const folderName = `${project.title.replace(/[^a-zA-Z0-9_-]/g, "_")}_Snapchat_Storyboards`;
  const folder = zip.folder(folderName) || zip;

  // Add Project metadata JSON
  folder.file("project_metadata.json", JSON.stringify(project, null, 2));

  // Add EDL & CSV
  folder.file("storyboard_timeline.edl", generateEDL(project));
  folder.file("shot_list_production.csv", generateCSV(project));

  // Add Character Bible text file
  let characterDoc = `CHARACTER BIBLE FOR: ${project.title}\n`;
  characterDoc += `==============================================\n\n`;
  project.characters.forEach((char) => {
    characterDoc += `CHARACTER: ${char.name} (${char.role}, Age: ${char.age})\n`;
    characterDoc += `APPEARANCE: ${char.appearanceDescription}\n`;
    characterDoc += `WARDROBE: ${char.signatureWardrobe}\n`;
    characterDoc += `COLOR PALETTE: ${char.colorPalette}\n\n`;
  });
  folder.file("character_consistency_bible.txt", characterDoc);

  // Add images folder
  const imagesFolder = folder.folder("storyboard_frames_9x16");
  const imagePromises = project.scenes.map(async (scene) => {
    if (scene.generatedImageUrl) {
      try {
        let blob: Blob | null = null;
        if (scene.generatedImageUrl.startsWith("data:")) {
          // Base64 data URL
          const parts = scene.generatedImageUrl.split(",");
          const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          blob = new Blob([u8arr], { type: mime });
        } else {
          // External URL
          const resp = await fetch(scene.generatedImageUrl);
          blob = await resp.blob();
        }

        if (blob && imagesFolder) {
          const filename = `Beat_${scene.beatNumber.toString().padStart(2, "0")}_[${scene.timecode.replace(/[: ]/g, "-")}]_${scene.imageSize || "2K"}.png`;
          imagesFolder.file(filename, blob);
        }
      } catch (err) {
        console.warn(`Could not bundle image for beat ${scene.beatNumber}:`, err);
      }
    }
  });

  await Promise.all(imagePromises);

  // Generate ZIP blob and trigger download
  const content = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${folderName}_Package.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(downloadUrl);
}

// Print / PDF Director's Storyboard Binder
export function printStoryboardBinder(project: ProjectData): void {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to generate the printable storyboard binder.");
    return;
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${project.title} - Snapchat Movie Storyboard Binder</title>
  <style>
    @page { size: portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111; line-height: 1.4; margin: 0; padding: 20px; }
    .header { border-bottom: 3px solid #111; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 28px; font-weight: 800; margin: 0; }
    .meta { font-size: 13px; color: #555; }
    .badge { background: #000; color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .character-box { background: #f5f5f5; border: 1px solid #ddd; padding: 12px; margin-bottom: 20px; border-radius: 6px; font-size: 13px; }
    .character-box h3 { margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; }
    .card { page-break-inside: avoid; border: 1px solid #ccc; border-radius: 8px; margin-bottom: 24px; padding: 16px; display: flex; gap: 20px; }
    .image-col { width: 220px; flex-shrink: 0; }
    .frame-img { width: 100%; aspect-ratio: 9/16; object-fit: cover; border-radius: 6px; border: 1px solid #000; }
    .placeholder-box { width: 100%; aspect-ratio: 9/16; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #777; border-radius: 6px; }
    .info-col { flex: 1; }
    .timecode { font-size: 18px; font-weight: 800; color: #d97706; margin-bottom: 4px; }
    .beat-title { font-size: 20px; font-weight: bold; margin: 0 0 10px 0; }
    .field { margin-bottom: 8px; font-size: 13px; }
    .field-label { font-weight: 700; color: #333; text-transform: uppercase; font-size: 11px; }
    .cliffhanger { background: #fee2e2; border-left: 4px solid #ef4444; padding: 8px 12px; margin-top: 10px; border-radius: 0 4px 4px 0; font-size: 13px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">${project.title}</h1>
      <div class="meta">${project.genre} &bull; Target: Snapchat Movies (10s Increments, 9:16 Vertical)</div>
      <div class="meta" style="margin-top: 4px;">Logline: ${project.logline}</div>
    </div>
    <div style="text-align: right;">
      <span class="badge">Director Production Binder</span>
      <div class="meta" style="margin-top: 6px;">${new Date().toLocaleDateString()}</div>
    </div>
  </div>

  <div class="character-box">
    <h3>AI Character Consistency Bible</h3>
    ${project.characters
      .map(
        (c) =>
          `<strong>${c.name} (${c.role}):</strong> ${c.appearanceDescription} &bull; <em>Wearing: ${c.signatureWardrobe}</em>`
      )
      .join("<br/>")}
  </div>

  ${project.scenes
    .map(
      (scene, index) => `
    <div class="card">
      <div class="image-col">
        ${
          scene.generatedImageUrl
            ? `<img class="frame-img" src="${scene.generatedImageUrl}" alt="Beat ${scene.beatNumber}" />`
            : `<div class="placeholder-box">9:16 Frame<br/>[Draft / Not Generated]</div>`
        }
      </div>
      <div class="info-col">
        <div class="timecode">Beat ${scene.beatNumber}: ${scene.timecode} (${scene.duration})</div>
        <h2 class="beat-title">${scene.title}</h2>
        
        <div class="field">
          <span class="field-label">Visual Action:</span>
          <div>${scene.visualAction}</div>
        </div>

        <div class="field">
          <span class="field-label">Dialogue:</span>
          <div>${scene.dialogue || "<em>None</em>"}</div>
        </div>

        <div class="field">
          <span class="field-label">Camera & Lighting:</span>
          <div>Framing: <strong>${scene.cameraSetup}</strong> &bull; Lighting: <strong>${scene.lighting}</strong></div>
        </div>

        <div class="field">
          <span class="field-label">Sound & SFX:</span>
          <div>${scene.soundEffects || "<em>Standard ambient</em>"}</div>
        </div>

        <div class="cliffhanger">
          <strong>10-Sec Cliffhanger Hook (Suspense Score: ${scene.suspenseScore}/10):</strong><br/>
          ${scene.cliffhangerHook}
        </div>

        ${
          index < project.scenes.length - 1
            ? `
          <div style="margin-top: 10px; padding: 6px 10px; background: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 0 4px 4px 0; font-size: 12px; color: #0369a1;">
            <strong>&Delta; 10s Break Visual Effect:</strong> ${
              getTransitionMeta((scene.transitionToNext || project.defaultTransition)?.type).name
            } (${(scene.transitionToNext || project.defaultTransition)?.durationSeconds || 0.6}s) &bull; <em>SFX: ${
                (scene.transitionToNext || project.defaultTransition)?.soundEffect || "Standard drop"
              }</em>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `
    )
    .join("")}
  
  <script>
    window.onload = function() {
      setTimeout(() => { window.print(); }, 500);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
