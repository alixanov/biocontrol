"""
BioControl - GLB Export Script
Blender 5.2 - Run AFTER build_anatomy_master.py has built the scene
Exports the REALTIME collection to face_anatomy.glb for the web app.

Run via: File > Scripting > Open > select this file > Run Script
OR headless: blender.exe biocontrol_face_anatomy.blend --python export_glb.py
"""

import bpy
import os

OUTPUT_PATH = "E:/loyihalar/biocontrol/client/public/models/face_anatomy.glb"

# ─── Ensure output directory exists ────────────────────────────
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

# ─── Select objects to export ──────────────────────────────────
# For REALTIME GLB: export skin, eyes, nose, mouth, regions
# Hide muscles/bones/vessels/nerves for smaller file size

bpy.ops.object.select_all(action='DESELECT')

EXPORT_COLLECTIONS = [
    "ANATOMY_SKIN",
    "ANATOMY_EYES",
    "ANATOMY_NOSE",
    "ANATOMY_MOUTH",
    "ANATOMY_MUSCLES",
    "ANATOMY_BONES",
    "ANATOMY_VESSELS",
    "ANATOMY_NERVES",
    "ANATOMY_REGIONS",
]

for col_name in EXPORT_COLLECTIONS:
    col = bpy.data.collections.get(col_name)
    if col:
        for obj in col.all_objects:
            if obj.type in ('MESH', 'CURVE', 'EMPTY'):
                obj.select_set(True)
                # Temporarily unhide for export
                obj.hide_viewport = False

# Export as GLB
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_PATH,
    export_format='GLB',
    use_selection=True,
    export_apply=True,           # Apply modifiers
    export_materials='EXPORT',
    export_colors=True,
    export_normals=True,
    export_texcoords=True,
    export_animations=False,
    export_skins=False,
    export_lights=False,
    export_cameras=False,
    export_yup=True,             # Three.js uses Y-up
)

# Re-hide internal layers
for col_name in ["ANATOMY_MUSCLES", "ANATOMY_BONES", "ANATOMY_VESSELS",
                 "ANATOMY_NERVES", "ANATOMY_SUBCUTANEOUS"]:
    col = bpy.data.collections.get(col_name)
    if col:
        for obj in col.all_objects:
            obj.hide_viewport = True
            obj.hide_render = True

bpy.ops.object.select_all(action='DESELECT')

fsize = os.path.getsize(OUTPUT_PATH) / (1024*1024) if os.path.exists(OUTPUT_PATH) else 0

print("=" * 60)
print("  GLB EXPORT COMPLETE")
print("=" * 60)
print(f"  File: {OUTPUT_PATH}")
print(f"  Size: {fsize:.2f} MB")
print("")
print("  The web app at http://localhost:3007 will now load")
print("  the updated model automatically.")
print("=" * 60)
