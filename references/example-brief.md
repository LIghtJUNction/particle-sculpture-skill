# Skill use: rotating apple and flapping bird

Input: the user's text request and api.lmm.best's existing procedural point renderer. These are new stylized subjects, with no claim to a scan or a specific bird species.

Apple: round but lobed red body, recessed crown and base, brown curved stem, shaped green leaf; continuous 16-second full rotation and a subtle four-second bob. Leaf and stem move rigidly with the apple. Warm directional color modulation makes depth readable.

Bird: blue back and feathers, cream chest, gold tapered beak, two visible eyes, forked tail. Both wings pivot at their shoulders with delayed outer tips, 1.5 wing cycles per second and subtle body banking. Wing roots stay attached; the body does not simply rotate in place as a substitute for flapping.

Camera: apple [.12,-.08], bird [.62,-.20]. Field: original fine dot lattice, dark green-black and warm paper themes. User interaction: actual pointer velocity disperses local points, then analytic springs restore the shape. Passive touch leaves native page gestures available.

Implementation: `examples/apple-bird/scenes.js`, shared `assets/runtime/`, and the root `index.html`. The starter is exercised by `scripts/create-demo.mjs` and its standalone page is browser-checked. Test and capture receipts are recorded in `VALIDATION.md` after execution.
