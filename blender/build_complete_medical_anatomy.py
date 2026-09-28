"""
BioControl Medical AI - Complete Multi-Layer Anatomical 3D Head Builder for Blender 5.2
Creates 6 organized anatomical layers:
  1. Layer_Skin (Realistic Human Skin PBR with SSS and Normal Maps)
  2. Layer_Muscles (Striated Facial Muscular System with anatomical muscle groups)
  3. Layer_Skull (Osteological Facial Skeleton: Cranium, Orbits, Zygoma, Maxilla, Mandible, Teeth)
  4. Layer_Vessels (Facial Arteries & Veins 3D branching vascular networks)
  5. Layer_Nerves (Facial Nerve CN VII & Trigeminal CN V branching network)
  6. Layer_Eyes (Detailed Left & Right Anatomical Eyeballs)
Organized into collections, packed into .blend, and exported to .glb for WebGL viewer.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Euler, Matrix
import os

def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if not bpy.data.scenes:
        bpy.data.scenes.new("Scene")

def create_collection(name, parent=None):
    col = bpy.data.collections.new(name)
    if parent:
        parent.children.link(col)
    else:
        bpy.context.scene.collection.children.link(col)
    return col

def link_to_col(obj, col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    col.objects.link(obj)

def create_pbr_material(name, base_color=(0.8, 0.8, 0.8, 1.0), roughness=0.4, metallic=0.0, sss_weight=0.0, sss_radius=(1.0, 0.4, 0.2), emissive=(0, 0, 0, 1.0), emissive_intensity=0.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new(type="ShaderNodeOutputMaterial")
    out.location = (400, 0)

    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = base_color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic

    if 'Subsurface Weight' in bsdf.inputs and sss_weight > 0:
        bsdf.inputs['Subsurface Weight'].default_value = sss_weight
        if 'Subsurface Radius' in bsdf.inputs:
            bsdf.inputs['Subsurface Radius'].default_value = sss_radius
        if 'Subsurface Scale' in bsdf.inputs:
            bsdf.inputs['Subsurface Scale'].default_value = 0.05
    elif 'Subsurface' in bsdf.inputs and sss_weight > 0:
        bsdf.inputs['Subsurface'].default_value = sss_weight

    if emissive_intensity > 0:
        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emissive
            bsdf.inputs['Emission Strength'].default_value = emissive_intensity
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emissive

    links.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
    return mat

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

    # Convert to mesh so glTF exporter and Three.js read it seamlessly
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return obj

def build_anatomy():
    print("[BioControl] Initializing complete 6-layer medical anatomy generation...")
    reset_scene()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    models_dir = os.path.join(project_root, "client", "public", "models")
    blend_path = os.path.join(base_dir, "biocontrol_face_anatomy.blend")
    glb_path = os.path.join(models_dir, "face_anatomy.glb")
    head_src_glb = os.path.join(models_dir, "LeePerrySmith.glb")
    skin_tex_path = os.path.join(models_dir, "Map-COL.jpg")
    normal_tex_path = os.path.join(models_dir, "Infinite-Level_02_Tangent_SmoothUV.jpg")
    muscle_tex_path = os.path.join(base_dir, "user_anatomy_reference.jpg")

    # Collections
    col_skin = create_collection("01_Skin_Layer")
    col_muscles = create_collection("02_Muscles_Layer")
    col_skull = create_collection("03_Skull_Bones_Layer")
    col_vessels = create_collection("04_Blood_Vessels_Layer")
    col_nerves = create_collection("05_Nerves_Layer")
    col_eyes = create_collection("06_Eyes_Layer")
    col_studio = create_collection("07_Studio_Lighting")

    # -------------------------------------------------------------
    # 1. LAYER 1: OUTER FACIAL SKIN
    # -------------------------------------------------------------
    print("[1/6] Building Layer 1: Outer Skin...")
    bpy.ops.import_scene.gltf(filepath=head_src_glb)
    skin_obj = None
    for o in bpy.context.selected_objects:
        if o.type == 'MESH':
            skin_obj = o
            break

    if not skin_obj:
        print("Error: Could not load LeePerrySmith mesh")
        return

    skin_obj.name = "Layer_Skin"
    link_to_col(skin_obj, col_skin)

    mat_skin = bpy.data.materials.new(name="M_Layer_Skin")
    mat_skin.use_nodes = True
    nodes = mat_skin.node_tree.nodes
    links = mat_skin.node_tree.links
    nodes.clear()

    out_node = nodes.new("ShaderNodeOutputMaterial")
    out_node.location = (500, 0)
    bsdf_skin = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf_skin.location = (100, 0)
    bsdf_skin.inputs['Roughness'].default_value = 0.45
    if 'Subsurface Weight' in bsdf_skin.inputs:
        bsdf_skin.inputs['Subsurface Weight'].default_value = 0.18
        bsdf_skin.inputs['Subsurface Radius'].default_value = (1.0, 0.4, 0.2)
        bsdf_skin.inputs['Subsurface Scale'].default_value = 0.05
    links.new(bsdf_skin.outputs['BSDF'], out_node.inputs['Surface'])

    if os.path.exists(skin_tex_path):
        tex_skin = nodes.new("ShaderNodeTexImage")
        tex_skin.location = (-350, 150)
        tex_skin.image = bpy.data.images.load(skin_tex_path)
        links.new(tex_skin.outputs['Color'], bsdf_skin.inputs['Base Color'])

    if os.path.exists(normal_tex_path):
        tex_norm = nodes.new("ShaderNodeTexImage")
        tex_norm.location = (-350, -180)
        img_norm = bpy.data.images.load(normal_tex_path)
        img_norm.colorspace_settings.name = 'Non-Color'
        tex_norm.image = img_norm
        normal_map_node = nodes.new("ShaderNodeNormalMap")
        normal_map_node.location = (-100, -180)
        normal_map_node.inputs['Strength'].default_value = 1.0
        links.new(tex_norm.outputs['Color'], normal_map_node.inputs['Color'])
        links.new(normal_map_node.outputs['Normal'], bsdf_skin.inputs['Normal'])

    skin_obj.data.materials.clear()
    skin_obj.data.materials.append(mat_skin)

    # -------------------------------------------------------------
    # 2. LAYER 2: FACIAL MUSCLES
    # -------------------------------------------------------------
    print("[2/6] Building Layer 2: Facial Muscles...")
    muscle_mesh = skin_obj.data.copy()
    muscle_obj = bpy.data.objects.new("Layer_Facial_Muscles", muscle_mesh)
    col_muscles.objects.link(muscle_obj)

    # Shrink muscle layer slightly inward (scale 0.985 from center) so it sits directly under skin
    bm_m = bmesh.new()
    bm_m.from_mesh(muscle_mesh)
    center = Vector((0, 0, 0.5))
    for v in bm_m.verts:
        v.co = center + (v.co - center) * 0.982
    bm_m.to_mesh(muscle_mesh)
    bm_m.free()
    muscle_mesh.update()

    mat_muscle = bpy.data.materials.new(name="M_Layer_Muscles")
    mat_muscle.use_nodes = True
    mnodes = mat_muscle.node_tree.nodes
    mlinks = mat_muscle.node_tree.links
    mnodes.clear()

    m_out = mnodes.new("ShaderNodeOutputMaterial")
    m_out.location = (500, 0)
    m_bsdf = mnodes.new("ShaderNodeBsdfPrincipled")
    m_bsdf.location = (100, 0)
    m_bsdf.inputs['Base Color'].default_value = (0.75, 0.16, 0.13, 1.0)
    m_bsdf.inputs['Roughness'].default_value = 0.38
    mlinks.new(m_bsdf.outputs['BSDF'], m_out.inputs['Surface'])

    if os.path.exists(muscle_tex_path):
        m_tex = mnodes.new("ShaderNodeTexImage")
        m_tex.location = (-350, 150)
        m_tex.image = bpy.data.images.load(muscle_tex_path)
        mlinks.new(m_tex.outputs['Color'], m_bsdf.inputs['Base Color'])

        m_bump = mnodes.new("ShaderNodeBump")
        m_bump.location = (-100, -150)
        m_bump.inputs['Strength'].default_value = 0.45
        m_bump.inputs['Distance'].default_value = 0.08
        mlinks.new(m_tex.outputs['Color'], m_bump.inputs['Height'])
        mlinks.new(m_bump.outputs['Normal'], m_bsdf.inputs['Normal'])

    muscle_obj.data.materials.clear()
    muscle_obj.data.materials.append(mat_muscle)

    # Key Expressive Muscle Bands
    mat_red_fiber = create_pbr_material("M_Muscle_Fiber", base_color=(0.78, 0.14, 0.12, 1.0), roughness=0.35)

    # 2.1 Frontalis
    bpy.ops.mesh.primitive_cylinder_add(radius=1.35, depth=0.12, vertices=32, location=(0, -1.45, 2.3))
    frontalis = bpy.context.active_object
    frontalis.name = "m_Frontalis"
    frontalis.scale = (1.1, 0.5, 0.7)
    frontalis.rotation_euler = (math.radians(20), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    frontalis.data.materials.append(mat_red_fiber)
    link_to_col(frontalis, col_muscles)

    # 2.2 Orbicularis Oculi (Left & Right)
    for sign, eye_name in [(-1, "Left"), (1, "Right")]:
        bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.08, major_segments=24, minor_segments=12, location=(sign * 0.88, -1.48, 0.95))
        orb_oculi = bpy.context.active_object
        orb_oculi.name = f"m_Orbicularis_Oculi_{eye_name}"
        orb_oculi.rotation_euler = (math.radians(75), 0, math.radians(sign * 15))
        bpy.ops.object.transform_apply(rotation=True)
        orb_oculi.data.materials.append(mat_red_fiber)
        link_to_col(orb_oculi, col_muscles)

    # 2.3 Zygomaticus Major (Left & Right)
    for sign, z_name in [(-1, "Left"), (1, "Right")]:
        pts = [
            Vector((sign * 1.45, -1.15, 0.5)),
            Vector((sign * 1.15, -1.65, 0.15)),
            Vector((sign * 0.55, -2.15, -0.2))
        ]
        create_tube_from_points(f"m_Zygomaticus_Major_{z_name}", pts, radius=0.075, mat=mat_red_fiber, col=col_muscles)

    # 2.4 Masseter (Left & Right)
    for sign, m_name in [(-1, "Left"), (1, "Right")]:
        pts = [
            Vector((sign * 1.6, -0.6, 0.3)),
            Vector((sign * 1.65, -0.2, -0.2)),
            Vector((sign * 1.55, 0.15, -0.7))
        ]
        create_tube_from_points(f"m_Masseter_{m_name}", pts, radius=0.12, mat=mat_red_fiber, col=col_muscles)

    # 2.5 Orbicularis Oris
    bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.09, major_segments=24, minor_segments=12, location=(-0.1, -2.18, -0.2))
    orb_oris = bpy.context.active_object
    orb_oris.name = "m_Orbicularis_Oris"
    orb_oris.scale = (1.1, 0.6, 0.8)
    orb_oris.rotation_euler = (math.radians(82), 0, 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    orb_oris.data.materials.append(mat_red_fiber)
    link_to_col(orb_oris, col_muscles)

    # -------------------------------------------------------------
    # 3. LAYER 3: SKULL & FACIAL BONES
    # -------------------------------------------------------------
    print("[3/6] Building Layer 3: Skull & Facial Bones...")
    mat_bone = create_pbr_material("M_Layer_Bone", base_color=(0.91, 0.88, 0.81, 1.0), roughness=0.55, sss_weight=0.12)
    mat_teeth = create_pbr_material("M_Teeth_Enamel", base_color=(0.95, 0.94, 0.88, 1.0), roughness=0.25)

    # 3.1 Neurocranium Vault
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=1.75, location=(0, 0.35, 1.85))
    cranium = bpy.context.active_object
    cranium.name = "Bone_Neurocranium"
    cranium.scale = (1.05, 1.22, 1.15)
    bpy.ops.object.transform_apply(scale=True)
    cranium.data.materials.append(mat_bone)
    link_to_col(cranium, col_skull)

    # 3.2 Maxilla and Nasal Aperture
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -1.35, 0.5))
    maxilla = bpy.context.active_object
    maxilla.name = "Bone_Maxilla"
    maxilla.scale = (1.2, 0.9, 0.85)
    bpy.ops.object.transform_apply(scale=True)
    maxilla.data.materials.append(mat_bone)
    link_to_col(maxilla, col_skull)

    # 3.3 Zygomatic Arches
    for sign, z_name in [(-1, "Left"), (1, "Right")]:
        pts = [
            Vector((sign * 1.75, 0.2, 0.45)),
            Vector((sign * 1.65, -0.6, 0.48)),
            Vector((sign * 1.35, -1.2, 0.45))
        ]
        create_tube_from_points(f"Bone_Zygomatic_Arch_{z_name}", pts, radius=0.11, mat=mat_bone, col=col_skull)

    # 3.4 Mandible
    pts_mandible = [
        Vector((-1.55, 0.15, 0.2)),
        Vector((-1.6, 0.1, -0.65)),
        Vector((-1.1, -0.8, -0.68)),
        Vector((-0.1, -1.68, -0.62)),
        Vector((0.9, -0.8, -0.68)),
        Vector((1.4, 0.1, -0.65)),
        Vector((1.35, 0.15, 0.2))
    ]
    create_tube_from_points("Bone_Mandible", pts_mandible, radius=0.14, mat=mat_bone, col=col_skull)

    # 3.5 Teeth (Upper and Lower Dental Arch)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.06, major_segments=20, minor_segments=10, location=(-0.1, -1.92, -0.15))
    upper_teeth = bpy.context.active_object
    upper_teeth.name = "Bone_Teeth_Upper"
    upper_teeth.scale = (1.0, 0.7, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    upper_teeth.data.materials.append(mat_teeth)
    link_to_col(upper_teeth, col_skull)

    bpy.ops.mesh.primitive_torus_add(major_radius=0.45, minor_radius=0.06, major_segments=20, minor_segments=10, location=(-0.1, -1.86, -0.32))
    lower_teeth = bpy.context.active_object
    lower_teeth.name = "Bone_Teeth_Lower"
    lower_teeth.scale = (0.95, 0.68, 0.7)
    bpy.ops.object.transform_apply(scale=True)
    lower_teeth.data.materials.append(mat_teeth)
    link_to_col(lower_teeth, col_skull)

    # -------------------------------------------------------------
    # 4. LAYER 4: BLOOD VESSELS (ARTERIES & VEINS)
    # -------------------------------------------------------------
    print("[4/6] Building Layer 4: Blood Vessels...")
    mat_artery = create_pbr_material("M_Artery_Red", base_color=(0.88, 0.12, 0.12, 1.0), roughness=0.25, emissive=(0.9, 0.1, 0.1, 1.0), emissive_intensity=0.15)
    mat_vein = create_pbr_material("M_Vein_Blue", base_color=(0.12, 0.42, 0.88, 1.0), roughness=0.25, emissive=(0.1, 0.4, 0.9, 1.0), emissive_intensity=0.15)

    for sign, side in [(-1, "Left"), (1, "Right")]:
        # Facial Artery (A. Facialis)
        pts_art = [
            Vector((sign * 1.5, -0.1, -1.2)),
            Vector((sign * 1.35, -0.65, -0.6)),
            Vector((sign * 1.05, -1.35, -0.35)),
            Vector((sign * 0.75, -1.85, -0.15)),
            Vector((sign * 0.55, -2.15, 0.4)),
            Vector((sign * 0.45, -1.8, 0.95)),
            Vector((sign * 0.6, -1.5, 1.7)),
            Vector((sign * 0.95, -1.2, 2.3))
        ]
        create_tube_from_points(f"Vessel_Facial_Artery_{side}", pts_art, radius=0.035, mat=mat_artery, col=col_vessels)

        # Superior Labial Artery
        pts_lab = [
            Vector((sign * 0.75, -1.85, -0.15)),
            Vector((sign * 0.35, -2.1, -0.16)),
            Vector((-0.1, -2.2, -0.17))
        ]
        create_tube_from_points(f"Vessel_Superior_Labial_Artery_{side}", pts_lab, radius=0.024, mat=mat_artery, col=col_vessels)

        # Facial Vein (V. Facialis)
        pts_vein = [
            Vector((sign * 1.58, -0.05, -1.25)),
            Vector((sign * 1.45, -0.55, -0.65)),
            Vector((sign * 1.15, -1.2, -0.28)),
            Vector((sign * 0.68, -1.68, 0.45)),
            Vector((sign * 0.52, -1.72, 0.92)),
            Vector((sign * 0.45, -1.55, 1.55))
        ]
        create_tube_from_points(f"Vessel_Facial_Vein_{side}", pts_vein, radius=0.038, mat=mat_vein, col=col_vessels)

        # Superficial Temporal Artery & Vein
        pts_temp_art = [
            Vector((sign * 1.95, 0.1, 0.5)),
            Vector((sign * 1.85, -0.2, 1.2)),
            Vector((sign * 1.7, -0.5, 2.0)),
            Vector((sign * 1.3, -0.8, 2.6))
        ]
        create_tube_from_points(f"Vessel_Superficial_Temporal_Artery_{side}", pts_temp_art, radius=0.03, mat=mat_artery, col=col_vessels)

        pts_temp_vein = [
            Vector((sign * 1.98, 0.15, 0.5)),
            Vector((sign * 1.88, -0.15, 1.25)),
            Vector((sign * 1.75, -0.45, 2.05)),
            Vector((sign * 1.4, -0.75, 2.65))
        ]
        create_tube_from_points(f"Vessel_Superficial_Temporal_Vein_{side}", pts_temp_vein, radius=0.032, mat=mat_vein, col=col_vessels)

    # -------------------------------------------------------------
    # 5. LAYER 5: FACIAL NERVES (CRANIAL NERVES VII & V)
    # -------------------------------------------------------------
    print("[5/6] Building Layer 5: Facial Nerves...")
    mat_nerve = create_pbr_material("M_Nerve_Yellow", base_color=(1.0, 0.88, 0.15, 1.0), roughness=0.35, emissive=(1.0, 0.85, 0.1, 1.0), emissive_intensity=0.25)

    for sign, side in [(-1, "Left"), (1, "Right")]:
        trunk_origin = Vector((sign * 1.85, 0.12, 0.35))

        # Temporal branches
        pts_temp = [
            trunk_origin,
            Vector((sign * 1.72, -0.25, 0.95)),
            Vector((sign * 1.55, -0.7, 1.6)),
            Vector((sign * 1.15, -1.15, 2.2)),
            Vector((sign * 0.6, -1.35, 2.45))
        ]
        create_tube_from_points(f"Nerve_CNVII_Temporal_{side}", pts_temp, radius=0.026, mat=mat_nerve, col=col_nerves)

        # Zygomatic branches
        pts_zyg = [
            trunk_origin,
            Vector((sign * 1.65, -0.45, 0.6)),
            Vector((sign * 1.35, -1.05, 0.75)),
            Vector((sign * 0.95, -1.45, 0.85))
        ]
        create_tube_from_points(f"Nerve_CNVII_Zygomatic_{side}", pts_zyg, radius=0.024, mat=mat_nerve, col=col_nerves)

        # Buccal branches
        pts_buc = [
            trunk_origin,
            Vector((sign * 1.58, -0.55, 0.2)),
            Vector((sign * 1.25, -1.15, -0.05)),
            Vector((sign * 0.75, -1.75, -0.15))
        ]
        create_tube_from_points(f"Nerve_CNVII_Buccal_{side}", pts_buc, radius=0.024, mat=mat_nerve, col=col_nerves)

        # Marginal Mandibular branch
        pts_man = [
            trunk_origin,
            Vector((sign * 1.62, -0.25, -0.35)),
            Vector((sign * 1.45, -0.65, -0.62)),
            Vector((sign * 0.95, -1.25, -0.64)),
            Vector((sign * 0.35, -1.65, -0.62))
        ]
        create_tube_from_points(f"Nerve_CNVII_Mandibular_{side}", pts_man, radius=0.024, mat=mat_nerve, col=col_nerves)

        # Cervical branch
        pts_cer = [
            trunk_origin,
            Vector((sign * 1.65, 0.05, -0.5)),
            Vector((sign * 1.45, -0.15, -1.2)),
            Vector((sign * 1.25, -0.3, -1.8))
        ]
        create_tube_from_points(f"Nerve_CNVII_Cervical_{side}", pts_cer, radius=0.022, mat=mat_nerve, col=col_nerves)

    # -------------------------------------------------------------
    # 6. LAYER 6: ANATOMICAL EYEBALLS
    # -------------------------------------------------------------
    print("[6/6] Building Layer 6: Anatomical Eyeballs...")
    mat_sclera = create_pbr_material("M_Eye_Sclera", base_color=(0.95, 0.96, 0.98, 1.0), roughness=0.15)
    mat_iris = create_pbr_material("M_Eye_Iris", base_color=(0.18, 0.38, 0.32, 1.0), roughness=0.2)
    mat_pupil = create_pbr_material("M_Eye_Pupil", base_color=(0.01, 0.01, 0.01, 1.0), roughness=0.05)

    for sign, eye_name in [(-1, "Left"), (1, "Right")]:
        eye_center = Vector((sign * 0.88, -1.28, 0.95))

        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=20, radius=0.38, location=eye_center)
        eyeball = bpy.context.active_object
        eyeball.name = f"Eye_Sclera_{eye_name}"
        eyeball.data.materials.append(mat_sclera)
        link_to_col(eyeball, col_eyes)

        iris_pos = eye_center + Vector((0, -0.34, 0))
        bpy.ops.mesh.primitive_circle_add(radius=0.16, fill_type='NGON', location=iris_pos)
        iris = bpy.context.active_object
        iris.name = f"Eye_Iris_{eye_name}"
        iris.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        iris.data.materials.append(mat_iris)
        link_to_col(iris, col_eyes)

        pupil_pos = eye_center + Vector((0, -0.35, 0))
        bpy.ops.mesh.primitive_circle_add(radius=0.07, fill_type='NGON', location=pupil_pos)
        pupil = bpy.context.active_object
        pupil.name = f"Eye_Pupil_{eye_name}"
        pupil.rotation_euler = (math.radians(90), 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        pupil.data.materials.append(mat_pupil)
        link_to_col(pupil, col_eyes)

    # -------------------------------------------------------------
    # 7. STUDIO LIGHTING & CAMERA
    # -------------------------------------------------------------
    print("[Studio] Adding medical 3-point lighting and clinical camera...")
    key_light = bpy.data.lights.new("Key_Light_Medical", 'AREA')
    key_light.energy = 800
    key_light.size = 3.5
    key_light.color = (1.0, 0.98, 0.95)
    key_obj = bpy.data.objects.new("Key_Light_Medical", key_light)
    key_obj.location = (2.5, -4.5, 3.0)
    key_obj.rotation_euler = (math.radians(45), 0, math.radians(-25))
    col_studio.objects.link(key_obj)

    fill_light = bpy.data.lights.new("Fill_Light_Medical", 'AREA')
    fill_light.energy = 450
    fill_light.size = 4.5
    fill_light.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("Fill_Light_Medical", fill_light)
    fill_obj.location = (-3.2, -4.0, 1.5)
    fill_obj.rotation_euler = (math.radians(45), 0, math.radians(35))
    col_studio.objects.link(fill_obj)

    rim_light = bpy.data.lights.new("Rim_Light_Medical", 'AREA')
    rim_light.energy = 600
    rim_light.size = 3.0
    rim_light.color = (1.0, 1.0, 1.0)
    rim_obj = bpy.data.objects.new("Rim_Light_Medical", rim_light)
    rim_obj.location = (0, 3.5, 3.5)
    rim_obj.rotation_euler = (math.radians(-45), 0, math.radians(180))
    col_studio.objects.link(rim_obj)

    cam_data = bpy.data.cameras.new("Clinical_Frontal_Camera")
    cam_data.lens = 85
    cam_obj = bpy.data.objects.new("Clinical_Frontal_Camera", cam_data)
    cam_obj.location = (0, -6.8, 0.8)
    cam_obj.rotation_euler = (math.radians(90), 0, 0)
    col_studio.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                for space in area.spaces:
                    if space.type == 'VIEW_3D':
                        space.shading.type = 'MATERIAL'

    try:
        bpy.ops.file.pack_all()
    except Exception as e:
        print(f"Pack notice: {e}")

    bpy.ops.wm.save_as_mainfile(filepath=blend_path)
    print(f"[BioControl] Complete 6-Layer Medical Anatomy Blend File Saved: {blend_path}")

    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        use_selection=False,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False
    )
    print(f"[BioControl] GLB Anatomical Model Exported: {glb_path}")
    print("[BioControl] Done successfully!")

if __name__ == "__main__":
    build_anatomy()
