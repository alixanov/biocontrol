"""
BioControl - Premium Medical Human Head Anatomy
Blender 5.2 Python Script - build_anatomy_master.py

HOW TO RUN:
  1. Open Blender 5.2
  2. Open Scripting workspace
  3. Click Open > select this file
  4. Click Run Script (triangle button)
  5. Wait ~60 seconds for full build
  6. Use the Outliner to toggle collection visibility
  7. Export GLB: File > Export > glTF 2.0

LAYER VIEWS (toggle in Outliner eye icon):
  ANATOMY_SKIN          = External view (skin visible)
  ANATOMY_SUBCUTANEOUS  = Subcutaneous fat layer
  ANATOMY_MUSCLES       = 17 individual facial muscles
  ANATOMY_VESSELS       = Arteries + veins
  ANATOMY_NERVES        = Facial nerve branches
  ANATOMY_BONES         = Skull + facial bones
  ANATOMY_EYES          = Eyeball anatomy
  ANATOMY_NOSE          = Nasal structures
  ANATOMY_MOUTH         = Lips, teeth, tongue
"""

import bpy
import bmesh
import math
from mathutils import Vector, Euler

# ─── SCENE RESET ───────────────────────────────────────────────

def reset_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for c in list(bpy.data.collections): bpy.data.collections.remove(c)
    for m in list(bpy.data.materials):   bpy.data.materials.remove(m)
    for m in list(bpy.data.meshes):      bpy.data.meshes.remove(m)
    for c in list(bpy.data.curves):      bpy.data.curves.remove(c)
    for t in list(bpy.data.textures):    bpy.data.textures.remove(t)

reset_scene()
scene = bpy.context.scene

# ─── COLLECTIONS ───────────────────────────────────────────────

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
COL_HI   = mkcol("ANATOMY_HEAD_HI",       ROOT)
COL_RT   = mkcol("ANATOMY_HEAD_REALTIME", ROOT)
COL_REGS = mkcol("ANATOMY_REGIONS",       ROOT)

# ─── UTILITIES ─────────────────────────────────────────────────

def link(obj, col):
    col.objects.link(obj)
    if obj.name in scene.collection.objects:
        scene.collection.objects.unlink(obj)

def subsurf(obj, v=2, r=3):
    m = obj.modifiers.new("Subd", 'SUBSURF')
    m.levels = v; m.render_levels = r

def setmat(obj, mat):
    obj.data.materials.clear()
    obj.data.materials.append(mat)

def disp(obj, s=0.005):
    tx = bpy.data.textures.new("D_" + obj.name[:14], 'CLOUDS')
    tx.noise_scale = 0.6; tx.noise_depth = 3
    md = obj.modifiers.new("Disp", 'DISPLACE')
    md.texture = tx; md.strength = s
    md.texture_coords = 'OBJECT'

def pbr(name, col, rough=0.6, spec=0.3, sss=0.0,
        sssr=(1,.3,.1), trans=0.0, ior=1.5):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree; nt.nodes.clear()
    out  = nt.nodes.new('ShaderNodeOutputMaterial')
    bs   = nt.nodes.new('ShaderNodeBsdfPrincipled')
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

def noise_bump(mat, sc=80, st=0.28):
    nt = mat.node_tree
    bs = next((n for n in nt.nodes if n.type=='BSDF_PRINCIPLED'), None)
    if not bs: return
    tc = nt.nodes.new('ShaderNodeTexCoord'); tc.location=(-500,-100)
    nz = nt.nodes.new('ShaderNodeTexNoise'); nz.location=(-250,-100)
    bm = nt.nodes.new('ShaderNodeBump');     bm.location=(-50,-100)
    nz.inputs['Scale'].default_value = sc
    nz.inputs['Detail'].default_value = 10
    nz.inputs['Roughness'].default_value = 0.75
    bm.inputs['Strength'].default_value = st
    bm.inputs['Distance'].default_value = 0.002
    nt.links.new(tc.outputs['Object'], nz.inputs['Vector'])
    nt.links.new(nz.outputs['Fac'],    bm.inputs['Height'])
    nt.links.new(bm.outputs['Normal'], bs.inputs['Normal'])

def tube(name, pts, rad, col, mat):
    cd = bpy.data.curves.new(name, 'CURVE')
    cd.dimensions = '3D'; cd.bevel_depth = rad; cd.bevel_resolution = 4
    sp = cd.splines.new('NURBS'); sp.points.add(len(pts)-1)
    for i, p in enumerate(pts): sp.points[i].co = (*p, 1.0)
    sp.use_endpoint_u = True
    obj = bpy.data.objects.new(name, cd); col.objects.link(obj)
    cd.materials.append(mat)
    return obj

R = math.radians

# ─── MATERIALS ─────────────────────────────────────────────────

M_SKIN = pbr("MAT_SKIN", (.78,.52,.40), rough=.62, spec=.28,
    sss=.35, sssr=(1.10,.45,.22))
noise_bump(M_SKIN, 160, .28)

