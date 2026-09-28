# BioControl 3D Face Medical Anatomy (Blender 5.2 Project)

Полноценная высокодетализированная 3D анатомическая модель головы и лица человека с разделением на независимые анатомические слои.

---

## Структура проекта в Blender 5.2

Файл проекта: **`biocontrol_face_anatomy.blend`**  
Путь: `c:\Users\user\Downloads\biocontrol\blender\biocontrol_face_anatomy.blend`

В Outliner (структуре сцены) модель организована по 6 анатомическим коллекциям (слоям), каждый из которых можно включать, скрывать или редактировать отдельно:

1. **`01_Skin_Layer` (Слой кожи лица):**
   * Объект: `Layer_Skin`
   * PBR-материал человеческой кожи с подповерхностным рассеиванием света (Subsurface Scattering / SSS: 0.18, радиус [1.0, 0.4, 0.2]), текстурой пор и морщинок `Infinite-Level_02_Tangent_SmoothUV.jpg` и цветовой картой `Map-COL.jpg`.
   * Глазные вырезы, губы, нос, подбородок, уши и шея.

2. **`02_Muscles_Layer` (Мышечная система лица):**
   * Объекты:
     - `Layer_Facial_Muscles` — базовый анатомический слой мимических мышц с текстурой мышечных волокон и бамп-рельефом.
     - `m_Frontalis` — лобная мышца (поднятие бровей, удивление).
     - `m_Orbicularis_Oculi_Left` / `Right` — круговая мышца глаза (смыкание век).
     - `m_Zygomaticus_Major_Left` / `Right` — большая скуловая мышца (мышца смеха/улыбки).
     - `m_Masseter_Left` / `Right` — жевательная мышца вдоль угла нижней челюсти.
     - `m_Orbicularis_Oris` — круговая мышца рта (смыкание губ, артикуляция).

3. **`03_Skull_Bones_Layer` (Кости и череп):**
   * Объекты:
     - `Bone_Neurocranium` — свод черепа и лобная кость.
     - `Bone_Maxilla` — верхняя челюсть и грушевидная апертура носа.
     - `Bone_Zygomatic_Arch_Left` / `Right` — скуловые дуги.
     - `Bone_Mandible` — нижняя челюсть (тело, угол, ветви и подбородочный бугор).
     - `Bone_Teeth_Upper` / `Bone_Teeth_Lower` — верхний и нижний зубные ряды.
   * Остеологический PBR-материал костной ткани слоновой кости (`#EBE3D2`).

4. **`04_Blood_Vessels_Layer` (Кровеносные сосуды):**
   * 3D трубчатая сосудистая сеть:
     - `Vessel_Facial_Artery_Left` / `Right` — лицевая артерия (красный артериальный цвет `#E01E1E`).
     - `Vessel_Superior_Labial_Artery_Left` / `Right` — верхняя губная артерия.
     - `Vessel_Facial_Vein_Left` / `Right` — лицевая вена (синий венозный цвет `#1E88E5`).
     - `Vessel_Superficial_Temporal_Artery` / `Vein` — поверхностные височные сосуды.

5. **`05_Nerves_Layer` (Нервная система лица):**
   * 3D ветви лицевого нерва (ЧМН VII) желтого цвета (`#FFE600`):
     - `Nerve_CNVII_Temporal` — височные ветви к лобной мышце.
     - `Nerve_CNVII_Zygomatic` — скуловые ветви к векам.
     - `Nerve_CNVII_Buccal` — щечные ветви к щеке и верхней губе.
     - `Nerve_CNVII_Mandibular` — краевая нижнечелюстная ветвь к подбородку.
     - `Nerve_CNVII_Cervical` — шейная ветвь к подкожной мышце шеи.

6. **`06_Eyes_Layer` (Глазные яблоки):**
   * `Eye_Sclera_Left` / `Right`, `Eye_Iris_Left` / `Right`, `Eye_Pupil_Left` / `Right` — трехкомпонентная анатомическая модель глаз с белоснежной склерой, радужкой и зрачком.

7. **`07_Studio_Lighting` (Медицинский свет и камера):**
   * 3-точечное клиническое освещение (Key Light, Fill Light, Rim Light) и орто-камера 85mm.

---

## Как запустить скрипт пересборки модели

Если вы внесли изменения в скрипт, модель можно мгновенно пересобрать одной командой:
```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" --background --python "c:\Users\user\Downloads\biocontrol\blender\build_complete_medical_anatomy.py"
```

Скрипт автоматически:
1. Создает всю 3D-геометрию и накладывает материалы.
2. Сохраняет файл `biocontrol_face_anatomy.blend` с упакованными текстурами.
3. Экспортирует оптимизированный бинарный `client/public/models/face_anatomy.glb`.

---

## Как открыть и редактировать в интерфейсе Blender 5.2

1. Запустите Blender и откройте:
   `c:\Users\user\Downloads\biocontrol\blender\biocontrol_face_anatomy.blend`
2. Переключите режим отображения во вьюпорте на **Material Preview** (Z -> Material Preview) или **Rendered** (Cycles/Eevee).
3. В правом окне **Outliner** кликайте по значкам "глаза" напротив коллекций (`01_Skin_Layer`, `02_Muscles_Layer` и т.д.), чтобы скрывать или отображать нужные анатомические слои!

---

## Веб-интерфейс 3D Face Studio

В веб-приложении на `http://localhost:3007/face-3d` доступны:
* Переключатели видимости каждого слоя (Кожа, Мышцы, Череп, Сосуды, Нервы, Глаза).
* Слайдер плавной прозрачности кожи (от 0% до 100%).
* Режим среза (Split Cutaway 50/50): левая половина лица показывает кожу, правая — обнажает мышцы, кости, сосуды и нервы.
* Интерактивные анатомические маркеры (Frontalis, Orbicularis Oculi, Zygomaticus, Masseter, Facial Artery, Facial Nerve) с клиническими подсказками.
