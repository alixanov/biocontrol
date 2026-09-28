import bpy, os
exec(open("E:/loyihalar/biocontrol/blender/build_head_v3.py").read())

# Save blend
bpy.ops.wm.save_as_mainfile(filepath="E:/loyihalar/biocontrol/blender/biocontrol_anatomy_v3.blend")
print("Saved blend v3")

# Export GLB
GLB = "E:/loyihalar/biocontrol/client/public/models/face_anatomy.glb"
os.makedirs(os.path.dirname(GLB), exist_ok=True)
bpy.ops.object.select_all(action="DESELECT")

for col_name in ["ANATOMY_SKIN","ANATOMY_EYES","ANATOMY_NOSE","ANATOMY_MOUTH",
                 "ANATOMY_MUSCLES","ANATOMY_BONES","ANATOMY_VESSELS",
                 "ANATOMY_NERVES","ANATOMY_REGIONS"]:
    col = bpy.data.collections.get(col_name)
    if col:
        for obj in col.all_objects:
            if obj and obj.type in ("MESH","CURVE","EMPTY"):
                obj.hide_viewport = False
                obj.select_set(True)

bpy.ops.export_scene.gltf(
    filepath=GLB,
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
sz = os.path.getsize(GLB)/(1024*1024) if os.path.exists(GLB) else 0
print(f"GLB exported: {GLB} ({sz:.2f} MB)")