M_SUBC = pbr("MAT_SUBCUTANEOUS", (.90,.78,.52), rough=.80,
    sss=.40, sssr=(.90,.70,.30))

M_BONE = pbr("MAT_BONE", (.92,.88,.78), rough=.70, spec=.18)
noise_bump(M_BONE, 60, .35)

M_ART  = pbr("MAT_ARTERY", (.72,.16,.16), rough=.35, spec=.30,
    sss=.10, sssr=(.5,.1,.1))
M_VEIN = pbr("MAT_VEIN",   (.28,.28,.62), rough=.38, spec=.25)
M_NERV = pbr("MAT_NERVE",  (.88,.82,.55), rough=.55, spec=.20)

M_SCLE = pbr("MAT_SCLERA", (.96,.95,.93), rough=.15, spec=.90)
M_IRIS = pbr("MAT_IRIS",   (.22,.38,.52), rough=.40, spec=.50)
M_PUPIL= pbr("MAT_PUPIL",  (.02,.02,.02), rough=.05, spec=1.0)
M_CORN = pbr("MAT_CORNEA", (.98,.98,.98), rough=.00, spec=1.0, trans=.95, ior=1.376)
M_CART = pbr("MAT_CARTILAGE", (.82,.86,.88), rough=.40, sss=.15, trans=.05)
M_TOOT = pbr("MAT_TOOTH",  (.95,.94,.90), rough=.18, spec=.85)
M_TONG = pbr("MAT_TONGUE", (.82,.35,.35), rough=.65, sss=.25, sssr=(.6,.2,.2))
M_BACK = pbr("MAT_BACKDROP",(.92,.92,.94), rough=1.0, spec=.00)

def mmat(name, r, g, b):
    m = pbr(name, (r,g,b), rough=.72, spec=.12, sss=.18, sssr=(.8,.25,.15))
    noise_bump(m, 50, .55); return m

MM = {
    "FRONTALIS":         mmat("MAT_M_FRONT", .64,.20,.18),
    "ORBICULARIS_OCULI": mmat("MAT_M_OO",    .60,.18,.22),
    "CORRUGATOR":        mmat("MAT_M_CORR",  .58,.19,.20),
    "PROCERUS":          mmat("MAT_M_PROC",  .62,.21,.18),
    "NASALIS":           mmat("MAT_M_NASA",  .63,.20,.19),
    "LEVATOR_LABII":     mmat("MAT_M_LLEV",  .61,.22,.20),
    "ZYGOMATICUS_MAJOR": mmat("MAT_M_ZYMAJ", .64,.21,.17),
    "ZYGOMATICUS_MINOR": mmat("MAT_M_ZYMIN", .63,.20,.18),
    "RISORIUS":          mmat("MAT_M_RISO",  .60,.22,.21),
    "ORBICULARIS_ORIS":  mmat("MAT_M_OOR",   .59,.18,.22),
    "BUCCINATOR":        mmat("MAT_M_BUCC",  .62,.19,.20),
    "DEPRESSOR_ANGULI":  mmat("MAT_M_DANG",  .61,.21,.19),
    "DEPRESSOR_LABII":   mmat("MAT_M_DLAB",  .60,.20,.20),
    "MENTALIS":          mmat("MAT_M_MENT",  .63,.22,.18),
    "MASSETER":          mmat("MAT_M_MASS",  .68,.20,.16),
    "TEMPORALIS":        mmat("MAT_M_TEMP",  .66,.19,.17),
    "PLATYSMA":          mmat("MAT_M_PLAT",  .57,.21,.22),
}

# ─── LAYER 1: SKIN ─────────────────────────────────────────────

def head_mesh(segs_u=64, segs_v=48, rad=1.0):
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=segs_u, v_segments=segs_v, radius=rad)
    for v in bm.verts:
        x,y,z = v.co.x, v.co.y, v.co.z
        v.co.z *= 1.35
        if y < -0.1: v.co.y *= 0.88
        if z < -0.60:
            s = max(.08, (z+1.35)/.75)
            v.co.x *= s; v.co.y *= s
        ff = max(0,y)*max(0,1-abs(x)*1.2)*max(0,1-abs(z)*1.4)
        v.co.y += ff * 0.15
    ms = bpy.data.meshes.new("HEAD_MESH")
    bm.to_mesh(ms); bm.free(); return ms

obj = bpy.data.objects.new("SKIN_HEAD", head_mesh())
scene.collection.objects.link(obj); link(obj, COL_SKIN)
setmat(obj, M_SKIN); subsurf(obj, 2, 3); disp(obj, .004)

# Neck
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=.50, depth=.90, location=(0,0,-1.22))
nk = bpy.context.active_object; nk.name = "SKIN_NECK"
link(nk, COL_SKIN); setmat(nk, M_SKIN); subsurf(nk,1); disp(nk,.006)

# Ears
for sd, sx in [('R',1),('L',-1)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=14,
        radius=.18, location=(sx*.97,-.04,.06))
    e = bpy.context.active_object; e.name = f"SKIN_EAR_{sd}"
    e.scale = (.45,.25,.68)
    bpy.ops.object.select_all(action='DESELECT')
    e.select_set(True); bpy.context.view_layer.objects.active = e
    bpy.ops.object.transform_apply(scale=True)
    link(e, COL_SKIN); setmat(e, M_SKIN); subsurf(e,1)

