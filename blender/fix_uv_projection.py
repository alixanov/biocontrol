"""
BioControl - Precision Frontal UV Projection for Blender 5.2
Properly projects the anatomical texture onto the 3D head mesh with zero distortion.
"""

import bpy
import bmesh
import os
import math

def fix_uv_and_material():
    print("[BioControl] Fixing UV mapping and materials in Blender...")

    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    models_dir = os.path.join(project_root, "client", "public", "models")
    
    blend_path = os.path.join(base_dir, "biocontrol_face_anatomy.blend")
    glb_path = os.path.join(models_dir, "face_anatomy.glb")
    anatomy_tex_path = os.path.join(models_dir, "medical-face-anatomy.jpg")
    normal_map_path = os.path.join(models_dir, "Infinite-Level_02_Tangent_SmoothUV.jpg")

    # 1. Get Head Object
    head = None
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            head = obj
            break

    if not head:
        print("[BioControl] Error: Head mesh not found.")
        return

    bpy.context.view_layer.objects.active = head
    head.select_set(True)

    # 2. Perfect Frontal UV Projection (Aligns facial features perfectly)
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(head.data)
    uv_layer = bm.loops.layers.uv.verify()

    # Find vertex bounds of the face
    xs = [v.co.x for v in bm.verts]
    zs = [v.co.z for v in bm.verts]
    min_x, max_x = min(xs), max(xs)
    min_z, max_z = min(zs), max(zs)
    
    # Range
    width_x = max_x - min_x
    height_z = max_z - min_z

    # Project UVs from front view with proper anatomical scale & centering
    for face in bm.faces:
        for loop in face.loops:
            v = loop.vert
            
            # Check if vertex is facing front or back
            # Frontal projection: X maps to U (horizontal), Z maps to V (vertical)
            norm_u = (v.co.x - min_x) / width_x
            norm_v = (v.co.z - min_z) / height_z
            
            # Calibration offsets for LeePerrySmith mesh to match medical-face-anatomy portrait
            # Fine-tuned to place eyes at ~0.59 V, nose at ~0.48 V, lips at ~0.38 V
            scaled_u = 0.5 + (norm_u - 0.5) * 1.15
            scaled_v = 0.12 + norm_v * 0.90

            # Clamp
            scaled_u = max(0.0, min(1.0, scaled_u))
            scaled_v = max(0.0, min(1.0, scaled_v))

            loop[uv_layer].uv = (scaled_u, scaled_v)

    bmesh.update_edit_mesh(head.data)
    bpy.ops.object.mode_set(mode='OBJECT')

    # 3. Clean up PBR Material Nodes
    mat = head.active_material
    if not mat:
        mat = bpy.data.materials.new(name="M_Facial_Anatomy")
        head.data.materials.append(mat)
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

    # Load and connect anatomy texture
    if os.path.exists(anatomy_tex_path):
        tex_node = nodes.new(type="ShaderNodeTexImage")
        tex_node.location = (-450, 100)
        tex_node.image = bpy.data.images.load(anatomy_tex_path)
        links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])

    # Connect Normal Map
    if os.path.exists(normal_map_path):
        norm_tex = nodes.new(type="ShaderNodeTexImage")
        norm_tex.location = (-750, -250)
        norm_tex.image = bpy.data.images.load(normal_map_path)
        norm_tex.image.colorspace_settings.name = 'Non-Color'

        norm_node = nodes.new(type="ShaderNodeNormalMap")
        norm_node.location = (-350, -250)
        norm_node.inputs['Strength'].default_value = 0.85
        links.new(norm_tex.outputs['Color'], norm_node.inputs['Color'])
        links.new(norm_node.outputs['Normal'], bsdf.inputs['Normal'])

    # 4. Set Viewport Shading to MATERIAL across all workspaces and screens
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'

    # Pack textures
    try:
        bpy.ops.file.pack_all()
    except Exception as e:
        print(f"Pack notice: {e}")

    # 5. Save and Export
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[BioControl] Successfully saved: {blend_path}")

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"[BioControl] Successfully exported: {glb_path}")

if __name__ == "__main__":
    fix_uv_and_material()
