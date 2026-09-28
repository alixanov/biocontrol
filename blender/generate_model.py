"""
BioControl - Blender 5.2 Anatomical Face Model Setup & Packer
Packs textures, sets up optimal viewport, materials, and exports to both .blend and .glb
"""

import bpy
import os
import math

def build_scene():
    print("[BioControl] Building complete Blender 5.2 scene...")

    # Clear everything
    bpy.ops.wm.read_factory_settings(use_empty=True)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    models_dir = os.path.join(project_root, "client", "public", "models")
    
    blend_path = os.path.join(base_dir, "biocontrol_face_anatomy.blend")
    glb_path = os.path.join(models_dir, "face_anatomy.glb")
    
    anatomy_tex_path = os.path.join(models_dir, "medical-face-anatomy.jpg")
    normal_map_path = os.path.join(models_dir, "Infinite-Level_02_Tangent_SmoothUV.jpg")
    lee_perry_path = os.path.join(models_dir, "LeePerrySmith.glb")

    # 1. Import Head Mesh
    head_obj = None
    if os.path.exists(lee_perry_path):
        print(f"Importing {lee_perry_path}...")
        bpy.ops.import_scene.gltf(filepath=lee_perry_path)
        for obj in bpy.context.selected_objects:
            if obj.type == 'MESH':
                head_obj = obj
                break

    if not head_obj:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=48, radius=1.0)
        head_obj = bpy.context.active_object
        head_obj.scale = (0.92, 1.25, 1.05)
        bpy.ops.object.transform_apply(scale=True)

    head_obj.name = "Human_Face_Anatomy"
    head_obj.location = (0, 0, 0)
    bpy.context.view_layer.objects.active = head_obj
    head_obj.select_set(True)

    # Smooth shading
    bpy.ops.object.shade_smooth()

    # 2. Material with PBR Textures
    mat = bpy.data.materials.new(name="M_Facial_Anatomy")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output_node = nodes.new(type="ShaderNodeOutputMaterial")
    output_node.location = (400, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs['Roughness'].default_value = 0.35
    links.new(bsdf.outputs['BSDF'], output_node.inputs['Surface'])

    # Diffuse / Anatomy Image
    if os.path.exists(anatomy_tex_path):
        tex_node = nodes.new(type="ShaderNodeTexImage")
        tex_node.location = (-400, 100)
        tex_node.image = bpy.data.images.load(anatomy_tex_path)
        links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])

    # Normal Map
    if os.path.exists(normal_map_path):
        norm_tex = nodes.new(type="ShaderNodeTexImage")
        norm_tex.location = (-650, -250)
        norm_tex.image = bpy.data.images.load(normal_map_path)
        norm_tex.image.colorspace_settings.name = 'Non-Color'

        norm_node = nodes.new(type="ShaderNodeNormalMap")
        norm_node.location = (-250, -250)
        norm_node.inputs['Strength'].default_value = 0.85
        links.new(norm_tex.outputs['Color'], norm_node.inputs['Color'])
        links.new(norm_node.outputs['Normal'], bsdf.inputs['Normal'])

    if head_obj.data.materials:
        head_obj.data.materials[0] = mat
    else:
        head_obj.data.materials.append(mat)

    # 3. Studio Lighting
    # Main Key Light
    key_light = bpy.data.lights.new("Key_Light", 'AREA')
    key_light.energy = 600
    key_light.size = 2.0
    key_obj = bpy.data.objects.new("Key_Light", key_light)
    key_obj.location = (2.5, -3.5, 2.0)
    key_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(35))
    bpy.context.collection.objects.link(key_obj)

    # Fill Light (Soft Cyan)
    fill_light = bpy.data.lights.new("Fill_Light", 'AREA')
    fill_light.energy = 300
    fill_light.color = (0.7, 0.9, 1.0)
    fill_light.size = 3.0
    fill_obj = bpy.data.objects.new("Fill_Light", fill_light)
    fill_obj.location = (-3.5, -2.5, 1.0)
    bpy.context.collection.objects.link(fill_obj)

    # Rim Light
    rim_light = bpy.data.lights.new("Rim_Light", 'POINT')
    rim_light.energy = 450
    rim_obj = bpy.data.objects.new("Rim_Light", rim_light)
    rim_obj.location = (0, 3.0, 2.0)
    bpy.context.collection.objects.link(rim_obj)

    # 4. Camera
    cam = bpy.data.cameras.new("Frontal_Camera")
    cam.lens = 85
    cam_obj = bpy.data.objects.new("Frontal_Camera", cam)
    cam_obj.location = (0, -3.6, 0.1)
    cam_obj.rotation_euler = (math.radians(88), 0, 0)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # 5. Pack all textures directly inside the .blend file so nothing is missing
    try:
        bpy.ops.file.pack_all()
        print("[BioControl] Textures successfully packed into .blend!")
    except Exception as e:
        print(f"Pack notice: {e}")

    # 6. Save .blend file
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[BioControl] Saved: {blend_path}")

    # 7. Export GLB
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"[BioControl] Exported: {glb_path}")

if __name__ == "__main__":
    build_scene()