# ─── LAYER 2: SUBCUTANEOUS ─────────────────────────────────────

obj = bpy.data.objects.new("SUBCUTANEOUS_TISSUE", head_mesh(48,36,.97))
scene.collection.objects.link(obj); link(obj, COL_SUBC)
setmat(obj, M_SUBC); subsurf(obj,1,2)
obj.hide_viewport = True; obj.hide_render = True

# ─── LAYER 3: MUSCLES ──────────────────────────────────────────

def msph(name, loc, sc, rot=(0,0,0), mk="MASSETER"):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=14,
        radius=.1, location=loc)
    obj = bpy.context.active_object; obj.name = f"MUSCLE_{name}"
    obj.scale = sc; obj.rotation_euler = rot
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True); bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    link(obj, COL_MUSC); setmat(obj, MM.get(mk, list(MM.values())[0]))
    subsurf(obj,1); disp(obj,.003)
    obj.hide_viewport = True; obj.hide_render = True; return obj

def mflat(name, loc, sc, rot=(0,0,0), mk="FRONTALIS"):
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=loc)
    obj = bpy.context.active_object; obj.name = f"MUSCLE_{name}"
    obj.scale = sc; obj.rotation_euler = rot
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True); bpy.context.view_layer.objects.active = obj
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    link(obj, COL_MUSC); setmat(obj, MM.get(mk, list(MM.values())[0]))
    s = obj.modifiers.new("Sol",'SOLIDIFY'); s.thickness = .015
    subsurf(obj,1); disp(obj,.002)
    obj.hide_viewport = True; obj.hide_render = True; return obj

# Frontalis
mflat("FRONTALIS",(0,.73,.78),(.70,.22,.34),(R(-15),0,0),"FRONTALIS")

# Orbicularis Oculi
for sd,ex in [('R',.33),('L',-.33)]:
    bpy.ops.mesh.primitive_torus_add(major_radius=.115,minor_radius=.028,
        major_segments=32,minor_segments=12,
        location=(ex,.82,.16),rotation=(R(80),0,0))
    m=bpy.context.active_object; m.name=f"MUSCLE_ORBICULARIS_OCULI_{sd}"
    link(m,COL_MUSC); setmat(m,MM['ORBICULARIS_OCULI'])
    m.hide_viewport=True; m.hide_render=True

# Corrugator Supercilii
for sd,ex,a in [('R',.12,15),('L',-.12,-15)]:
    msph(f"CORRUGATOR_SUPERCILII_{sd}",(ex,.75,.27),(1.8,.45,.40),(R(-10),0,R(a)),"CORRUGATOR")

# Procerus
msph("PROCERUS",(0,.82,.10),(.55,.38,.80),(R(-12),0,0),"PROCERUS")

# Nasalis
for sd,ex,a in [('R',.12,20),('L',-.12,-20)]:
    msph(f"NASALIS_{sd}",(ex,.88,-.08),(.9,.35,1.2),(R(-20),0,R(a)),"NASALIS")

# Levator Labii Superioris
for sd,ex in [('R',.18),('L',-.18)]:
    msph(f"LEVATOR_LABII_SUPERIORIS_{sd}",(ex,.85,-.20),(.7,.30,1.6),(R(-15),0,0),"LEVATOR_LABII")

# Zygomaticus Major
for sd,ex,a in [('R',.42,35),('L',-.42,-35)]:
    msph(f"ZYGOMATICUS_MAJOR_{sd}",(ex,.72,-.12),(2.6,.32,.55),(R(-5),0,R(a)),"ZYGOMATICUS_MAJOR")

# Zygomaticus Minor
for sd,ex,a in [('R',.32,28),('L',-.32,-28)]:
    msph(f"ZYGOMATICUS_MINOR_{sd}",(ex,.78,-.08),(2.0,.25,.45),(R(-5),0,R(a)),"ZYGOMATICUS_MINOR")

# Risorius
for sd,ex,a in [('R',.50,5),('L',-.50,-5)]:
    msph(f"RISORIUS_{sd}",(ex,.68,-.30),(2.2,.22,.35),(0,0,R(a)),"RISORIUS")

# Orbicularis Oris
bpy.ops.mesh.primitive_torus_add(major_radius=.135,minor_radius=.032,
    major_segments=32,minor_segments=12,
    location=(0,.88,-.38),rotation=(R(78),0,0))
m=bpy.context.active_object; m.name="MUSCLE_ORBICULARIS_ORIS"
link(m,COL_MUSC); setmat(m,MM['ORBICULARIS_ORIS'])
m.hide_viewport=True; m.hide_render=True

# Buccinator
for sd,ex in [('R',.50),('L',-.50)]:
    msph(f"BUCCINATOR_{sd}",(ex,.72,-.35),(2.4,.55,1.0),(0,0,0),"BUCCINATOR")

