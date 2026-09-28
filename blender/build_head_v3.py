"""
BioControl - Realistic Human Head v3
Blender 5.2 - Proper facial features sculpted into base mesh
"""

import bpy, bmesh, math, os
from mathutils import Vector, Euler

def reset():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for c in list(bpy.data.collections): bpy.data.collections.remove(c)
    for m in list(bpy.data.materials):   bpy.data.materials.remove(m)
    for m in list(bpy.data.meshes):      bpy.data.meshes.remove(m)
    for c in list(bpy.data.curves):      bpy.data.curves.remove(c)
    for t in list(bpy.data.textures):    bpy.data.textures.remove(t)

reset()
scene = bpy.context.scene

def mkcol(name, parent=None):
    c = bpy.data.collections.new(name)
    (parent if parent else scene.collection).children.link(c)
    return c

ROOT     = mkcol("ANATOMICAL_HEAD")
COL_SKIN = mkcol("ANATOMY_SKIN",          ROOT)
COL_SUBC = mkcol("ANATOMY_SUBCUTANEOUS",  ROOT)
COL_MUSC = mkcol("ANATOMY_MUSCLES",       ROOT)
COL_VESS = mkcol("ANATOMY_VESSELS",       ROOT)
COL_NERV = mkcol("ANATOMY_NERVES",        ROOT)
COL_BONE = mkcol("ANATOMY_BONES",         ROOT)
COL_EYES = mkcol("ANATOMY_EYES",          ROOT)
COL_NOSE = mkcol("ANATOMY_NOSE",          ROOT)
COL_MOUT = mkcol("ANATOMY_MOUTH",         ROOT)
COL_CAMS = mkcol("CAMERAS",               ROOT)
COL_LGHT = mkcol("LIGHTING",              ROOT)
COL_ENV  = mkcol("ENVIRONMENT",           ROOT)
COL_REGS = mkcol("ANATOMY_REGIONS",       ROOT)

R = math.radians

def link(obj, col):
    col.objects.link(obj)
    if obj.name in scene.collection.objects:
        scene.collection.objects.unlink(obj)

def setmat(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)

def subsurf(obj, v=2, r=3):
    m = obj.modifiers.new("Subd", 'SUBSURF')
    m.levels = v; m.render_levels = r

