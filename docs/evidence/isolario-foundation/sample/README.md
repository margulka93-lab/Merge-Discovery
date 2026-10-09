# Composition review — initial and developed island

**Sample only; visual approval PENDING.** Two raster compositions, six browser captures at 1440×900, 390×844 and 320×568. Not final assets, a playable scene, proof of a renderer or a human playtest.

The same recognizable slate island keeps two basins, two earthen patches, the ridge and coastline. The developed sample intentionally chooses the west: fresh-water basin, fertile patch, one tree, one generic creature. The east stays bare to retain agency. Water/sky/geography in the initial illustration are backdrop support, not automatically owned canonical discoveries. No additional recipes, species, buildings or forest were introduced.

Image generation used the built-in **imagegen** skill/tool: one initial composition plus one edit preserving camera/geography. No batch of production props. Original generated source files were copied into this repository; nothing depends on the personal generated-images directory. Both source PNGs are 1536×1024; six captures are native browser viewport sizes. Text/header/dock are HTML, not baked into raster. The dock is a static layout study, not an interactive prototype.

Prompt set:

- **Initial:** fixed inclined/isometric 2.5D, entire solitary barren rocky island, pale warm slate shelf, two dry basins/two bare patches, rear ridge, dark navy cosmic ocean/sky, warm gold horizon, painterly tactile gouache and recognizable geology, negative space; no plants/animals/buildings/UI/text/voxel/glossy 3D/Laboratory.
- **Edit/developed:** preserve exact outline/camera/ridge/navy sea; fill west basin turquoise, gently wet coast, fertile west patch, one recognizable broad leafy tree and one small neutral cream generic creature beside habitat; east basin/patch remain bare; no flowers/forest/buildings/additional species or UI/text. Dawn warmer but navy identity retained.

## Planned asset registry / pivot convention

These are **planned**, not produced raster props. Foundation `islandContent.assets` uses explicitly provisional placeholder geometry. Final measured dimensions/pivots/hit bounds must replace it after the sample is approved. Registry refs are separate from canonical artKey.

| Planned layer | Pivot / footprint | Depth and interaction |
| --- | --- | --- |
| island base + sky/water | fixed whole-scene origin; logical 1000×700 frame | base layer 0, decorative, no canonical ownership |
| dry/full basin, wet coastline | center of ground contact, basin/coast anchor | terrain/environment, authored anchor depth |
| warm/lava/stable ridge | ground contact under ridge | explicit same-anchor replacement chain |
| fertile patch | center ground contact | separate terrain slot, can coexist with plant |
| seed / sprout / tree | root at patch anchor; footprint excludes canopy | living layer, stable depth by ground pivot |
| generic creature | feet at habitat anchor | same-zone water+tree, 44px DOM hotspot independent of raster scale |
| light | sky anchor, no ground footprint | static lighting variant under reduced motion |

One common scene→screen transform must drive SVG and DOM targets. On phone, scene stays whole, landmarks remain identifiable and native targets/list alternatives prevent precision tapping on the small creature. Overlap chooser and keyboard list belong to Island implementation, not this flattened sample. No timing/performance claim derives from the static raster.

Human review: island dominates; naturally painted terrain reads at 320px; before/after geography agrees; controls remain sparse; evaluate whether creature scale needs adjustment during asset separation. Approve or request changes before final asset production.