# Depressor Anguli Oris
for sd,ex,a in [('R',.22,15),('L',-.22,-15)]:
    msph(f"DEPRESSOR_ANGULI_ORIS_{sd}",(ex,.82,-.52),(1.2,.32,1.1),(R(15),0,R(a)),"DEPRESSOR_ANGULI")

# Depressor Labii Inferioris
for sd,ex in [('R',.12),('L',-.12)]:
    msph(f"DEPRESSOR_LABII_INFERIORIS_{sd}",(ex,.86,-.50),(1.0,.28,.90),(R(10),0,0),"DEPRESSOR_LABII")

# Mentalis
msph("MENTALIS",(0,.84,-.65),(1.0,.50,.70),(R(8),0,0),"MENTALIS")

# Masseter
for sd,ex in [('R',.62),('L',-.62)]:
    msph(f"MASSETER_{sd}",(ex,.45,-.42),(1.8,1.0,2.2),(R(-5),0,0),"MASSETER")

# Temporalis
for sd,ex in [('R',.72),('L',-.72)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,
        radius=.38,location=(ex,.05,.65))
    m=bpy.context.active_object; m.name=f"MUSCLE_TEMPORALIS_{sd}"
    m.scale=(.55,.45,.75)
    bpy.ops.object.select_all(action='DESELECT')
    m.select_set(True); bpy.context.view_layer.objects.active=m
    bpy.ops.object.transform_apply(scale=True)
    link(m,COL_MUSC); setmat(m,MM['TEMPORALIS'])
    subsurf(m,1); m.hide_viewport=True; m.hide_render=True

# Platysma
mflat("PLATYSMA",(0,.55,-1.15),(1.1,.12,.65),(R(-25),0,0),"PLATYSMA")

# ─── LAYER 4: SKULL & BONES ────────────────────────────────────

cranium = bpy.data.objects.new("BONE_SKULL_CRANIUM", head_mesh(48,36,.90))
scene.collection.objects.link(cranium); link(cranium, COL_BONE)
setmat(cranium, M_BONE); subsurf(cranium,1,2); disp(cranium,.007)
cranium.hide_viewport=True; cranium.hide_render=True

def bpart(name, loc, sc, rot=(0,0,0)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,
        radius=.1,location=loc)
    obj=bpy.context.active_object; obj.name=f"BONE_{name}"
    obj.scale=sc; obj.rotation_euler=rot
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True); bpy.context.view_layer.objects.active=obj
    bpy.ops.object.transform_apply(scale=True,rotation=True)
    link(obj,COL_BONE); setmat(obj,M_BONE); subsurf(obj,1); disp(obj,.005)
    obj.hide_viewport=True; obj.hide_render=True; return obj

bpart("FRONTAL_BONE",       ( 0,   .62,  .82), (8.0,2.8,3.2))
bpart("NASAL_BONE_R",       ( .10, .92,  .06), (1.0, .6,1.8))
bpart("NASAL_BONE_L",       (-.10, .92,  .06), (1.0, .6,1.8))
bpart("MAXILLA_R",          ( .28, .80, -.20), (2.8,2.2,3.5))
bpart("MAXILLA_L",          (-.28, .80, -.20), (2.8,2.2,3.5))
bpart("ZYGOMATIC_R",        ( .60, .65,  .02), (2.5,2.0,2.0))
bpart("ZYGOMATIC_L",        (-.60, .65,  .02), (2.5,2.0,2.0))
bpart("TEMPORAL_BONE_R",    ( .88,-.05,  .30), (2.8,3.5,3.8))
bpart("TEMPORAL_BONE_L",    (-.88,-.05,  .30), (2.8,3.5,3.8))
bpart("PARIETAL_BONE_R",    ( .55, .05,  .95), (4.5,3.0,3.2))
bpart("PARIETAL_BONE_L",    (-.55, .05,  .95), (4.5,3.0,3.2))
bpart("OCCIPITAL_BONE",     (  0, -.62,  .52), (7.0,2.5,4.0))
bpart("ORBITAL_RIM_R",      ( .32, .82,  .18), (2.2,1.2,1.8))
bpart("ORBITAL_RIM_L",      (-.32, .82,  .18), (2.2,1.2,1.8))
bpart("MANDIBLE_RAMUS_R",   ( .62, .38, -.52), (1.8,1.5,4.0))
bpart("MANDIBLE_RAMUS_L",   (-.62, .38, -.52), (1.8,1.5,4.0))

bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=24,
    radius=.1,location=(0,.72,-.75))
md=bpy.context.active_object; md.name="BONE_MANDIBLE_BODY"
md.scale=(7.5,3.5,1.8)
bpy.ops.object.select_all(action='DESELECT')
md.select_set(True); bpy.context.view_layer.objects.active=md
bpy.ops.object.transform_apply(scale=True)
link(md,COL_BONE); setmat(md,M_BONE); subsurf(md,1); disp(md,.005)
md.hide_viewport=True; md.hide_render=True