def pbr(name, col, rough=0.6, spec=0.3, sss=0.0, sssr=(1,.3,.1), trans=0.0, ior=1.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    bs  = nt.nodes.new('ShaderNodeBsdfPrincipled')
    out.location=(400,0); bs.location=(0,0)
    bs.inputs['Base Color'].default_value = (*col[:3], 1)
    bs.inputs['Roughness'].default_value = rough
    bs.inputs['Specular IOR Level'].default_value = spec
    if sss > 0:
        bs.inputs['Subsurface Weight'].default_value = sss
        bs.inputs['Subsurface Radius'].default_value = sssr
        bs.inputs['Subsurface Scale'].default_value = 0.015
    if trans > 0:
        bs.inputs['Transmission Weight'].default_value = trans
        bs.inputs['IOR'].default_value = ior
    nt.links.new(bs.outputs['BSDF'], out.inputs['Surface'])
    return mat

# ── MATERIALS ──────────────────────────────────────────────────
M_SKIN = pbr("MAT_SKIN", (.78,.52,.40), rough=.62, spec=.28,
    sss=.35, sssr=(1.10,.45,.22))
M_BONE = pbr("MAT_BONE", (.92,.88,.78), rough=.70, spec=.18)
M_ART  = pbr("MAT_ARTERY",  (.72,.16,.16), rough=.35, spec=.30)
M_VEIN = pbr("MAT_VEIN",    (.28,.28,.62), rough=.38, spec=.25)
M_NERV = pbr("MAT_NERVE",   (.88,.82,.55), rough=.55, spec=.20)
M_SCLE = pbr("MAT_SCLERA",  (.96,.95,.93), rough=.15, spec=.90)
M_IRIS = pbr("MAT_IRIS",    (.22,.38,.52), rough=.40, spec=.50)
M_PUPIL= pbr("MAT_PUPIL",   (.02,.02,.02), rough=.05, spec=1.0)
M_CORN = pbr("MAT_CORNEA",  (.98,.98,.98), rough=.00, spec=1.0, trans=.95, ior=1.376)
M_CART = pbr("MAT_CARTILAGE",(.82,.86,.88), rough=.40, sss=.10)
M_TOOT = pbr("MAT_TOOTH",   (.95,.94,.90), rough=.18, spec=.85)
M_TONG = pbr("MAT_TONGUE",  (.82,.35,.35), rough=.65, sss=.25)
M_BACK = pbr("MAT_BACKDROP",(.90,.90,.92), rough=1.0, spec=.0)
M_LIP  = pbr("MAT_LIP",     (.72,.38,.35), rough=.45, sss=.2, sssr=(.8,.3,.2))

def mmat(name,r,g,b):
    return pbr(name,(r,g,b), rough=.72, spec=.12, sss=.18, sssr=(.8,.25,.15))

MM = {
    "FRONTALIS":         mmat("MAT_M_FRONT", .64,.20,.18),
    "ORBICULARIS_OCULI": mmat("MAT_M_OO",    .60,.18,.22),
    "CORRUGATOR":        mmat("MAT_M_CORR",  .58,.19,.20),
    "MASSETER":          mmat("MAT_M_MASS",  .68,.20,.16),
    "TEMPORALIS":        mmat("MAT_M_TEMP",  .66,.19,.17),
    "ZYGOMATICUS_MAJOR": mmat("MAT_M_ZYMAJ", .64,.21,.17),
    "ORBICULARIS_ORIS":  mmat("MAT_M_OOR",   .59,.18,.22),
    "BUCCINATOR":        mmat("MAT_M_BUCC",  .62,.19,.20),
    "MENTALIS":          mmat("MAT_M_MENT",  .63,.22,.18),
    "NASALIS":           mmat("MAT_M_NASA",  .63,.20,.19),
    "DEPRESSOR_ANGULI":  mmat("MAT_M_DANG",  .61,.21,.19),
    "PLATYSMA":          mmat("MAT_M_PLAT",  .57,.21,.22),
}

# ═══════════════════════════════════════════════════════════════
# BUILD REALISTIC HEAD via vertex sculpting
# ═══════════════════════════════════════════════════════════════

def build_realistic_head():
    """
    Build a human head mesh with actual facial features:
    - proper skull shape (not a sphere)
    - nose protrusion
    - eye sockets (recessed)
    - lip area definition
    - brow ridges
    - chin shape
    - jaw definition
    - neck
    """
    bm = bmesh.new()

    # Start with a UV sphere — high resolution
    bmesh.ops.create_uvsphere(bm, u_segments=80, v_segments=60, radius=1.0)

    # ── COORDINATE HELPERS ──────────────────────────────────────
    # z = vertical (up), y = front-back (front=+), x = left-right
    # Blender sphere: z=1 top, z=-1 bottom, front faces +Y

    for v in bm.verts:
        x = v.co.x
        y = v.co.y
        z = v.co.z

        # ── STEP 1: Basic head proportions ──────────────────────
        # Make it taller (head height > width)
        z_new = z * 1.32

        # Narrow slightly at temples, widen slightly at cheeks
        # Human skull: widest at temples ~60% up
        cheek_z = 0.05  # cheek level
        temple_z = 0.5  # temple level
        skull_top_z = 0.8

        x_new = x
        y_new = y

        # ── STEP 2: Flatten back of head ────────────────────────
        if y < 0:
            y_new = y * 0.82

        # ── STEP 3: Forehead flattening ─────────────────────────
        if z > 0.6 and y > 0:
            # Flatten forehead (humans have flat forehead)
            y_new = y_new * (1.0 - (z - 0.6) * 0.35)
            # Also slightly narrow at very top
            if z > 0.85:
                x_new = x * (1.0 - (z - 0.85) * 0.5)

        # ── STEP 4: Brow ridge (supraorbital ridge) ─────────────
        # Brow ridge is at z≈0.25, y>0, |x|<0.5
        brow_z = 0.25
        if abs(z - brow_z) < 0.08 and y > 0.5 and abs(x) < 0.55:
            brow_strength = (1.0 - abs(z - brow_z) / 0.08)
            brow_strength *= max(0, (y - 0.5) / 0.5)
            # Central brow is more prominent
            brow_x_profile = 1.0 - abs(x) * 1.5
            if brow_x_profile > 0:
                y_new += brow_strength * brow_x_profile * 0.08

        # ── STEP 5: Eye sockets (recessed) ──────────────────────
        # Left eye: x≈+0.32, z≈0.17; Right eye: x≈-0.32, z≈0.17
        for eye_x in [0.32, -0.32]:
            eye_z = 0.17
            eye_dist = ((x - eye_x)**2 * 2.5 + (z - eye_z)**2 * 2.5) ** 0.5
            if eye_dist < 0.22 and y > 0.3:
                socket_depth = max(0, 1.0 - eye_dist / 0.22) ** 1.5
                socket_depth *= max(0, (y - 0.3) / 0.7)
                y_new -= socket_depth * 0.1  # recess eyes

        # ── STEP 6: Nose bridge & nose projection ───────────────
        nose_x_width = 0.14
        nose_bridge_z_start = 0.12  # top of nose (bridge)
        nose_tip_z = -0.12          # bottom of nose (tip)

        if abs(x) < nose_x_width and y > 0.6:
            nose_z_progress = 1.0 - (z - nose_tip_z) / (nose_bridge_z_start - nose_tip_z + 0.001)
            nose_z_progress = max(0, min(1, nose_z_progress))

            if nose_bridge_z_start >= z >= nose_tip_z:
                # Nose protrudes forward
                y_factor = max(0, (y - 0.6) / 0.4)
                x_factor = max(0, 1.0 - abs(x) / nose_x_width)
                nose_push = nose_z_progress * y_factor * x_factor * 0.32
                y_new += nose_push

                # Nose gets wider at the tip (alar expansion)
                if z < -0.02:
                    alar_z = max(0, (-0.02 - z) / 0.10)
                    x_new = x + (0.10 + alar_z * 0.08) * (1 if x > 0 else -1) * y_factor * x_factor

        # ── STEP 7: Cheekbones (malar eminence) ─────────────────
        for ck_x in [0.55, -0.55]:
            ck_z = 0.02
            ck_dist = ((x - ck_x)**2 * 1.5 + (z - ck_z)**2 * 3.0) ** 0.5
            if ck_dist < 0.25 and y > 0.1:
                ck_strength = max(0, 1.0 - ck_dist / 0.25) ** 1.8
                y_new += ck_strength * 0.07

        # ── STEP 8: Philtrum & lip area ─────────────────────────
        # Upper lip protrusion at z≈-0.35 to -0.45, |x|<0.2
        lip_z_upper = -0.35
        lip_z_lower = -0.48
        if lip_z_upper >= z >= lip_z_lower and abs(x) < 0.25 and y > 0.5:
            lip_z_progress = (z - lip_z_lower) / (lip_z_upper - lip_z_lower)
            lip_x_factor = max(0, 1.0 - abs(x) / 0.25)
            lip_y_factor = max(0, (y - 0.5) / 0.5)
            # Upper lip slightly fuller in center
            lip_push = lip_z_progress * lip_x_factor * lip_y_factor * 0.08
            y_new += lip_push

        # Lower lip (slightly more protrusion)
        low_lip_z = -0.50
        if abs(z - low_lip_z) < 0.08 and abs(x) < 0.22 and y > 0.5:
            ll_dist = abs(z - low_lip_z) / 0.08
            ll_x = max(0, 1.0 - abs(x) / 0.22)
            ll_y = max(0, (y - 0.5) / 0.5)
            y_new += (1.0 - ll_dist) * ll_x * ll_y * 0.09

        # Lip corners (labial commissures)
        for lc_x in [0.18, -0.18]:
            lc_z = -0.42
            lc_dist = ((x - lc_x)**2 * 4 + (z - lc_z)**2 * 4) ** 0.5
            if lc_dist < 0.12 and y > 0.6:
                lc_str = max(0, 1.0 - lc_dist / 0.12)
                y_new += lc_str * 0.04

        # ── STEP 9: Chin definition ──────────────────────────────
        chin_z = -0.68
        if z < -0.55 and y > 0.3:
            # Chin narrows to a point
            chin_progress = max(0, (-0.55 - z) / 0.5)
            # Chin protrudes forward
            if abs(x) < 0.35:
                chin_x_factor = max(0, 1.0 - abs(x) / 0.35)
                chin_y_factor = max(0, (y - 0.3) / 0.7)
                y_new += chin_x_factor * chin_y_factor * chin_progress * 0.06

        # ── STEP 10: Jaw angle / mandible ───────────────────────
        # Jaw widens at the sides at z≈-0.5
        jaw_z = -0.5
        if abs(z - jaw_z) < 0.20 and abs(x) > 0.45:
            jaw_x_factor = max(0, (abs(x) - 0.45) / 0.35)
            jaw_z_factor = max(0, 1.0 - abs(z - jaw_z) / 0.20)
            # Jaw angle should be squared
            x_new = x * (1.0 + jaw_x_factor * jaw_z_factor * 0.15)

        # ── STEP 11: Neck taper ─────────────────────────────────
        if z < -0.75:
            neck_factor = max(0, (-0.75 - z) / 0.6)
            neck_taper = 1.0 - neck_factor * 0.42
            x_new = x_new * neck_taper
            y_new = y_new * neck_taper

        # ── STEP 12: Temple indentation ─────────────────────────
        for te_x in [0.82, -0.82]:
            te_z = 0.35
            te_dist = ((x - te_x)**2 * 1.2 + (z - te_z)**2 * 2.0) ** 0.5
            if te_dist < 0.20:
                te_str = max(0, 1.0 - te_dist / 0.20) ** 2
                # Temples are slightly indented
                x_new = x * (1.0 - te_str * 0.08)

        v.co.x = x_new
        v.co.y = y_new
        v.co.z = z_new

    # Smooth normals
    for f in bm.faces:
        f.smooth = True

    mesh = bpy.data.meshes.new("HEAD_SKIN_MESH")
    bm.to_mesh(mesh)
    bm.free()

    obj = bpy.data.objects.new("SKIN_HEAD", mesh)
    scene.collection.objects.link(obj)
    link(obj, COL_SKIN)
    setmat(obj, M_SKIN)

    # Apply subdivision for smoothing
    mod = obj.modifiers.new("Subd", 'SUBSURF')
    mod.levels = 1
    mod.render_levels = 2

    return obj

HEAD = build_realistic_head()

# ── NECK ────────────────────────────────────────────────────────

bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=16, radius=0.48)
for v in bm.verts:
    x,y,z = v.co.x, v.co.y, v.co.z
    # Elongate to neck shape
    v.co.z = z * 0.6 - 1.30
    # Neck is slightly oval (wider front-back)
    v.co.y = y * 1.15
    # Flatten back of neck
    if y < 0: v.co.y = y * 0.85
