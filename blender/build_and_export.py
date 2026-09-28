"""
BioControl - Build + Save + Export GLB in one headless run
Blender 5.2
"""

import bpy, os

# ── Run main build script ─────────────────────────────────────
exec(open("E:/loyihalar/biocontrol/blender/build_anatomy_master.py").read())

# ── Save .blend ───────────────────────────────────────────────
BLEND_PATH = "E:/loyihalar/biocontrol/blender/biocontrol_anatomy_v2.blend"
bpy.ops.wm.save_as_mainfile(filepath=BLEND_PATH)
print(f"Saved .blend: {BLEND_PATH}")

# ── Export GLB ────────────────────────────────────────────────
GLB_PATH = "E:/loyihalar/biocontrol/client/public/models/face_anatomy.glb"
os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)

bpy.ops.object.select_all(action='DESELECT')

EXPORT_COLLECTIONS = [
    "ANATOMY_SKIN", "ANATOMY_EYES", "ANATOMY_NOSE", "ANATOMY_MOUTH",
    "ANATOMY_MUSCLES", "ANATOMY_BONES", "ANATOMY_VESSELS",
    "ANATOMY_NERVES", "ANATOMY_REGIONS",
]

for col_name in EXPORT_COLLECTIONS:
    col = bpy.data.collections.get(col_name)
    if col:
        for obj in col.all_objects:
            if obj.type in ('MESH', 'CURVE', 'EMPTY'):
                obj.hide_viewport = False
                obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format='GLB',
    use_selection=True,
    export_apply=True,
    export_materials='EXPORT',
    export_colors=True,
    export_normals=True,
    export_texcoords=True,
    export_animations=False,
    export_skins=False,
    export_lights=False,
    export_cameras=False,
    export_yup=True,
)

fsize = os.path.getsize(GLB_PATH) / (1024*1024) if os.path.exists(GLB_PATH) else 0
print(f"Exported GLB: {GLB_PATH} ({fsize:.2f} MB)")