for i,tx in enumerate([x*.055 for x in range(-3,4)]):
    for row,tz in [('UP',-.43),('LO',-.50)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10,ring_count=8,
            radius=.025,location=(tx,.92,tz))
        t=bpy.context.active_object; t.name=f"BONE_TOOTH_{row}_{i+1:02d}"
        t.scale=(.85,.60,1.30)
        bpy.ops.object.select_all(action='DESELECT')
        t.select_set(True); bpy.context.view_layer.objects.active=t
        bpy.ops.object.transform_apply(scale=True)
        link(t,COL_BONE); setmat(t,M_TOOT)
        t.hide_viewport=True; t.hide_render=True

# ─── LAYER 5: EYES ─────────────────────────────────────────────

for sd,ex in [('R',.30),('L',-.30)]:
    ey,ez = .82,.18
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=24,
        radius=.115,location=(ex,ey,ez))
    sc=bpy.context.active_object; sc.name=f"EYE_SCLERA_{sd}"
    link(sc,COL_EYES); setmat(sc,M_SCLE)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,
        radius=.062,location=(ex,ey+.08,ez))
    ir=bpy.context.active_object; ir.name=f"EYE_IRIS_{sd}"; ir.scale=(1,.25,1)
    bpy.ops.object.select_all(action='DESELECT')
    ir.select_set(True); bpy.context.view_layer.objects.active=ir
    bpy.ops.object.transform_apply(scale=True)
    link(ir,COL_EYES); setmat(ir,M_IRIS)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=12,
        radius=.030,location=(ex,ey+.105,ez))
    pu=bpy.context.active_object; pu.name=f"EYE_PUPIL_{sd}"; pu.scale=(1,.20,1)
    bpy.ops.object.select_all(action='DESELECT')
    pu.select_set(True); bpy.context.view_layer.objects.active=pu
    bpy.ops.object.transform_apply(scale=True)
    link(pu,COL_EYES); setmat(pu,M_PUPIL)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,
        radius=.118,location=(ex,ey+.01,ez))
    co=bpy.context.active_object; co.name=f"EYE_CORNEA_{sd}"; co.scale=(1,.50,1)
    bpy.ops.object.select_all(action='DESELECT')
    co.select_set(True); bpy.context.view_layer.objects.active=co
    bpy.ops.object.transform_apply(scale=True)
    link(co,COL_EYES); setmat(co,M_CORN)

# ─── LAYER 6: NOSE ─────────────────────────────────────────────

bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=18,
    radius=.12,location=(0,.96,-.12))
nt=bpy.context.active_object; nt.name="NOSE_TIP"; nt.scale=(1,.70,.75)
bpy.ops.object.select_all(action='DESELECT')
nt.select_set(True); bpy.context.view_layer.objects.active=nt
bpy.ops.object.transform_apply(scale=True)
link(nt,COL_NOSE); setmat(nt,M_SKIN); subsurf(nt,1)

for sd,nx in [('R',.09),('L',-.09)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=12,
        radius=.042,location=(nx,.93,-.22))
    no=bpy.context.active_object; no.name=f"NOSE_NOSTRIL_{sd}"
    no.scale=(1,.65,.70)
    bpy.ops.object.select_all(action='DESELECT')
    no.select_set(True); bpy.context.view_layer.objects.active=no
    bpy.ops.object.transform_apply(scale=True)
    link(no,COL_NOSE); setmat(no,M_SKIN)

for sd,nx in [('R',.08),('L',-.08)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=12,
        radius=.08,location=(nx,.92,-.06))
    ca=bpy.context.active_object; ca.name=f"NOSE_CARTILAGE_{sd}"
    ca.scale=(.70,.50,1.40)
    bpy.ops.object.select_all(action='DESELECT')
    ca.select_set(True); bpy.context.view_layer.objects.active=ca
    bpy.ops.object.transform_apply(scale=True)
    link(ca,COL_NOSE); setmat(ca,M_CART)

bpy.ops.mesh.primitive_cube_add(size=.06,location=(0,.88,-.14))
sp=bpy.context.active_object; sp.name="NOSE_SEPTUM"; sp.scale=(.5,1.0,2.5)
bpy.ops.object.select_all(action='DESELECT')
sp.select_set(True); bpy.context.view_layer.objects.active=sp
bpy.ops.object.transform_apply(scale=True)
link(sp,COL_NOSE); setmat(sp,M_CART); subsurf(sp,1)

# ─── LAYER 7: MOUTH ────────────────────────────────────────────

bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,
    radius=.13,location=(0,.90,-.38))
ul=bpy.context.active_object; ul.name="MOUTH_UPPER_LIP"
ul.scale=(1.6,.55,.45)
bpy.ops.object.select_all(action='DESELECT')
ul.select_set(True); bpy.context.view_layer.objects.active=ul
bpy.ops.object.transform_apply(scale=True)
link(ul,COL_MOUT); setmat(ul,M_SKIN); subsurf(ul,1)

bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,
    radius=.13,location=(0,.88,-.46))