for f in bm.faces: f.smooth = True
mnk = bpy.data.meshes.new("NECK_MESH")
bm.to_mesh(mnk); bm.free()
nk = bpy.data.objects.new("SKIN_NECK", mnk)
scene.collection.objects.link(nk); link(nk, COL_SKIN); setmat(nk, M_SKIN)
subsurf(nk, 1)

# ── EARS ─────────────────────────────────────────────────────────
for sd, sx in [('R',1),('L',-1)]:
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=16, radius=0.16)
    for v in bm.verts:
        x,y,z = v.co.x, v.co.y, v.co.z
        # Flatten ear (thin oval disk)
        v.co.x = x * 0.35 + sx * 0.96
        v.co.y = y * 0.22 - 0.04
        v.co.z = z * 0.62 + 0.06
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(f"EAR_{sd}_MESH")
    bm.to_mesh(me); bm.free()
    ear = bpy.data.objects.new(f"SKIN_EAR_{sd}", me)
    scene.collection.objects.link(ear); link(ear, COL_SKIN); setmat(ear, M_SKIN)
    subsurf(ear, 1)

# ═══════════════════════════════════════════════════════════════
# EYES (proper eyeball + iris + pupil + cornea)
# ═══════════════════════════════════════════════════════════════

for sd, ex in [('R', 0.305), ('L', -0.305)]:
    ey = 0.82   # forward offset
    ez = 0.235  # vertical

    # Sclera (eyeball)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=24, radius=0.108)
    ms = bpy.data.meshes.new(f"EYE_SCLERA_{sd}_M"); bm.to_mesh(ms); bm.free()
    sc = bpy.data.objects.new(f"EYE_SCLERA_{sd}", ms)
    sc.location = (ex, ey, ez)
    scene.collection.objects.link(sc); link(sc, COL_EYES); setmat(sc, M_SCLE)

    # Iris (colored ring)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.058)
    for v in bm.verts:
        v.co.y *= 0.22  # flatten to disk
    mi = bpy.data.meshes.new(f"EYE_IRIS_{sd}_M"); bm.to_mesh(mi); bm.free()
    ir = bpy.data.objects.new(f"EYE_IRIS_{sd}", mi)
    ir.location = (ex, ey + 0.075, ez)
    scene.collection.objects.link(ir); link(ir, COL_EYES); setmat(ir, M_IRIS)

    # Pupil
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.028)
    for v in bm.verts:
        v.co.y *= 0.18
    mp = bpy.data.meshes.new(f"EYE_PUPIL_{sd}_M"); bm.to_mesh(mp); bm.free()
    pu = bpy.data.objects.new(f"EYE_PUPIL_{sd}", mp)
    pu.location = (ex, ey + 0.100, ez)
    scene.collection.objects.link(pu); link(pu, COL_EYES); setmat(pu, M_PUPIL)

    # Cornea (transparent dome)
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=16, radius=0.112)
    for v in bm.verts:
        v.co.y *= 0.48
    mc = bpy.data.meshes.new(f"EYE_CORNEA_{sd}_M"); bm.to_mesh(mc); bm.free()
    co = bpy.data.objects.new(f"EYE_CORNEA_{sd}", mc)
    co.location = (ex, ey + 0.012, ez)
    scene.collection.objects.link(co); link(co, COL_EYES); setmat(co, M_CORN)

