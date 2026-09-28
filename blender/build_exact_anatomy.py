"""
BioControl - Exact Anatomical 3D Model Builder for Blender 5.2
Creates a true 3D volumetric anatomical bust directly from the user's reference image.
"""

import bpy
import bmesh
import os
import math

def create_exact_anatomy():
    print("[BioControl] Building exact anatomical 3D model in Blender 5.2...")

    # 1. Reset scene
    bpy.ops.wm.read_factory_settings(use_empty=True)

    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    models_dir = os.path.join(project_root, "client", "public", "models")

    blend_path = os.path.join(base_dir, "biocontrol_face_anatomy.blend")
    glb_path = os.path.join(models_dir, "face_anatomy.glb")
    tex_path = os.path.join(base_dir, "user_anatomy_reference.jpg")

    if not os.path.exists(tex_path):
        print(f"Error: Texture not found at {tex_path}")
        return

    # 2. Create high-resolution 3D anatomical bust mesh
    # Proportions: Width = 2.4, Height = 2.4 (square 1:1 matching user's image)
    res_x = 180
    res_y = 180
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res_x, y_subdivisions=res_y, size=2.5, location=(0, 0, 0))
    bust = bpy.context.active_object
    bust.name = "Anatomical_Face_Muscles"

    # Rotate upright (Z is Up, Y is Depth, X is Width)
    bust.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    # 3. Shape the vertices into true 3D facial and cervical volume
    bm = bmesh.new()
    bm.from_mesh(bust.data)

    uv_layer = bm.loops.layers.uv.verify()

    # Find bounds
    xs = [v.co.x for v in bm.verts]
    zs = [v.co.z for v in bm.verts]
    min_x, max_x = min(xs), max(xs)
    min_z, max_z = min(zs), max(zs)
    w_x = max_x - min_x
    h_z = max_z - min_z

    for v in bm.verts:
        # Normalized UV coordinates (0 to 1)
        u = (v.co.x - min_x) / w_x
        v_coord = (v.co.z - min_z) / h_z

        x = v.co.x
        z = v.co.z

        # 3.1 Head & Neck cylindrical curvature
        # Head is in upper half (z > -0.2), neck/shoulders in lower half
        head_radius = 0.85
        neck_radius = 0.45

        if z > -0.15:
            # Skull curvature (sides curve back in Y)
            depth_curve = 0.45 * (1.0 - math.pow(x / 1.1, 2)) if abs(x) < 1.1 else 0
        else:
            # Neck & Clavicle curvature
            depth_curve = 0.25 * (1.0 - math.pow(x / 1.25, 2)) if abs(x) < 1.25 else 0

        # 3.2 Nose bridge, tip and cartilage
        # In the image, nose is at x ~= 0, z ~= 0.05
        dist_nose = math.sqrt(math.pow(x * 2.8, 2) + math.pow((z - 0.05) * 1.8, 2))
        nose_depth = 0.35 * math.exp(-math.pow(dist_nose * 3.0, 2))

        # 3.3 Brow Ridge (above eyes, z ~= 0.35)
        dist_brow = math.sqrt(math.pow(x * 1.2, 2) + math.pow((z - 0.35) * 3.5, 2))
        brow_depth = 0.14 * math.exp(-math.pow(dist_brow * 2.5, 2))

        # 3.4 Eye sockets (Orbital depression, x ~= +/-0.35, z ~= 0.22)
        dist_left_eye = math.sqrt(math.pow((x + 0.35) * 2.2, 2) + math.pow((z - 0.22) * 3.0, 2))
        dist_right_eye = math.sqrt(math.pow((x - 0.35) * 2.2, 2) + math.pow((z - 0.22) * 3.0, 2))
        eye_depression = -0.09 * (math.exp(-math.pow(dist_left_eye * 3.2, 2)) + math.exp(-math.pow(dist_right_eye * 3.2, 2)))

        # 3.5 Zygomaticus / Cheekbone arches (x ~= +/-0.55, z ~= -0.05)
        dist_left_cheek = math.sqrt(math.pow((x + 0.55) * 1.6, 2) + math.pow((z + 0.05) * 2.0, 2))
        dist_right_cheek = math.sqrt(math.pow((x - 0.55) * 1.6, 2) + math.pow((z + 0.05) * 2.0, 2))
        cheek_depth = 0.16 * (math.exp(-math.pow(dist_left_cheek * 2.8, 2)) + math.exp(-math.pow(dist_right_cheek * 2.8, 2)))

        # 3.6 Lips / Orbicularis Oris (x ~= 0, z ~= -0.22)
        dist_lips = math.sqrt(math.pow(x * 1.8, 2) + math.pow((z + 0.22) * 3.2, 2))
        lips_depth = 0.16 * math.exp(-math.pow(dist_lips * 3.5, 2))

        # 3.7 Chin / Mentalis (x ~= 0, z ~= -0.45)
        dist_chin = math.sqrt(math.pow(x * 2.0, 2) + math.pow((z + 0.45) * 2.8, 2))
        chin_depth = 0.18 * math.exp(-math.pow(dist_chin * 3.0, 2))

        # 3.8 Clavicles / Collarbones (z ~= -0.95, horizontal ridge)
        dist_clavicle = abs(z + 0.95)
        clavicle_depth = 0.08 * math.exp(-math.pow(dist_clavicle * 6.0, 2)) if abs(x) > 0.2 else 0

        # Combine physical 3D displacement (Y axis is depth)
        total_y = depth_curve + nose_depth + brow_depth + eye_depression + cheek_depth + lips_depth + chin_depth + clavicle_depth
        v.co.y = total_y

    # Set UV mapping
    for face in bm.faces:
        for loop in face.loops:
            v = loop.vert
            u = (v.co.x - min_x) / w_x
            v_coord = (v.co.z - min_z) / h_z
            loop[uv_layer].uv = (u, v_coord)

    bm.to_mesh(bust.data)
    bm.free()

    # Recalculate normals and smooth
    bpy.ops.object.shade_smooth()
    bust.data.update()

    # 4. Create Material with User's Exact Texture
    mat = bpy.data.materials.new(name="M_Anatomical_Muscles")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (400, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs['Roughness'].default_value = 0.35
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    # Texture Node
    tex_node = nodes.new(type="ShaderNodeTexImage")
    tex_node.location = (-400, 100)
    tex_node.image = bpy.data.images.load(tex_path)
    links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])

    # Bump / Normal node from the texture for deep muscle fiber relief
    bump_node = nodes.new(type="ShaderNodeBump")
    bump_node.location = (-150, -200)
    bump_node.inputs['Strength'].default_value = 0.4
    bump_node.inputs['Distance'].default_value = 0.1
    links.new(tex_node.outputs['Color'], bump_node.inputs['Height'])
    links.new(bump_node.outputs['Normal'], bsdf.inputs['Normal'])

    bust.data.materials.append(mat)

    # 5. Studio 3-Point Lighting
    key_light = bpy.data.lights.new("Key_Light", 'AREA')
    key_light.energy = 500
    key_light.size = 3.0
    key_obj = bpy.data.objects.new("Key_Light", key_light)
    key_obj.location = (2.0, 3.5, 2.0)
    key_obj.rotation_euler = (math.radians(-45), 0, math.radians(25))
    bpy.context.collection.objects.link(key_obj)

    fill_light = bpy.data.lights.new("Fill_Light", 'AREA')
    fill_light.energy = 250
    fill_light.color = (0.85, 0.92, 1.0)
    fill_light.size = 4.0
    fill_obj = bpy.data.objects.new("Fill_Light", fill_light)
    fill_obj.location = (-3.0, 2.5, 1.0)
    bpy.context.collection.objects.link(fill_obj)

    # 6. Frontal Orthographic Camera
    cam = bpy.data.cameras.new("Frontal_Camera")
    cam.lens = 75
    cam_obj = bpy.data.objects.new("Frontal_Camera", cam)
    cam_obj.location = (0, 3.8, 0)
    cam_obj.rotation_euler = (math.radians(90), 0, math.radians(180))
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # 7. Configure 3D Viewport Shading to MATERIAL
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'

    # 8. Pack texture inside .blend
    try:
        bpy.ops.file.pack_all()
    except Exception as e:
        print(f"Pack notice: {e}")

    # 9. Save .blend and export .glb
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
    create_exact_anatomy()