ll=bpy.context.active_object; ll.name="MOUTH_LOWER_LIP"
ll.scale=(1.7,.60,.40)
bpy.ops.object.select_all(action='DESELECT')
ll.select_set(True); bpy.context.view_layer.objects.active=ll
bpy.ops.object.transform_apply(scale=True)
link(ll,COL_MOUT); setmat(ll,M_SKIN); subsurf(ll,1)

for i,tx in enumerate([x*.055 for x in range(-3,4)]):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,
        radius=.028,location=(tx,.92,-.43))
    t=bpy.context.active_object; t.name=f"MOUTH_TOOTH_UPPER_{i+1:02d}"
    t.scale=(.85,.60,1.35)
    bpy.ops.object.select_all(action='DESELECT')
    t.select_set(True); bpy.context.view_layer.objects.active=t
    bpy.ops.object.transform_apply(scale=True)
    link(t,COL_MOUT); setmat(t,M_TOOT)

bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=16,
    radius=.10,location=(0,.78,-.50))
tg=bpy.context.active_object; tg.name="MOUTH_TONGUE"
tg.scale=(1.5,1.8,.65)
bpy.ops.object.select_all(action='DESELECT')
tg.select_set(True); bpy.context.view_layer.objects.active=tg
bpy.ops.object.transform_apply(scale=True)
link(tg,COL_MOUT); setmat(tg,M_TONG); subsurf(tg,1)

bpy.ops.mesh.primitive_cube_add(size=.10,location=(0,.72,-.52))
hp=bpy.context.active_object; hp.name="MOUTH_HARD_PALATE"
hp.scale=(2.5,3.0,.50)
bpy.ops.object.select_all(action='DESELECT')
hp.select_set(True); bpy.context.view_layer.objects.active=hp
bpy.ops.object.transform_apply(scale=True)
link(hp,COL_MOUT); setmat(hp,M_BONE); subsurf(hp,1)

# ─── LAYER 8: BLOOD VESSELS ────────────────────────────────────

VD = [
  ("VESSEL_FACIAL_ARTERY_R",    [(.48,.52,-.88),(.55,.65,-.60),(.58,.75,-.30),(.52,.83,-.06),(.38,.88,.14),(.28,.86,.20)], .009, True),
  ("VESSEL_FACIAL_ARTERY_L",    [(-.48,.52,-.88),(-.55,.65,-.60),(-.58,.75,-.30),(-.52,.83,-.06),(-.38,.88,.14),(-.28,.86,.20)], .009, True),
  ("VESSEL_TEMPORAL_ARTERY_R",  [(.75,.30,.12),(.82,.22,.45),(.78,.18,.78),(.62,.14,1.05),(.45,.10,1.18)], .007, True),
  ("VESSEL_TEMPORAL_ARTERY_L",  [(-.75,.30,.12),(-.82,.22,.45),(-.78,.18,.78),(-.62,.14,1.05),(-.45,.10,1.18)], .007, True),
  ("VESSEL_SUPRAORBITAL_R",     [(.28,.82,.28),(.22,.78,.42),(.14,.74,.56),(.06,.70,.70)], .005, True),
  ("VESSEL_SUPRAORBITAL_L",     [(-.28,.82,.28),(-.22,.78,.42),(-.14,.74,.56),(-.06,.70,.70)], .005, True),
  ("VESSEL_INFRAORBITAL_R",     [(.28,.84,-.04),(.18,.88,-.14),(.08,.90,-.18)], .004, True),
  ("VESSEL_INFRAORBITAL_L",     [(-.28,.84,-.04),(-.18,.88,-.14),(-.08,.90,-.18)], .004, True),
  ("VESSEL_LABIAL_ARTERY",      [(.22,.88,-.36),(.12,.91,-.37),(0,.92,-.37),(-.12,.91,-.37),(-.22,.88,-.36)], .004, True),
  ("VESSEL_FACIAL_VEIN_R",      [(.42,.50,-.90),(.48,.62,-.62),(.52,.73,-.35),(.50,.82,-.14),(.42,.87,.06),(.32,.88,.18)], .008, False),
  ("VESSEL_FACIAL_VEIN_L",      [(-.42,.50,-.90),(-.48,.62,-.62),(-.52,.73,-.35),(-.50,.82,-.14),(-.42,.87,.06),(-.32,.88,.18)], .008, False),
]
for nm,pts,rad,art in VD:
    o=tube(nm,pts,rad,COL_VESS,M_ART if art else M_VEIN)
    o.hide_viewport=True; o.hide_render=True

# ─── LAYER 9: NERVES ───────────────────────────────────────────