# ═══════════════════════════════════════════════════════════════
# NOSE
# ═══════════════════════════════════════════════════════════════

# Nose tip
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=24, v_segments=18, radius=0.10)
for v in bm.verts:
    v.co.x *= 0.95
    v.co.y *= 0.72
    v.co.z *= 0.68
mn = bpy.data.meshes.new("NOSE_TIP_M"); bm.to_mesh(mn); bm.free()
nt_obj = bpy.data.objects.new("NOSE_TIP", mn)
nt_obj.location = (0, 1.08, -0.11)
scene.collection.objects.link(nt_obj); link(nt_obj, COL_NOSE); setmat(nt_obj, M_SKIN)

# Nostrils
for sd, nx in [('R',0.085),('L',-0.085)]:
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.040)
    for v in bm.verts:
        v.co.x *= 0.95; v.co.y *= 0.62; v.co.z *= 0.68
    mn2 = bpy.data.meshes.new(f"NOSTRIL_{sd}_M"); bm.to_mesh(mn2); bm.free()
    no = bpy.data.objects.new(f"NOSE_NOSTRIL_{sd}", mn2)
    no.location = (nx, 1.04, -0.222)
    scene.collection.objects.link(no); link(no, COL_NOSE); setmat(no, M_SKIN)

# Nasal cartilage
for sd, nx in [('R',0.078),('L',-0.078)]:
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.072)
    for v in bm.verts:
        v.co.x *= 0.70; v.co.y *= 0.48; v.co.z *= 1.35
    mc2 = bpy.data.meshes.new(f"CART_{sd}_M"); bm.to_mesh(mc2); bm.free()
    ca = bpy.data.objects.new(f"NOSE_CARTILAGE_{sd}", mc2)
    ca.location = (nx, 0.92, -0.055)
    scene.collection.objects.link(ca); link(ca, COL_NOSE); setmat(ca, M_CART)

# ═══════════════════════════════════════════════════════════════
# MOUTH / LIPS
# ═══════════════════════════════════════════════════════════════

# Upper lip
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=0.115)
for v in bm.verts:
    v.co.x *= 1.55; v.co.y *= 0.52; v.co.z *= 0.42
