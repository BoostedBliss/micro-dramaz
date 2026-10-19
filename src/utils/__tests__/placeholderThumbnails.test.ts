import { describe, it, expect } from "bun:test";
import { generateSvgStoryboardPlaceholder, getThematicPlaceholderThumbnail } from "../placeholderThumbnails";

describe("generateSvgStoryboardPlaceholder", () => {
  it("should return a valid SVG data URI", () => {
    const result = generateSvgStoryboardPlaceholder({
      beatNumber: 1,
      timecode: "00:00:00:00",
      title: "Test Title"
    });

    expect(result).toStartWith("data:image/svg+xml;utf8,");
    const svgContent = decodeURIComponent(result.replace("data:image/svg+xml;utf8,", ""));
    expect(svgContent).toStartWith("<svg");
    expect(svgContent).toEndWith("</svg>");
  });

  it("should embed required options correctly", () => {
    const result = generateSvgStoryboardPlaceholder({
      beatNumber: 42,
      timecode: "01:23:45:12",
      title: "Epic Explosion"
    });

    const svgContent = decodeURIComponent(result.replace("data:image/svg+xml;utf8,", ""));
    expect(svgContent).toContain("BEAT 42");
    expect(svgContent).toContain("01:23:45:12");
    expect(svgContent).toContain("Epic Explosion");
  });

  it("should use default genre and cameraSetup when omitted", () => {
    const result = generateSvgStoryboardPlaceholder({
      beatNumber: 1,
      timecode: "00:00:00:00",
      title: "Test Title"
    });

    const svgContent = decodeURIComponent(result.replace("data:image/svg+xml;utf8,", ""));
    expect(svgContent).toContain("GENRE: Suspense Thriller");
    expect(svgContent).toContain("SETUP: Vertical 9:16 Close-Up");
  });

  it("should embed provided genre and cameraSetup", () => {
    const result = generateSvgStoryboardPlaceholder({
      beatNumber: 1,
      timecode: "00:00:00:00",
      title: "Test Title",
      genre: "Sci-Fi Action",
      cameraSetup: "Wide Angle"
    });

    const svgContent = decodeURIComponent(result.replace("data:image/svg+xml;utf8,", ""));
    expect(svgContent).toContain("GENRE: Sci-Fi Action");
    expect(svgContent).toContain("SETUP: Wide Angle");
  });

  it("should strip HTML characters from title, genre, and cameraSetup", () => {
    const result = generateSvgStoryboardPlaceholder({
      beatNumber: 1,
      timecode: "00:00:00:00",
      title: 'Bad <Title> & "Stuff"',
      genre: 'Horror <&>',
      cameraSetup: '"Dirty" <Setup>'
    });

    const svgContent = decodeURIComponent(result.replace("data:image/svg+xml;utf8,", ""));
    expect(svgContent).toContain("Bad Title  Stuff");
    expect(svgContent).toContain("Horror ");
    expect(svgContent).toContain("Dirty Setup");

    // Ensure the original bad characters are not present in the SVG output
    // (excluding the ones that are legitimately part of the SVG syntax)
    // Actually, searching the whole SVG for '<' would match SVG tags.
    // Let's just check the exact strings.
    expect(svgContent).not.toContain("Bad <Title>");
    expect(svgContent).not.toContain("Horror <&>");
  });

  it("should cycle through colors based on beatNumber", () => {
    const result1 = generateSvgStoryboardPlaceholder({ beatNumber: 1, timecode: "0", title: "T" });
    const result2 = generateSvgStoryboardPlaceholder({ beatNumber: 6, timecode: "0", title: "T" });

    // The SVGs differ slightly because they contain BEAT 1 vs BEAT 6,
    // so we shouldn't assert equality on the entire string.
    // Instead we check the accent color `#f59e0b` (the primary color for index 0)
    expect(decodeURIComponent(result1)).toContain("#f59e0b");
    expect(decodeURIComponent(result2)).toContain("#f59e0b");

    const result3 = generateSvgStoryboardPlaceholder({ beatNumber: 2, timecode: "0", title: "T" });
    // beatNumber 2 should use cyan: #06b6d4
    expect(decodeURIComponent(result3)).toContain("#06b6d4");
  });
});

describe("getThematicPlaceholderThumbnail", () => {
  it("should match subway keywords", () => {
    const result = getThematicPlaceholderThumbnail("Drama", 1, "taking the train to work");
    expect(result).toContain("photo-1517649763962"); // The unsplash ID for subway
  });

  it("should match sci-fi/cyber keywords", () => {
    const result = getThematicPlaceholderThumbnail("sci-fi", 1, "walking");
    expect(result).toContain("photo-1526374965328"); // The unsplash ID for glitch surveillance
  });

  it("should match horror keywords", () => {
    const result = getThematicPlaceholderThumbnail("horror", 1, "nothing");
    expect(result).toContain("photo-1579783902614"); // The unsplash ID for red darkroom
  });

  it("should fallback to cyclic thumbnails when no keywords match", () => {
    const result1 = getThematicPlaceholderThumbnail("comedy", 1, "talking");
    const result2 = getThematicPlaceholderThumbnail("comedy", 9, "talking"); // 9-1 = 8, 8 % 8 = 0
    expect(result1).toEqual(result2);

    const result3 = getThematicPlaceholderThumbnail("comedy", 2, "talking");
    expect(result1).not.toEqual(result3);
  });
});
