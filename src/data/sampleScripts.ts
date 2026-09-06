import { ProjectData } from "../types";

export interface SampleScript {
  id: string;
  title: string;
  tagline: string;
  genre: string;
  stylePreset: string;
  rawScript: string;
  prepopulatedProject: ProjectData;
}

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: "glitch_apartment_404",
    title: "The Glitch in 404",
    tagline: "Every 10 seconds, her mirror reflects something that hasn't happened yet.",
    genre: "Psychological Sci-Fi Thriller",
    stylePreset: "Cinematic Dark Thriller (Teal & Amber, moody lighting, anamorphic rim lighting)",
    rawScript: `TITLE: THE GLITCH IN 404
GENRE: Vertical Psychological Thriller / Snapchat Original
LOGLINE: A cybersecurity analyst trapped in her smart penthouse discovers her reflection lags by 10 seconds—and each delay reveals an intruder stepping closer.

CHARACTERS:
MAYA CHEN (26): Elite security architect. Sharp jawline, dark bob haircut with emerald dyed fringe, fierce observant amber-brown eyes. Wearing an oversized charcoal techwear hoodie, fingerless gloves, and a titanium fitness ring that flashes green.
THE WATCHER (Unknown): Tall silhouette in an iridescent holographic hooded jacket, mirrored face shield, silently stalking just behind Maya's blind spot.

[00:00 - 00:10] BEAT 1: THE DELAYED BLINK
INT. PENTHOUSE 404 - BATHROOM - NIGHT
Steam swirls. MAYA rinses cold water on her face, lifts her head, and blinks.
In the high-tech smart mirror, HER REFLECTION DOES NOT BLINK. It stays staring.
MAYA
(whisper)
Wait...
Her reflection tilts its head slowly to the left. Maya hasn't moved.
SFX: Low bass drone drops out completely. Sudden digital audio glitch chirp.
CLIFFHANGER: The mirror Maya mouths a silent warning: "DON'T TURN AROUND."

[00:10 - 00:20] BEAT 2: THE 10-SECOND COUNTDOWN
INT. PENTHOUSE - HALLWAY - CONTINUOUS
Maya stumbles backward out into the hallway. The smart home displays turn violent amber:
[AUDIO SENSOR: LIVING ROOM - 2 HEARTBEATS DETECTED]
Maya's titanium ring buzzes violently. A shadow crosses under the bathroom door.
MAYA
Siri, lock front entry!
SMART HOME VOICE
(distorted glitch)
Entry unlocked for: Master Keyholder.
CLIFFHANGER: Behind Maya, the shadow begins lifting a crowbar into the doorway frame.

[00:20 - 00:30] BEAT 3: THE SMARTPHONE CAMERA GLITCH
INT. LIVING ROOM - CONTINUOUS
Maya whips out her phone, switching to the front-facing Snapchat camera.
In the screen preview, Maya's phone shows THE WATCHER standing two inches behind her right shoulder. But when she spins around—the spot is empty.
MAYA
(gasping)
Where are you?!
SFX: Piercing riser sting.
CLIFFHANGER: A cold gloved hand enters the phone camera frame and taps the red "RECORD" button on her screen.

[00:30 - 00:40] BEAT 4: THE GLASS BREACH
INT. PENTHOUSE LIVING ROOM - FLOOR-TO-CEILING WINDOW - CONTINUOUS
Lightning illuminates the Seattle skyline. Maya scrambles toward the glass balcony door.
The smart glass frosts over automatically, forming etched neon letters: "INSTALLMENT 2 STARTS NOW."
Maya slams her hand against the emergency release.
SFX: Deafening glass fissure crack.
CLIFFHANGER: The Watcher's reflection appears directly in front of her glass pane, raising a finger to its lips: "Shhh."`,
    prepopulatedProject: {
      id: "project_glitch_404",
      title: "The Glitch in 404",
      logline: "A cybersecurity analyst trapped in her smart penthouse discovers her reflection lags by 10 seconds—and each delay reveals an intruder stepping closer.",
      genre: "Psychological Sci-Fi Thriller",
      visualTone: "High-contrast teal and neon amber, deep suspense shadows, vertical 9:16 mobile frame tension",
      targetPlatform: "Snapchat Movies (10s Increments, 9:16 Vertical)",
      stylePreset: "Cinematic Dark Thriller (Teal & Amber, moody lighting, anamorphic rim lighting)",
      customStylePrompt: "David Fincher tension meets Ex Machina vertical framing, anamorphic flares, cinematic grain",
      selectedImageSize: "2K",
      selectedAspectRatio: "9:16",
      defaultTransition: {
        type: "glitch_flash",
        durationSeconds: 0.6,
        soundEffect: "Digital static distortion burst with tape-stop drop",
        notes: "Glitch Static / Tape Stop",
      },
      lastSavedAt: new Date().toISOString(),
      version: 1,
      characters: [
        {
          id: "char_maya",
          name: "Maya Chen",
          age: "26",
          role: "Protagonist / Security Architect",
          appearanceDescription: "Sharp jawline, dark bob haircut with emerald dyed fringe, fierce observant amber-brown eyes, slender athletic build",
          signatureWardrobe: "Oversized charcoal techwear hoodie, dark joggers, glowing green titanium ring",
          colorPalette: "Charcoal, emerald green, neon teal",
          isActive: true,
        },
        {
          id: "char_watcher",
          name: "The Watcher",
          age: "Unknown",
          role: "Antagonist / Stalker",
          appearanceDescription: "Tall imposing silhouette, mirrored chrome face shield reflecting dark rooms, ominous stealth posture",
          signatureWardrobe: "Iridescent holographic hooded stealth jacket, black tactical gloves, combat boots",
          colorPalette: "Chrome, deep obsidian, glitch magenta",
          isActive: true,
        },
      ],
      scenes: [
        {
          id: "beat_1",
          beatNumber: 1,
          timecode: "00:00 - 00:10",
          duration: "10s",
          title: "The Delayed Blink",
          visualAction: "Extreme close-up of Maya Chen in front of a fogged bathroom mirror. Maya blinks once in terror, but her mirror reflection stays staring unblinkingly directly at the camera.",
          dialogue: "MAYA (whisper): 'Wait...'",
          soundEffects: "Sub-bass rumble drops suddenly into eerie silence; digital glitch chirp",
          cameraSetup: "Extreme Vertical Close-Up (9:16) with Dutch tilt angle",
          lighting: "Cool cyan neon backlight with cold white bathroom downlight, rim lighting on Maya's bob haircut",
          suspenseScore: 9,
          cliffhangerHook: "Reflection tilts head and mouths 'DON'T TURN AROUND' right at the 9th second.",
          charactersInScene: ["Maya Chen"],
          imagePrompt: "Vertical 9:16 cinematic storyboard still of Maya Chen, 26, dark bob haircut with emerald fringe, sharp jawline, standing before a high-tech steam-fogged smart mirror in a luxury penthouse bathroom. Maya blinks in terror, but her reflection in the mirror is NOT blinking and stares directly ahead with an unsettling calm grin. Cinematic teal and amber rim lighting, intense psychological dread, Fincher suspense atmosphere, hyper-detailed skin texture, 8k movie still.",
          generatedImageUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
          imageSize: "2K",
          aspectRatio: "9:16",
          modelUsed: "gemini-3-pro-image-preview",
          lightingAdjustments: {
            brightness: 0,
            contrast: 15,
            exposure: -5,
            vignette: 30,
            colorTemp: -20,
            tintColor: "cyan",
            tintOpacity: 25,
            grain: 15,
          },
          compositionAdjustments: {
            scale: 1,
            panX: 0,
            panY: 0,
            framingPreset: "extreme_close_up",
            cameraOverlay: "rule_of_thirds",
            cameraMovement: "push_in",
          },
          directorNotes: "Push the camera in fast from 00:04 to 00:09, ending on Maya's wide pupil reflection.",
          status: "approved",
          transitionToNext: {
            type: "glitch_flash",
            durationSeconds: 0.5,
            soundEffect: "Digital static distortion burst with tape-stop drop",
            notes: "Glitch Static / Tape Stop",
          },
        },
        {
          id: "beat_2",
          beatNumber: 2,
          timecode: "00:10 - 00:20",
          duration: "10s",
          title: "The 10-Second Countdown",
          visualAction: "Maya stumbles backward out of the bathroom into the narrow penthouse hallway. Wall consoles glow amber warning. A towering shadow looms on the bathroom wall behind her.",
          dialogue: "SMART HOME VOICE: 'Entry unlocked for: Master Keyholder.'",
          soundEffects: "Violent biometric ring buzz; heavy footsteps muffled on hardwood",
          cameraSetup: "Low-Angle Vertical Tracking Shot (9:16) looking up at hallway ceiling lights",
          lighting: "Pulsing amber emergency accent strips against deep obsidian shadow corridors",
          suspenseScore: 8,
          cliffhangerHook: "A heavy crowbar silhouette enters the doorframe at 00:19.",
          charactersInScene: ["Maya Chen", "The Watcher"],
          imagePrompt: "Vertical 9:16 movie still, narrow luxury dark corridor. Maya Chen in charcoal techwear hoodie backing away in panic, ring glowing emerald on her finger. Towering menacing silhouette of The Watcher in hooded jacket holding a crowbar stepping into the hallway background. Harsh amber emergency wall lights cast long sinister shadows. Cinematic suspense, shallow depth of field.",
          generatedImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
          imageSize: "2K",
          aspectRatio: "9:16",
          modelUsed: "gemini-3-pro-image-preview",
          lightingAdjustments: {
            brightness: -5,
            contrast: 20,
            exposure: -10,
            vignette: 45,
            colorTemp: 15,
            tintColor: "amber",
            tintOpacity: 20,
            grain: 20,
          },
          compositionAdjustments: {
            scale: 1.05,
            panX: 0,
            panY: -5,
            framingPreset: "medium_shot",
            cameraOverlay: "director_crosshair",
            cameraMovement: "tilt_down",
          },
          directorNotes: "Audience needs to feel the claustrophobia of vertical framing here.",
          status: "approved",
          transitionToNext: {
            type: "fade_to_black",
            durationSeconds: 0.6,
            soundEffect: "Deep heart-stopping bass drop with low sub rumble",
            notes: "Fade to Black (Deep Suspense)",
          },
        },
        {
          id: "beat_3",
          beatNumber: 3,
          timecode: "00:20 - 00:30",
          duration: "10s",
          title: "The Smartphone Camera Glitch",
          visualAction: "POV of Maya holding her smartphone in 9:16 Snapchat selfie mode. On the screen, The Watcher is right behind her neck, but the living room behind her is empty in physical space.",
          dialogue: "MAYA: 'Where are you?!'",
          soundEffects: "Staccato heartbeat riser; high frequency tinnitus ring",
          cameraSetup: "Smartphone Screen In-Screen POV (Snapchat UI overlay simulation)",
          lighting: "Phone screen glow illuminating Maya's panicked face with cold white luminescence",
          suspenseScore: 10,
          cliffhangerHook: "An iridescent gloved hand reaches over her shoulder on the phone screen and taps 'RECORD'.",
          charactersInScene: ["Maya Chen", "The Watcher"],
          imagePrompt: "Vertical 9:16 first-person view of a smartphone screen held in trembling hands. On screen is a selfie preview of Maya Chen looking terrified. Standing directly behind her in the phone viewfinder is a shadowy figure in a chrome reflective mask. The background room behind the phone is pitch black. Intense neon reflections, realistic mobile cinema, A24 horror style.",
          generatedImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          imageSize: "2K",
          aspectRatio: "9:16",
          modelUsed: "gemini-3-pro-image-preview",
          lightingAdjustments: {
            brightness: 5,
            contrast: 25,
            exposure: 0,
            vignette: 35,
            colorTemp: -10,
            tintColor: "purple",
            tintOpacity: 15,
            grain: 10,
          },
          compositionAdjustments: {
            scale: 1,
            panX: 0,
            panY: 0,
            framingPreset: "close_up",
            cameraOverlay: "snapchat_ui",
            cameraMovement: "snap_zoom",
          },
          directorNotes: "The ultimate Snapchat hook—playing with the native medium!",
          status: "generated",
          transitionToNext: {
            type: "cross_dissolve",
            durationSeconds: 0.7,
            soundEffect: "High-tension riser drone with eerie pitch bend",
            notes: "Cross-Dissolve (Dreamy / Disorienting)",
          },
        },
        {
          id: "beat_4",
          beatNumber: 4,
          timecode: "00:30 - 00:40",
          duration: "10s",
          title: "The Glass Breach",
          visualAction: "Maya reaches the penthouse balcony glass wall. Rain cascades outside. The glass frosts over with digital text: 'INSTALLMENT 2 STARTS NOW'. The Watcher's face shield taps the outside glass.",
          dialogue: "VOICEOVER: 'You can't delete what's already saved.'",
          soundEffects: "Glass stress fracture audio shock; lightning boom rattle",
          cameraSetup: "Wide Vertical Framing with Maya silhouette against rain-streaked high-rise window",
          lighting: "Lightning blast of brilliant blue-white, casting high-contrast silhouette",
          suspenseScore: 10,
          cliffhangerHook: "The glass cracks in spiderweb pattern as the 10-second timer hits 00:40—'SWIPE UP TO SURVIVE'.",
          charactersInScene: ["Maya Chen", "The Watcher"],
          imagePrompt: "Vertical 9:16 cinematic frame. Maya Chen pressed against a giant floor-to-ceiling penthouse window at night during a torrential thunderstorm. Blue lightning flash silhouette. Outside the rain-slicked glass on the high-rise ledge stands The Watcher in chrome mask, hand pressed against the glass as cracks form. Deep blue and orange neon city lights below. Suspense climax movie poster quality.",
          generatedImageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&auto=format&fit=crop&q=80",
          imageSize: "2K",
          aspectRatio: "9:16",
          modelUsed: "gemini-3-pro-image-preview",
          lightingAdjustments: {
            brightness: -5,
            contrast: 30,
            exposure: 5,
            vignette: 40,
            colorTemp: -30,
            tintColor: "cyan",
            tintOpacity: 30,
            grain: 25,
          },
          compositionAdjustments: {
            scale: 1,
            panX: 0,
            panY: 0,
            framingPreset: "high_angle",
            cameraOverlay: "golden_spiral",
            cameraMovement: "push_in",
          },
          directorNotes: "End of Episode 1 micro-season hook. Leaves audience desperate for Season 1 Episode 2.",
          status: "approved",
        },
      ],
    },
  },
  {
    id: "midnight_subway_car_6",
    title: "Car 6 Has No Driver",
    tagline: "The last subway stop was 2 hours ago. The doors just welded shut.",
    genre: "Urban Supernatural Thriller",
    stylePreset: "Gritty Found Footage / Smartphone POV (analog grain, flashlight glare, hyper-immersive Snapchat POV)",
    rawScript: `TITLE: CAR 6 HAS NO DRIVER
FORMAT: 10-Second Snapchat Micro-Series
LOGLINE: A commuter on the last uptown train realizes the car is accelerating through stations that don't exist on the subway map.

[00:00 - 00:10] BEAT 1: THE MISSED PLATFORM
KAI (22, yellow rain jacket, headphones around neck) watches Grand Central flash past at 90mph. The speedometer display in the car reads 'SPEED: LIMITLESS'.
CLIFFHANGER: The emergency brake lever snaps off in his hand.

[00:10 - 00:20] BEAT 2: THE PASSENGER WHO DOESN'T BREATHE
At the end of the flickering subway car, an elderly man in a 1940s trench coat turns around. His eyes are replaced with miniature spinning train wheels.
CLIFFHANGER: The lights flicker out, and in the dark, footsteps sprint toward Kai at supersonic speed.`,
    prepopulatedProject: {
      id: "project_subway_6",
      title: "Car 6 Has No Driver",
      logline: "A commuter on the last uptown train realizes the car is accelerating through stations that don't exist on the subway map.",
      genre: "Urban Supernatural Thriller",
      visualTone: "Gritty fluorescent flickers, grime, sodium vapor tunnels, raw 9:16 smartphone panic",
      targetPlatform: "Snapchat Movies (10s Increments, 9:16 Vertical)",
      stylePreset: "Gritty Found Footage / Smartphone POV (analog grain, flashlight glare, hyper-immersive Snapchat POV)",
      customStylePrompt: "Analog VHS tape grain, fluorescent tube hum, sweat and claustrophobic vertical framing",
      selectedImageSize: "1K",
      selectedAspectRatio: "9:16",
      lastSavedAt: new Date().toISOString(),
      version: 1,
      characters: [
        {
          id: "char_kai",
          name: "Kai Vance",
          age: "22",
          role: "Night-shift Barista / Commuter",
          appearanceDescription: "Tired dark circles under warm brown eyes, curly brown hair, silver hoop earring in right ear",
          signatureWardrobe: "Bright mustard-yellow vintage rain jacket, oversized grey hoodie, white wired earbuds",
          colorPalette: "Mustard yellow, dirty chrome, subterranean green",
          isActive: true,
        },
      ],
      scenes: [
        {
          id: "beat_sub_1",
          beatNumber: 1,
          timecode: "00:00 - 00:10",
          duration: "10s",
          title: "The Missed Platform",
          visualAction: "Kai clutches a yellow pole as the subway car hurtles at blinding speed past a pitch-black abandoned station platform. Neon blur streaks across the window.",
          dialogue: "KAI: 'Wait, this train doesn't skip 14th Street!'",
          soundEffects: "Metal screeching on rails at 100mph; warning siren klaxon",
          cameraSetup: "Shaky Vertical Handheld POV (9:16)",
          lighting: "Sickly fluorescent green overhead tubes strobing erratically",
          suspenseScore: 8,
          cliffhangerHook: "Emergency brake handle shears off in Kai's hand with a metallic snap.",
          charactersInScene: ["Kai Vance"],
          imagePrompt: "Vertical 9:16 movie still. Shaky handheld camera POV inside an empty vintage subway train car hurtling at extreme velocity through a pitch black tunnel. Kai Vance, 22, curly hair, wearing a bright yellow rain jacket, desperately holding a broken red emergency brake handle. Fluorescent flickering lights, motion blurred tunnel graffiti through the window, claustrophobic urban thriller.",
          generatedImageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
          imageSize: "1K",
          aspectRatio: "9:16",
          modelUsed: "gemini-3-pro-image-preview",
          lightingAdjustments: {
            brightness: -5,
            contrast: 15,
            exposure: 0,
            vignette: 25,
            colorTemp: -15,
            tintColor: "emerald",
            tintOpacity: 25,
            grain: 30,
          },
          compositionAdjustments: {
            scale: 1,
            panX: 0,
            panY: 0,
            framingPreset: "medium_shot",
            cameraOverlay: "none",
            cameraMovement: "snap_zoom",
          },
          status: "approved",
        },
        {
          id: "beat_sub_2",
          beatNumber: 2,
          timecode: "00:10 - 00:20",
          duration: "10s",
          title: "The Passenger Who Doesn't Breathe",
          visualAction: "At the end of the flickering subway car, a silhouette in an antique trench coat slowly turns around. Harsh fluorescent strobe reveals miniature spinning train wheels reflecting in the eyes.",
          dialogue: "KAI: 'Sir? Can you hear me? Is anyone driving this car?!'",
          soundEffects: "Rapid staccato footsteps sprinting through darkness; subsonic train rumble",
          cameraSetup: "Low Angle Vertical Tracking (9:16) with extreme perspective vanishing point",
          lighting: "Intermittent fluorescent strobe flash with deep obsidian shadows",
          suspenseScore: 9,
          cliffhangerHook: "Lights die completely; sound of sprinting feet reaches Kai's ear at 00:19.",
          charactersInScene: ["Kai Vance"],
          imagePrompt: "Vertical 9:16 cinematic storyboard still, vintage subway car interior at midnight. Kai Vance clutching a handrail looking down the narrow aisle at an eerie motionless silhouette in a trench coat. Flickering green fluorescent lights, high contrast chiaroscuro, photorealistic horror tension, 8k movie still.",
          placeholderThumbnailUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=720&h=1280&q=80",
          imageSize: "1K",
          aspectRatio: "9:16",
          lightingAdjustments: {
            brightness: -10,
            contrast: 25,
            exposure: -5,
            vignette: 40,
            colorTemp: -25,
            tintColor: "emerald",
            tintOpacity: 35,
            grain: 20,
          },
          compositionAdjustments: {
            scale: 1.1,
            panX: 0,
            panY: -5,
            framingPreset: "close_up",
            cameraOverlay: "rule_of_thirds",
            cameraMovement: "push_in",
          },
          status: "draft",
        },
      ],
    },
  },
];

export const sampleGlitchApartmentProject: ProjectData = SAMPLE_SCRIPTS[0].prepopulatedProject;
export const sampleSubwayGhostProject: ProjectData = SAMPLE_SCRIPTS[1].prepopulatedProject;