mul = bpy.data.meshes.new("UL_M"); bm.to_mesh(mul); bm.free()
ul = bpy.data.objects.new("MOUTH_UPPER_LIP", mul)
ul.location = (0, 0.98, -0.37)
scene.collection.objects.link(ul); link(ul, COL_MOUT); setmat(ul, M_LIP); subsurf(ul,1)

# Lower lip
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=0.115)
for v in bm.verts:
    v.co.x *= 1.65; v.co.y *= 0.58; v.co.z *= 0.40
mll = bpy.data.meshes.new("LL_M"); bm.to_mesh(mll); bm.free()
ll = bpy.data.objects.new("MOUTH_LOWER_LIP", mll)
ll.location = (0, 0.96, -0.475)
scene.collection.objects.link(ll); link(ll, COL_MOUT); setmat(ll, M_LIP); subsurf(ll,1)

# Teeth (upper)
for i, tx in enumerate([x*0.052 for x in range(-3,4)]):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=8, radius=0.024)
    for v in bm.verts:
        v.co.x *= 0.82; v.co.y *= 0.58; v.co.z *= 1.25
    mt = bpy.data.meshes.new(f"T{i}_M"); bm.to_mesh(mt); bm.free()
    t = bpy.data.objects.new(f"MOUTH_TOOTH_UPPER_{i+1:02d}", mt)
    t.location = (tx, 0.995, -0.425)
    scene.collection.objects.link(t); link(t, COL_MOUT); setmat(t, M_TOOT)

# Tongue
bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=20, v_segments=16, radius=0.092)
for v in bm.verts:
    v.co.x *= 1.45; v.co.y *= 1.72; v.co.z *= 0.60
mtg = bpy.data.meshes.new("TONG_M"); bm.to_mesh(mtg); bm.free()
tg = bpy.data.objects.new("MOUTH_TONGUE", mtg)
tg.location = (0, 0.86, -0.498)
scene.collection.objects.link(tg); link(tg, COL_MOUT); setmat(tg, M_TONG); subsurf(tg,1)

# ═══════════════════════════════════════════════════════════════
# MUSCLES (simplified, hidden by default)
# ═══════════════════════════════════════════════════════════════

def msph(name, loc, sx, sy, sz, mk="MASSETER"):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.1)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    me = bpy.data.meshes.new(f"M_{name}"); bm.to_mesh(me); bm.free()
    obj = bpy.data.objects.new(f"MUSCLE_{name}", me)
    obj.location = loc
    scene.collection.objects.link(obj); link(obj, COL_MUSC)
    setmat(obj, MM.get(mk, list(MM.values())[0]))
    obj.hide_viewport = True; obj.hide_render = True
    return obj

msph("FRONTALIS",         (0, 0.80, 0.80),  7.0, 2.2, 3.2, "FRONTALIS")
msph("ORBICULARIS_OCULI_R",( 0.32, 0.88, 0.24), 1.6, 0.4, 0.9, "ORBICULARIS_OCULI")
msph("ORBICULARIS_OCULI_L",(-0.32, 0.88, 0.24), 1.6, 0.4, 0.9, "ORBICULARIS_OCULI")
msph("MASSETER_R",        ( 0.64, 0.52,-0.42), 1.8, 1.0, 2.2, "MASSETER")
msph("MASSETER_L",        (-0.64, 0.52,-0.42), 1.8, 1.0, 2.2, "MASSETER")
msph("TEMPORALIS_R",      ( 0.75, 0.05, 0.65), 2.0, 1.8, 2.8, "TEMPORALIS")
msph("TEMPORALIS_L",      (-0.75, 0.05, 0.65), 2.0, 1.8, 2.8, "TEMPORALIS")
msph("ZYGOMATICUS_MAJOR_R",( 0.45, 0.78,-0.10), 2.5, 0.32, 0.52, "ZYGOMATICUS_MAJOR")
msph("ZYGOMATICUS_MAJOR_L",(-0.45, 0.78,-0.10), 2.5, 0.32, 0.52, "ZYGOMATICUS_MAJOR")
msph("ORBICULARIS_ORIS",  ( 0,    0.96,-0.42), 2.2, 0.45, 0.70, "ORBICULARIS_ORIS")
msph("BUCCINATOR_R",      ( 0.52, 0.78,-0.35), 2.2, 0.52, 0.95, "BUCCINATOR")
msph("BUCCINATOR_L",      (-0.52, 0.78,-0.35), 2.2, 0.52, 0.95, "BUCCINATOR")
msph("MENTALIS",          ( 0,    0.90,-0.66), 0.95, 0.48, 0.65, "MENTALIS")
msph("CORRUGATOR_R",      ( 0.12, 0.82, 0.30), 1.6, 0.42, 0.38, "CORRUGATOR")
msph("CORRUGATOR_L",      (-0.12, 0.82, 0.30), 1.6, 0.42, 0.38, "CORRUGATOR")
msph("NASALIS_R",         ( 0.12, 0.96,-0.06), 0.85, 0.35, 1.1, "NASALIS")
msph("NASALIS_L",         (-0.12, 0.96,-0.06), 0.85, 0.35, 1.1, "NASALIS")
msph("DEPRESSOR_ANGULI_R",( 0.22, 0.88,-0.52), 1.1, 0.30, 1.0, "DEPRESSOR_ANGULI")
msph("DEPRESSOR_ANGULI_L",(-0.22, 0.88,-0.52), 1.1, 0.30, 1.0, "DEPRESSOR_ANGULI")
msph("PLATYSMA",          ( 0,    0.62,-1.10), 9.0, 0.12, 5.0, "PLATYSMA")