ND = [
  ("NERVE_FACIAL_MAIN_R",  [(.80,-.10,.02),(.78,.12,.00),(.72,.28,-.05),(.65,.42,-.12)], .007),
  ("NERVE_FACIAL_MAIN_L",  [(-.80,-.10,.02),(-.78,.12,.00),(-.72,.28,-.05),(-.65,.42,-.12)], .007),
  ("NERVE_TEMPORAL_R",     [(.65,.42,-.12),(.58,.56,.10),(.48,.68,.24),(.32,.76,.34),(.18,.78,.38)], .005),
  ("NERVE_TEMPORAL_L",     [(-.65,.42,-.12),(-.58,.56,.10),(-.48,.68,.24),(-.32,.76,.34),(-.18,.78,.38)], .005),
  ("NERVE_ZYGOMATIC_R",    [(.65,.42,-.12),(.60,.58,-.04),(.50,.68,.04),(.36,.78,.12)], .005),
  ("NERVE_ZYGOMATIC_L",    [(-.65,.42,-.12),(-.60,.58,-.04),(-.50,.68,.04),(-.36,.78,.12)], .005),
  ("NERVE_BUCCAL_R",       [(.65,.42,-.12),(.60,.55,-.22),(.46,.68,-.30),(.30,.80,-.34),(.16,.86,-.36)], .005),
  ("NERVE_BUCCAL_L",       [(-.65,.42,-.12),(-.60,.55,-.22),(-.46,.68,-.30),(-.30,.80,-.34),(-.16,.86,-.36)], .005),
  ("NERVE_MANDIBULAR_R",   [(.65,.42,-.12),(.60,.52,-.36),(.46,.62,-.54),(.28,.72,-.62),(.12,.78,-.66)], .005),
  ("NERVE_MANDIBULAR_L",   [(-.65,.42,-.12),(-.60,.52,-.36),(-.46,.62,-.54),(-.28,.72,-.62),(-.12,.78,-.66)], .005),
  ("NERVE_SUPRAORBITAL_R", [(.28,.82,.28),(.24,.78,.44),(.16,.74,.60),(.08,.70,.74)], .004),
  ("NERVE_SUPRAORBITAL_L", [(-.28,.82,.28),(-.24,.78,.44),(-.16,.74,.60),(-.08,.70,.74)], .004),
  ("NERVE_INFRAORBITAL_R", [(.28,.84,-.06),(.20,.88,-.16),(.10,.90,-.22)], .004),
  ("NERVE_INFRAORBITAL_L", [(-.28,.84,-.06),(-.20,.88,-.16),(-.10,.90,-.22)], .004),
  ("NERVE_MENTAL_R",       [(.22,.84,-.65),(.18,.88,-.60),(.12,.90,-.56)], .004),
  ("NERVE_MENTAL_L",       [(-.22,.84,-.65),(-.18,.88,-.60),(-.12,.90,-.56)], .004),
]
for nm,pts,rad in ND:
    o=tube(nm,pts,rad,COL_NERV,M_NERV)
    o.hide_viewport=True; o.hide_render=True

# ─── CAMERAS ───────────────────────────────────────────────────

def cam(name, loc, rot_deg, lens=85, ortho=False, os=2.4):
    cd=bpy.data.cameras.new(name); cd.lens=lens
    if ortho: cd.type='ORTHO'; cd.ortho_scale=os
    obj=bpy.data.objects.new(name,cd)
    obj.location=Vector(loc)
    obj.rotation_euler=Euler([R(r) for r in rot_deg],'XYZ')
    COL_CAMS.objects.link(obj); return obj

CF=cam("CAMERA_FRONT",        (0,3.8,.10),  (90,0,0))
cam("CAMERA_LEFT",             (3.2,.50,.00), (90,0,90))
cam("CAMERA_RIGHT",            (-3.2,.50,.00),(90,0,-90))
cam("CAMERA_PROFILE",          (3.5,-.20,.00),(90,0,95))
cam("CAMERA_THREE_QUARTER",    (2.2,2.8,.20), (80,0,38))
scene.camera=CF

# ─── LIGHTING ──────────────────────────────────────────────────

def alight(name,loc,rot_deg,energy,size,col=(1,.98,.95)):
    ld=bpy.data.lights.new(name,'AREA')
    ld.energy=energy; ld.size=size; ld.color=col[:3]
    obj=bpy.data.objects.new(name,ld)
    obj.location=Vector(loc)
    obj.rotation_euler=Euler([R(r) for r in rot_deg],'XYZ')
    COL_LGHT.objects.link(obj); return obj

alight("LIGHT_KEY",   (.8,2.5,1.8), (-35,0,-15), 800, 1.8, (1.0,.98,.95))
alight("LIGHT_FILL",  (-1.5,2.0,.5),(-20,0,30),  350, 2.2, (.92,.95,1.0))
alight("LIGHT_RIM_R", (1.2,-1.8,.8),(40,0,-50),   180, 0.8, (1.0,.98,.96))
alight("LIGHT_RIM_L", (-1.2,-1.8,.8),(40,0,50),   120, 0.8, (.95,.96,1.0))
alight("LIGHT_BOUNCE",(0,.5,-2.2),  (180,0,0),     80, 3.0, (1.0,.97,.94))

world=scene.world; world.use_nodes=True
wnt=world.node_tree; wnt.nodes.clear()
wo=wnt.nodes.new('ShaderNodeOutputWorld')
wb=wnt.nodes.new('ShaderNodeBackground')
wb.inputs['Color'].default_value=(.90,.90,.92,1)
wb.inputs['Strength'].default_value=.35
wnt.links.new(wb.outputs['Background'],wo.inputs['Surface'])

