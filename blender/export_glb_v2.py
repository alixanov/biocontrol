import bpy, os

GLB_PATH = "E:/loyihalar/biocontrol/client/public/models/face_anatomy.glb"
os.makedirs(os.path.dirname(GLB_PATH), exist_ok=True)

bpy.ops.object.select_all(action="DESELECT")

EXPORT_COLS = [
    "ANATOMY_SKIN", "ANATOMY_EYES", "ANATOMY_NOSE", "ANATOMY_MOUTH",
    "ANATOMY_MUSCLES", "ANATOMY_BONES", "ANATOMY_VESSELS",
    "ANATOMY_NERVES", "ANATOMY_REGIONS",
]

for col_name in EXPORT_COLS:
    col = bpy.data.collections.get(col_name)
    if col:
        for obj in col.all_objects:
            if obj is None:
                continue
            if obj.type in ("MESH", "CURVE", "EMPTY"):
                obj.hide_viewport = False
                obj.select_set(True)

print("Selected objects:", len([o for o in bpy.data.objects if o.select_get()]))
print("Collections in scene:", list(bpy.data.collections.keys()))

bpy.ops.export_scene.gltf(
    filepath=GLB_PATH,
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_materials="EXPORT",
    export_normals=True,
    export_texcoords=True,
    export_animations=False,
    export_skins=False,
    export_lights=False,
    export_cameras=False,
    export_yup=True,
)

fsize = os.path.getsize(GLB_PATH) / (1024*1024) if os.path.exists(GLB_PATH) else 0
print(f"GLB exported: {GLB_PATH} ({fsize:.2f} MB)")