# ═══════════════════════════════════════════════════════════════
# SKULL (hidden by default)
# ═══════════════════════════════════════════════════════════════

bm = bmesh.new()
bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=36, radius=0.90)
for v in bm.verts:
    x,y,z = v.co.x, v.co.y, v.co.z
    v.co.z *= 1.28
    if y < -0.1: v.co.y *= 0.84
    if z < -0.45:
        s = max(.06, (z+0.9)/.45)
        v.co.x *= s; v.co.y *= s
msb = bpy.data.meshes.new("CRANIUM_M"); bm.to_mesh(msb); bm.free()
cr = bpy.data.objects.new("BONE_SKULL_CRANIUM", msb)
scene.collection.objects.link(cr); link(cr, COL_BONE); setmat(cr, M_BONE)
subsurf(cr, 1); cr.hide_viewport = True; cr.hide_render = True

def bpart(name, loc, sx, sy, sz):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=12, radius=0.1)
    for v in bm.verts:
        v.co.x *= sx; v.co.y *= sy; v.co.z *= sz
    me = bpy.data.meshes.new(f"B_{name}"); bm.to_mesh(me); bm.free()
    obj = bpy.data.objects.new(f"BONE_{name}", me)
    obj.location = loc
    scene.collection.objects.link(obj); link(obj, COL_BONE); setmat(obj, M_BONE)
    obj.hide_viewport = True; obj.hide_render = True
    return obj

bpart("FRONTAL_BONE",   ( 0,  0.62, 0.82), 8.0, 2.8, 3.2)
bpart("NASAL_BONE_R",   ( 0.10, 0.92, 0.06), 1.0, 0.6, 1.8)
bpart("NASAL_BONE_L",   (-0.10, 0.92, 0.06), 1.0, 0.6, 1.8)
bpart("MAXILLA_R",      ( 0.28, 0.80,-0.20), 2.8, 2.2, 3.5)
bpart("MAXILLA_L",      (-0.28, 0.80,-0.20), 2.8, 2.2, 3.5)
bpart("ZYGOMATIC_R",    ( 0.62, 0.65, 0.02), 2.5, 2.0, 2.0)
bpart("ZYGOMATIC_L",    (-0.62, 0.65, 0.02), 2.5, 2.0, 2.0)
bpart("TEMPORAL_R",     ( 0.88,-0.05, 0.30), 2.8, 3.5, 3.8)
bpart("TEMPORAL_L",     (-0.88,-0.05, 0.30), 2.8, 3.5, 3.8)
bpart("PARIETAL_R",     ( 0.55, 0.05, 0.95), 4.5, 3.0, 3.2)
bpart("PARIETAL_L",     (-0.55, 0.05, 0.95), 4.5, 3.0, 3.2)
bpart("OCCIPITAL",      ( 0,  -0.62, 0.52), 7.0, 2.5, 4.0)
bpart("MANDIBLE_BODY",  ( 0,   0.75,-0.75), 7.5, 3.5, 1.8)
bpart("MANDIBLE_R",     ( 0.62, 0.40,-0.52), 1.8, 1.5, 4.0)
bpart("MANDIBLE_L",     (-0.62, 0.40,-0.52), 1.8, 1.5, 4.0)

# ═══════════════════════════════════════════════════════════════
# VESSELS
# ═══════════════════════════════════════════════════════════════

def tube(name, pts, rad, col, mat):
    cd = bpy.data.curves.new(name,'CURVE')
    cd.dimensions = '3D'; cd.bevel_depth = rad; cd.bevel_resolution = 4
    sp = cd.splines.new('NURBS'); sp.points.add(len(pts)-1)
    for i,p in enumerate(pts): sp.points[i].co = (*p, 1.0)
    sp.use_endpoint_u = True
    obj = bpy.data.objects.new(name, cd); col.objects.link(obj)
    cd.materials.append(mat)
    obj.hide_viewport = True; obj.hide_render = True
    return obj