# ─── ENVIRONMENT ───────────────────────────────────────────────

bpy.ops.mesh.primitive_plane_add(size=22,location=(0,-3.5,-1.8))
bg=bpy.context.active_object; bg.name="ENVIRONMENT_BACKDROP"
link(bg,COL_ENV); bg.data.materials.append(M_BACK)

bpy.ops.mesh.primitive_plane_add(size=22,location=(0,0,-1.8))
fl=bpy.context.active_object; fl.name="ENVIRONMENT_FLOOR"
link(fl,COL_ENV); fl.data.materials.append(M_BACK)

# ─── REALTIME VERSION ──────────────────────────────────────────

obj=bpy.data.objects.new("ANATOMY_HEAD_REALTIME_MESH", head_mesh(32,24,1.0))
scene.collection.objects.link(obj); link(obj,COL_RT)
setmat(obj,M_SKIN); subsurf(obj,1,2)
obj.hide_viewport=True; obj.hide_render=True

bpy.ops.mesh.primitive_uv_sphere_add(segments=64,ring_count=48,radius=1.0,location=(0,0,0))
hi=bpy.context.active_object; hi.name="ANATOMY_HEAD_HI_MESH"
link(hi,COL_HI); setmat(hi,M_SKIN); subsurf(hi,2,4)
hi.hide_viewport=True; hi.hide_render=True

# ─── REGION EMPTIES ────────────────────────────────────────────

for nm,loc in {
  "REGION_FOREHEAD":(0,.82,.72), "REGION_EYE_R":(.30,.90,.18),
  "REGION_EYE_L":(-.30,.90,.18),"REGION_NOSE":(0,.98,-.10),
  "REGION_CHEEK_R":(.52,.80,-.12),"REGION_CHEEK_L":(-.52,.80,-.12),
  "REGION_LIPS":(0,.92,-.42),    "REGION_CHIN":(0,.84,-.68),
  "REGION_JAW_R":(.60,.60,-.58), "REGION_JAW_L":(-.60,.60,-.58),
  "REGION_NECK":(0,.52,-1.10),
}.items():
    bpy.ops.object.empty_add(type='SPHERE',radius=.055,location=loc)
    e=bpy.context.active_object; e.name=nm
    if e.name in scene.collection.objects:
        scene.collection.objects.unlink(e)
    COL_REGS.objects.link(e)

# ─── VISIBILITY — VIEW 01: EXTERNAL ────────────────────────────

for col in [COL_SKIN,COL_EYES,COL_NOSE,COL_MOUT,COL_ENV]:
    for o in col.objects:
        o.hide_viewport=False; o.hide_render=False

for col in [COL_SUBC,COL_MUSC,COL_VESS,COL_NERV,COL_BONE,COL_HI,COL_RT]:
    for o in col.objects:
        o.hide_viewport=True; o.hide_render=True

# ─── RENDER SETTINGS ───────────────────────────────────────────

scene.render.engine='CYCLES'
try:
    scene.cycles.device='GPU'
    p=bpy.context.preferences.addons['cycles'].preferences
    p.compute_device_type='CUDA'; p.get_devices()
except: pass
scene.cycles.samples=256; scene.cycles.use_denoising=True
scene.render.resolution_x=2560; scene.render.resolution_y=2560
scene.render.image_settings.file_format='PNG'
scene.render.image_settings.color_depth='16'
scene.render.filepath="E:/loyihalar/biocontrol/blender/MEDICAL_ANATOMY_RENDER.png"

try:
    for area in bpy.context.screen.areas:
        if area.type=='VIEW_3D':
            for sp in area.spaces:
                if sp.type=='VIEW_3D':
                    sp.shading.type='MATERIAL'
                    sp.shading.use_scene_lights=True
            break
except: pass

bpy.ops.object.select_all(action='DESELECT')

print("="*60)
print("  BioControl Medical Anatomy — BUILD COMPLETE")
print("="*60)
print(f"  Collections : {len(list(bpy.data.collections))}")
print(f"  Objects     : {len(list(bpy.data.objects))}")
print(f"  Materials   : {len(list(bpy.data.materials))}")
print(f"  Muscles     : 17 individual objects")
print(f"  Vessels     : {len(VD)} tubes")
print(f"  Nerves      : {len(ND)} branches")
print("")
print("  VIEW MODES (toggle eye icon in Outliner):")
print("  01 EXTERNAL     ANATOMY_SKIN + EYES + NOSE + MOUTH")
print("  02 SOFT TISSUE  + ANATOMY_SUBCUTANEOUS")
print("  03 MUSCULAR     + ANATOMY_MUSCLES")
print("  04 NEUROVASC.   + ANATOMY_VESSELS + ANATOMY_NERVES")
print("  05 SKELETAL     ANATOMY_BONES only")
print("  06 FULL ANATOMY all collections visible")
print("")
print("  EXPORT GLB: File > Export > glTF 2.0 (.glb/.gltf)")
print("  Target: biocontrol/client/public/models/face_anatomy.glb")
print("="*60)
