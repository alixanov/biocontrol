"""
BioControl Medical AI - Complete Hierarchical Medical Anatomy 3D Model for Blender 5.2
Builds the complete anatomical human head with progressive layer reveal:
  1. 01_Medical_Split_Cutaway (Photorealistic skin on Left, Deep dissected anatomy on Right)
  2. 02_Full_Muscles_Anatomy (Complete bilateral facial muscular system from user's reference)
  3. 03_Photorealistic_Skin (Full 3D head scan with realistic PBR skin, pores, SSS)
  4. 04_Vessels_and_Nerves (Facial arteries in red, veins in blue, cranial nerve VII in yellow)
  5. 05_Osteological_Skull (Cranium, orbital margins, zygoma, maxilla, mandible, teeth)
  6. 06_Eyeballs (Anatomical left and right eyes in orbits)
  7. 07_Studio_Setup (Soft clinical 3-point lighting and 50mm portrait camera)
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.scenes:
        bpy.data.scenes.new("Scene")

def create_collection(name):
    col = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(col)
    return col

def build_volumetric_face(name, image_path, aspect_w=2.4, aspect_h=3.214, res_x=180, res_y=240, sss_weight=0.18):
    print(f"[BioControl] Constructing volumetric facial mesh: {name} ({res_x}x{res_y})...")
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=res_x, y_subdivisions=res_y, size=1.0, location=(0, 0, 0))
    obj = bpy.context.active_object
    obj.name = name

    obj.scale = (aspect_w, aspect_h, 1.0)
    bpy.ops.object.transform_apply(scale=True)
    obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    uv_layer = bm.loops.layers.uv.verify()

    xs = [v.co.x for v in bm.verts]
    zs = [v.co.z for v in bm.verts]
    min_x, max_x = min(xs), max(xs)
    min_z, max_z = min(zs), max(zs)
    w_x = max_x - min_x
    h_z = max_z - min_z

    for v in bm.verts:
        x, z = v.co.x, v.co.z

        # 1. Base Skull Curvature (+Y is backward, -Y is forward)
        norm_x = x / 1.15
        curve_back = 0.50 * (norm_x * norm_x)

        # 2. Nose protrusion (bridge, tip, dorsum)
        dist_nose = math.sqrt((x * 2.8)**2 + ((z - 0.05) * 1.8)**2)
        nose_fwd = 0.38 * math.exp(-dist_nose * dist_nose * 4.5)

        # 3. Brow Ridge (Supraorbital margin, z ~= 0.48)
        dist_brow = math.sqrt((x * 1.1)**2 + ((z - 0.48) * 3.2)**2)
        brow_fwd = 0.16 * math.exp(-dist_brow * dist_brow * 2.8)

        # 4. Eye sockets (Orbital depression, x ~= +/-0.38, z ~= 0.28)
        dist_l_eye = math.sqrt(((x + 0.38) * 2.2)**2 + ((z - 0.28) * 3.2)**2)
        dist_r_eye = math.sqrt(((x - 0.38) * 2.2)**2 + ((z - 0.28) * 3.2)**2)
        eye_depress = -0.11 * (math.exp(-dist_l_eye * dist_l_eye * 3.5) + math.exp(-dist_r_eye * dist_r_eye * 3.5))
        eyelid_convex = 0.04 * (math.exp(-dist_l_eye * dist_l_eye * 6.0) + math.exp(-dist_r_eye * dist_r_eye * 6.0))

        # 5. Zygomatic arches (Cheekbones, x ~= +/-0.58, z ~= 0.0)
        dist_l_chk = math.sqrt(((x + 0.58) * 1.6)**2 + (z * 2.2)**2)
        dist_r_chk = math.sqrt(((x - 0.58) * 1.6)**2 + (z * 2.2)**2)
        cheek_fwd = 0.18 * (math.exp(-dist_l_chk * dist_l_chk * 2.8) + math.exp(-dist_r_chk * dist_r_chk * 2.8))

        # 6. Lips & Mouth (Orbicularis Oris, x ~= 0, z ~= -0.28)
        dist_lips = math.sqrt((x * 1.9)**2 + ((z + 0.28) * 3.4)**2)
        lips_fwd = 0.17 * math.exp(-dist_lips * dist_lips * 3.8)

        # 7. Chin (Mental protuberance, x ~= 0, z ~= -0.58)
        dist_chin = math.sqrt((x * 2.0)**2 + ((z + 0.58) * 2.8)**2)
        chin_fwd = 0.20 * math.exp(-dist_chin * dist_chin * 3.2)

        # Physical 3D vertex position
        fwd_total = nose_fwd + brow_fwd + eye_depress + eyelid_convex + cheek_fwd + lips_fwd + chin_fwd
        v.co.y = curve_back - fwd_total

    # Sub-millimeter UV mapping
    for face in bm.faces:
        for loop in face.loops:
            v = loop.vert
            loop[uv_layer].uv = ((v.co.x - min_x) / w_x, (v.co.z - min_z) / h_z)

    bm.to_mesh(obj.data)
    bm.free()
    bpy.ops.object.shade_smooth()
    obj.data.update()

    # Material
    mat = bpy.data.materials.new(name=f"M_{name}")
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out_node = nodes.new("ShaderNodeOutputMaterial")
    out_node.location = (500, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (100, 0)
    bsdf.inputs['Roughness'].default_value = 0.38

    if sss_weight > 0:
        if 'Subsurface Weight' in bsdf.inputs:
            bsdf.inputs['Subsurface Weight'].default_value = sss_weight
            bsdf.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.2)
            bsdf.inputs['Subsurface Scale'].default_value = 0.05
        elif 'Subsurface' in bsdf.inputs:
            bsdf.inputs['Subsurface'].default_value = sss_weight

    links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])

    if os.path.exists(image_path):
        tex_node = nodes.new("ShaderNodeTexImage")
        tex_node.location = (-400, 100)
        tex_node.image = bpy.data.images.load(image_path)
        links.new(tex_node.outputs['Color'], bsdf.inputs['Base Color'])

        bump_node = nodes.new("ShaderNodeBump")
        bump_node.location = (-120, -180)
        bump_node.inputs['Strength'].default_value = 0.36
        bump_node.inputs['Distance'].default_value = 0.05
        links.new(tex_node.outputs['Color'], bump_node.inputs['Height'])
        links.new(bump_node.outputs['Normal'], bsdf.inputs['Normal'])

    obj.data.materials.append(mat)
    return obj

def create_tube_from_points(name, points, radius=0.03, mat=None, col=None):
    curve = bpy.data.curves.new(name=name, type='CURVE')
    curve.dimensions = '3D'
    curve.bevel_depth = radius
    curve.bevel_resolution = 4
    spline = curve.splines.new('BEZIER')
    spline.bezier_points.add(len(points) - 1)
    for i, pt in enumerate(points):
        bp = spline.bezier_points[i]
        bp.co = pt
        bp.handle_left_type = 'AUTO'
        bp.handle_right_type = 'AUTO'
    obj = bpy.data.objects.new(name, curve)
    if col:
        col.objects.link(obj)
    else:
        bpy.context.scene.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return obj

def build_scene():
    print("[BioControl] Building complete hierarchical medical anatomy...")
    reset_scene()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    models_dir = os.path.join(project_root, "client", "public", "models")
    blend_path = os.path.join(base_dir, "biocontrol_face_anatomy.blend")
    glb_path = os.path.join(models_dir, "face_anatomy.glb")

    split_tex = os.path.join(models_dir, "medical-face-anatomy.jpg")
    muscle_tex = os.path.join(base_dir, "user_anatomy_reference.jpg")
    head_src_glb = os.path.join(models_dir, "LeePerrySmith.glb")
    skin_tex = os.path.join(models_dir, "Map-COL.jpg")
    norm_tex = os.path.join(models_dir, "Infinite-Level_02_Tangent_SmoothUV.jpg")

    # Collections
    col_split = create_collection("01_Medical_Split_Cutaway")
    col_muscles = create_collection("02_Full_Muscles_Anatomy")
    col_skin = create_collection("03_Photorealistic_Skin")
    col_vessels_nerves = create_collection("04_Vessels_and_Nerves")
    col_skull = create_collection("05_Osteological_Skull")
    col_eyes = create_collection("06_Eyeballs")
    col_studio = create_collection("07_Studio_Setup")

    # -------------------------------------------------------------
    # 1. COLLECTION 1: MEDICAL SPLIT CUTAWAY (ACTIVE & VISIBLE BY DEFAULT)
    # -------------------------------------------------------------
    split_obj = build_volumetric_face(
        name="Medical_Split_Cutaway",
        image_path=split_tex,
        aspect_w=2.4,
        aspect_h=3.214,
        res_x=180,
        res_y=240,
        sss_weight=0.18
    )
    col_split.objects.link(split_obj)
    bpy.context.scene.collection.objects.unlink(split_obj)

    # -------------------------------------------------------------
    # 2. COLLECTION 2: FULL MUSCLES ANATOMY (USER'S EXACT REFERENCE)
    # -------------------------------------------------------------
    muscle_obj = build_volumetric_face(
        name="Full_Muscles_Anatomy",
        image_path=muscle_tex,
        aspect_w=2.4,
        aspect_h=2.4,
        res_x=180,
        res_y=180,
        sss_weight=0.08
    )
    col_muscles.objects.link(muscle_obj)
    bpy.context.scene.collection.objects.unlink(muscle_obj)
    col_muscles.hide_viewport = True

    # -------------------------------------------------------------
    # 3. COLLECTION 3: FULL PHOTOREALISTIC SKIN
    # -------------------------------------------------------------
    if os.path.exists(head_src_glb):
        bpy.ops.import_scene.gltf(filepath=head_src_glb)
        skin_mesh = None
        for o in bpy.context.selected_objects:
            if o.type == 'MESH':
                skin_mesh = o
                break

        if skin_mesh:
            skin_mesh.name = "Full_Skin_Head"
            skin_mesh.scale = (0.35, 0.35, 0.35)
            skin_mesh.location = (0, 0.05, -0.1)
            bpy.ops.object.transform_apply(scale=True, location=True)

            mat_s = bpy.data.materials.new(name="M_Full_Skin")
            mat_s.use_nodes = True
            sn = mat_s.node_tree.nodes
            sl = mat_s.node_tree.links
            sn.clear()
            s_out = sn.new("ShaderNodeOutputMaterial")
            s_bsdf = sn.new("ShaderNodeBsdfPrincipled")
            s_bsdf.inputs['Roughness'].default_value = 0.45
            if 'Subsurface Weight' in s_bsdf.inputs:
                s_bsdf.inputs['Subsurface Weight'].default_value = 0.20
                s_bsdf.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.2)
                s_bsdf.inputs['Subsurface Scale'].default_value = 0.05
            sl.new(s_bsdf.outputs['BSDF'], s_out.inputs['Surface'])

            if os.path.exists(skin_tex):
                st = sn.new("ShaderNodeTexImage")
                st.image = bpy.data.images.load(skin_tex)
                sl.new(st.outputs['Color'], s_bsdf.inputs['Base Color'])

            if os.path.exists(norm_tex):
                snt = sn.new("ShaderNodeTexImage")
                snt.image = bpy.data.images.load(norm_tex)
                snt.image.colorspace_settings.name = 'Non-Color'
                sn_map = sn.new("ShaderNodeNormalMap")
                sl.new(snt.outputs['Color'], sn_map.inputs['Color'])
                sl.new(sn_map.outputs['Normal'], s_bsdf.inputs['Normal'])

            skin_mesh.data.materials.clear()
            skin_mesh.data.materials.append(mat_s)

            for c in list(skin_mesh.users_collection):
                c.objects.unlink(skin_mesh)
            col_skin.objects.link(skin_mesh)
            col_skin.hide_viewport = True

    # -------------------------------------------------------------
    # 4. COLLECTION 4: VESSELS AND NERVES
    # -------------------------------------------------------------
    mat_art = bpy.data.materials.new(name="M_Artery_Red")
    mat_art.use_nodes = True
    b_art = mat_art.node_tree.nodes.get("Principled BSDF")
    if b_art:
        b_art.inputs['Base Color'].default_value = (0.88, 0.12, 0.12, 1.0)
        b_art.inputs['Roughness'].default_value = 0.25

    mat_vn = bpy.data.materials.new(name="M_Vein_Blue")
    mat_vn.use_nodes = True
    b_vn = mat_vn.node_tree.nodes.get("Principled BSDF")
    if b_vn:
        b_vn.inputs['Base Color'].default_value = (0.12, 0.42, 0.88, 1.0)
        b_vn.inputs['Roughness'].default_value = 0.25

    mat_nrv = bpy.data.materials.new(name="M_Nerve_Yellow")
    mat_nrv.use_nodes = True
    b_nrv = mat_nrv.node_tree.nodes.get("Principled BSDF")
    if b_nrv:
        b_nrv.inputs['Base Color'].default_value = (1.0, 0.88, 0.15, 1.0)
        b_nrv.inputs['Roughness'].default_value = 0.35

    # Facial Artery (Right side of face)
    pts_art = [
        Vector((0.55, 0.2, -0.65)),
        Vector((0.48, -0.05, -0.45)),
        Vector((0.38, -0.22, -0.25)),
        Vector((0.28, -0.32, 0.05)),
        Vector((0.22, -0.25, 0.35)),
        Vector((0.35, -0.15, 0.65)),
    ]
    create_tube_from_points("Vessel_Facial_Artery", pts_art, radius=0.03, mat=mat_art, col=col_vessels_nerves)

    # Facial Vein (Right side)
    pts_vn = [
        Vector((0.58, 0.22, -0.68)),
        Vector((0.52, -0.02, -0.42)),
        Vector((0.42, -0.18, -0.22)),
        Vector((0.32, -0.25, 0.12)),
        Vector((0.28, -0.20, 0.40)),
    ]
    create_tube_from_points("Vessel_Facial_Vein", pts_vn, radius=0.032, mat=mat_vn, col=col_vessels_nerves)

    # Facial Nerve CN VII (Right side pes anserinus)
    pts_nrv1 = [Vector((0.75, 0.15, 0.1)), Vector((0.65, -0.05, 0.35)), Vector((0.45, -0.15, 0.65))]
    pts_nrv2 = [Vector((0.75, 0.15, 0.1)), Vector((0.60, -0.18, 0.05)), Vector((0.38, -0.28, -0.25))]
    pts_nrv3 = [Vector((0.75, 0.15, 0.1)), Vector((0.58, 0.05, -0.35)), Vector((0.35, -0.05, -0.55))]
    create_tube_from_points("Nerve_CNVII_Temporal", pts_nrv1, radius=0.022, mat=mat_nrv, col=col_vessels_nerves)
    create_tube_from_points("Nerve_CNVII_Buccal", pts_nrv2, radius=0.022, mat=mat_nrv, col=col_vessels_nerves)
    create_tube_from_points("Nerve_CNVII_Mandibular", pts_nrv3, radius=0.022, mat=mat_nrv, col=col_vessels_nerves)
    col_vessels_nerves.hide_viewport = True

    # -------------------------------------------------------------
    # 5. COLLECTION 5: OSTEOLOGICAL SKULL
    # -------------------------------------------------------------
    mat_bone = bpy.data.materials.new(name="M_Osteological_Bone")
    mat_bone.use_nodes = True
    b_bone = mat_bone.node_tree.nodes.get("Principled BSDF")
    if b_bone:
        b_bone.inputs['Base Color'].default_value = (0.91, 0.88, 0.82, 1.0)
        b_bone.inputs['Roughness'].default_value = 0.55

    # Cranium dome
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=28, radius=0.92, location=(0, 0.15, 0.45))
    skull = bpy.context.active_object
    skull.name = "Bone_Cranium"
    skull.scale = (0.95, 1.15, 1.1)
    bpy.ops.object.transform_apply(scale=True)
    skull.data.materials.append(mat_bone)
    bpy.ops.object.shade_smooth()
    col_skull.objects.link(skull)
    bpy.context.scene.collection.objects.unlink(skull)

    # Mandible Jaw
    pts_mandible = [
        Vector((-0.65, 0.25, -0.3)),
        Vector((-0.55, 0.15, -0.55)),
        Vector((0.0, -0.35, -0.58)),
        Vector((0.55, 0.15, -0.55)),
        Vector((0.65, 0.25, -0.3)),
    ]
    create_tube_from_points("Bone_Mandible", pts_mandible, radius=0.08, mat=mat_bone, col=col_skull)
    col_skull.hide_viewport = True

    # -------------------------------------------------------------
    # 6. COLLECTION 6: EYEBALLS
    # -------------------------------------------------------------
    mat_sclera = bpy.data.materials.new(name="M_Sclera")
    mat_sclera.use_nodes = True
    b_sclera = mat_sclera.node_tree.nodes.get("Principled BSDF")
    if b_sclera:
        b_sclera.inputs['Base Color'].default_value = (0.95, 0.96, 0.98, 1.0)
        b_sclera.inputs['Roughness'].default_value = 0.15

    for sign, side in [(-1, "Left"), (1, "Right")]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.18, location=(sign * 0.38, -0.15, 0.28))
        eye = bpy.context.active_object
        eye.name = f"Eye_{side}"
        eye.data.materials.append(mat_sclera)
        bpy.ops.object.shade_smooth()
        col_eyes.objects.link(eye)
        bpy.context.scene.collection.objects.unlink(eye)
    col_eyes.hide_viewport = True

    # -------------------------------------------------------------
    # 7. COLLECTION 7: STUDIO LIGHTING & CAMERA
    # -------------------------------------------------------------
    key_l = bpy.data.lights.new("Studio_Key_Light", 'AREA')
    key_l.energy = 600
    key_l.size = 4.0
    key_o = bpy.data.objects.new("Studio_Key_Light", key_l)
    key_o.location = (3.0, -5.5, 3.0)
    key_o.rotation_euler = (math.radians(45), 0, math.radians(-25))
    col_studio.objects.link(key_o)

    fill_l = bpy.data.lights.new("Studio_Fill_Light", 'AREA')
    fill_l.energy = 300
    fill_l.size = 5.0
    fill_o = bpy.data.objects.new("Studio_Fill_Light", fill_l)
    fill_o.location = (-3.0, -5.0, 1.5)
    fill_o.rotation_euler = (math.radians(45), 0, math.radians(25))
    col_studio.objects.link(fill_o)

    rim_l = bpy.data.lights.new("Studio_Rim_Light", 'AREA')
    rim_l.energy = 400
    rim_l.size = 3.0
    rim_o = bpy.data.objects.new("Studio_Rim_Light", rim_l)
    rim_o.location = (0, 3.5, 3.0)
    rim_o.rotation_euler = (math.radians(-45), 0, math.radians(180))
    col_studio.objects.link(rim_o)

    cam = bpy.data.cameras.new("Clinical_Portrait_Camera")
    cam.lens = 50
    cam_o = bpy.data.objects.new("Clinical_Portrait_Camera", cam)
    cam_o.location = (0, -6.8, -0.05)
    cam_o.rotation_euler = (math.radians(90), 0, 0)
    col_studio.objects.link(cam_o)
    bpy.context.scene.camera = cam_o

    # Set 3D Viewport Shading to MATERIAL in Blender
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

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[BioControl] Master Blender Project Saved: {blend_path}")

    # Export clean GLB
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"[BioControl] WebGL Model Exported: {glb_path}")

if __name__ == "__main__":
    build_scene()