vessels = [
  ("VESSEL_FACIAL_ARTERY_R",   [(.48,.52,-.88),(.55,.65,-.60),(.58,.78,-.30),(.52,.86,-.06),(.38,.92,.14)], .009, M_ART),
  ("VESSEL_FACIAL_ARTERY_L",   [(-.48,.52,-.88),(-.55,.65,-.60),(-.58,.78,-.30),(-.52,.86,-.06),(-.38,.92,.14)], .009, M_ART),
  ("VESSEL_TEMPORAL_ARTERY_R", [(.75,.30,.12),(.82,.22,.45),(.78,.18,.78),(.62,.14,1.05)], .007, M_ART),
  ("VESSEL_TEMPORAL_ARTERY_L", [(-.75,.30,.12),(-.82,.22,.45),(-.78,.18,.78),(-.62,.14,1.05)], .007, M_ART),
  ("VESSEL_SUPRAORBITAL_R",    [(.28,.86,.30),(.20,.82,.44),(.10,.78,.58)], .005, M_ART),
  ("VESSEL_SUPRAORBITAL_L",    [(-.28,.86,.30),(-.20,.82,.44),(-.10,.78,.58)], .005, M_ART),
  ("VESSEL_FACIAL_VEIN_R",     [(.42,.50,-.90),(.48,.62,-.62),(.52,.76,-.35),(.50,.85,-.10),(.38,.90,.12)], .008, M_VEIN),
  ("VESSEL_FACIAL_VEIN_L",     [(-.42,.50,-.90),(-.48,.62,-.62),(-.52,.76,-.35),(-.50,.85,-.10),(-.38,.90,.12)], .008, M_VEIN),
  ("VESSEL_LABIAL_ARTERY",     [(.22,.94,-.36),(.10,.97,-.37),(0,.98,-.37),(-.10,.97,-.37),(-.22,.94,-.36)], .004, M_ART),
]
for nm,pts,rad,mat in vessels:
    tube(nm, pts, rad, COL_VESS, mat)

# ═══════════════════════════════════════════════════════════════
# NERVES
# ═══════════════════════════════════════════════════════════════

nerves = [
  ("NERVE_FACIAL_MAIN_R",  [(.80,-.10,.02),(.78,.12,.00),(.72,.28,-.05),(.65,.42,-.12)], .007),
  ("NERVE_FACIAL_MAIN_L",  [(-.80,-.10,.02),(-.78,.12,.00),(-.72,.28,-.05),(-.65,.42,-.12)], .007),
  ("NERVE_TEMPORAL_R",     [(.65,.42,-.12),(.58,.56,.10),(.48,.68,.24),(.32,.78,.34)], .005),
  ("NERVE_TEMPORAL_L",     [(-.65,.42,-.12),(-.58,.56,.10),(-.48,.68,.24),(-.32,.78,.34)], .005),
  ("NERVE_ZYGOMATIC_R",    [(.65,.42,-.12),(.60,.58,-.04),(.50,.68,.04),(.36,.80,.12)], .005),
  ("NERVE_ZYGOMATIC_L",    [(-.65,.42,-.12),(-.60,.58,-.04),(-.50,.68,.04),(-.36,.80,.12)], .005),
  ("NERVE_BUCCAL_R",       [(.65,.42,-.12),(.60,.55,-.22),(.46,.70,-.30),(.28,.84,-.35)], .005),
  ("NERVE_BUCCAL_L",       [(-.65,.42,-.12),(-.60,.55,-.22),(-.46,.70,-.30),(-.28,.84,-.35)], .005),
  ("NERVE_MANDIBULAR_R",   [(.65,.42,-.12),(.60,.52,-.36),(.46,.64,-.54),(.28,.76,-.62)], .005),
  ("NERVE_MANDIBULAR_L",   [(-.65,.42,-.12),(-.60,.52,-.36),(-.46,.64,-.54),(-.28,.76,-.62)], .005),
  ("NERVE_SUPRAORBITAL_R", [(.28,.86,.30),(.22,.82,.44),(.14,.78,.58)], .004),
  ("NERVE_SUPRAORBITAL_L", [(-.28,.86,.30),(-.22,.82,.44),(-.14,.78,.58)], .004),
  ("NERVE_INFRAORBITAL_R", [(.28,.88,-.05),(.18,.92,-.15),(.08,.94,-.20)], .004),
  ("NERVE_INFRAORBITAL_L", [(-.28,.88,-.05),(-.18,.92,-.15),(-.08,.94,-.20)], .004),
  ("NERVE_MENTAL_R",       [(.22,.88,-.65),(.16,.92,-.60),(.10,.94,-.56)], .004),
  ("NERVE_MENTAL_L",       [(-.22,.88,-.65),(-.16,.92,-.60),(-.10,.94,-.56)], .004),
]
for nm,pts,rad in nerves:
    tube(nm, pts, rad, COL_NERV, M_NERV)

# ═══════════════════════════════════════════════════════════════
# CAMERAS
# ═══════════════════════════════════════════════════════════════

def cam(name, loc, rot_deg, lens=85):
    cd = bpy.data.cameras.new(name); cd.lens = lens
    obj = bpy.data.objects.new(name, cd)
    obj.location = Vector(loc)
    obj.rotation_euler = Euler([R(r) for r in rot_deg], 'XYZ')
    COL_CAMS.objects.link(obj)
    return obj

CF = cam("CAMERA_FRONT",       (0, 3.8, 0.10), (90,0,0))
cam("CAMERA_LEFT",              (3.2,.50,.00),  (90,0,90))
cam("CAMERA_RIGHT",             (-3.2,.50,.00), (90,0,-90))
cam("CAMERA_PROFILE",           (3.5,-.20,.00), (90,0,95))
cam("CAMERA_THREE_QUARTER",     (2.2, 2.8,.20), (80,0,38))
scene.camera = CF

# ═══════════════════════════════════════════════════════════════
# LIGHTING — professional clinical studio
# ═══════════════════════════════════════════════════════════════

def alight(name,loc,rot_deg,energy,size,col=(1,.98,.95)):
    ld = bpy.data.lights.new(name,'AREA')
    ld.energy=energy; ld.size=size; ld.color=col[:3]
    obj = bpy.data.objects.new(name,ld)
    obj.location = Vector(loc)
    obj.rotation_euler = Euler([R(r) for r in rot_deg],'XYZ')
    COL_LGHT.objects.link(obj)
    return obj

alight("LIGHT_KEY",    (.8, 2.5, 1.8),  (-35,0,-15), 900, 1.8, (1.0,.98,.95))
alight("LIGHT_FILL",   (-1.5,2.0,.5),   (-20,0, 30), 380, 2.2, (.92,.95,1.0))
alight("LIGHT_RIM_R",  (1.2,-1.8,.8),   (40, 0,-50), 200, 0.8, (1.0,.98,.96))
alight("LIGHT_RIM_L",  (-1.2,-1.8,.8),  (40, 0, 50), 140, 0.8, (.95,.96,1.0))
alight("LIGHT_BOUNCE", (0,.5,-2.2),     (180,0,  0), 90,  3.0, (1.0,.97,.94))

world = scene.world; world.use_nodes = True
wnt = world.node_tree; wnt.nodes.clear()
wo = wnt.nodes.new('ShaderNodeOutputWorld')
wb = wnt.nodes.new('ShaderNodeBackground')
wb.inputs['Color'].default_value = (.88,.88,.90,1)
wb.inputs['Strength'].default_value = .30
wnt.links.new(wb.outputs['Background'], wo.inputs['Surface'])

# ═══════════════════════════════════════════════════════════════
# ENVIRONMENT
# ═══════════════════════════════════════════════════════════════

bpy.ops.mesh.primitive_plane_add(size=24, location=(0,-3.5,-1.8))
bg = bpy.context.active_object; bg.name = "ENVIRONMENT_BACKDROP"
link(bg, COL_ENV); bg.data.materials.append(M_BACK)

bpy.ops.mesh.primitive_plane_add(size=24, location=(0,0,-1.8))
fl = bpy.context.active_object; fl.name = "ENVIRONMENT_FLOOR"
link(fl, COL_ENV); fl.data.materials.append(M_BACK)

# ═══════════════════════════════════════════════════════════════
# REGION EMPTIES (web interaction zones)
# ═══════════════════════════════════════════════════════════════

REGS = {
    "REGION_FOREHEAD": ( 0,   0.90, 0.78),
    "REGION_EYE_R":    ( 0.30, 0.95, 0.24),
    "REGION_EYE_L":    (-0.30, 0.95, 0.24),
    "REGION_NOSE":     ( 0,   1.05,-0.10),
    "REGION_CHEEK_R":  ( 0.55, 0.86,-0.12),
    "REGION_CHEEK_L":  (-0.55, 0.86,-0.12),
    "REGION_LIPS":     ( 0,   0.98,-0.42),
    "REGION_CHIN":     ( 0,   0.88,-0.70),
    "REGION_JAW_R":    ( 0.62, 0.65,-0.60),
    "REGION_JAW_L":    (-0.62, 0.65,-0.60),
    "REGION_NECK":     ( 0,   0.58,-1.10),
}

for nm,loc in REGS.items():
    bpy.ops.object.empty_add(type='SPHERE', radius=.055, location=loc)
    e = bpy.context.active_object; e.name = nm
    if e.name in scene.collection.objects:
        scene.collection.objects.unlink(e)
    COL_REGS.objects.link(e)

# ═══════════════════════════════════════════════════════════════
# VISIBILITY
# ═══════════════════════════════════════════════════════════════

for col in [COL_SKIN, COL_EYES, COL_NOSE, COL_MOUT, COL_ENV]:
    for o in col.objects:
        o.hide_viewport = False; o.hide_render = False

for col in [COL_SUBC, COL_MUSC, COL_VESS, COL_NERV, COL_BONE]:
    for o in col.objects:
        o.hide_viewport = True; o.hide_render = True

# ═══════════════════════════════════════════════════════════════
# RENDER SETTINGS
# ═══════════════════════════════════════════════════════════════

scene.render.engine = 'CYCLES'
try:
    scene.cycles.device = 'GPU'
    p = bpy.context.preferences.addons['cycles'].preferences
    p.compute_device_type = 'CUDA'; p.get_devices()
except: pass
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.render.resolution_x = 2560; scene.render.resolution_y = 2560
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "E:/loyihalar/biocontrol/blender/ANATOMY_V3_RENDER.png"

try:
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            for sp in area.spaces:
                if sp.type == 'VIEW_3D':
                    sp.shading.type = 'MATERIAL'
                    sp.shading.use_scene_lights = True
            break
except: pass

bpy.ops.object.select_all(action='DESELECT')
print("="*60)
print("  BioControl Anatomy v3 — REALISTIC HEAD — BUILT")
print("="*60)
print(f"  Objects  : {len(list(bpy.data.objects))}")
print(f"  Materials: {len(list(bpy.data.materials))}")
print("  Head mesh: 80x60 UV sphere + sculpted facial features")
print("  Nose: protruding, cartilage + nostrils")
print("  Eyes: sclera + iris + pupil + cornea")
print("  Mouth: upper/lower lips + teeth + tongue")
print("="*60)
