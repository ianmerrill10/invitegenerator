# InviteGenerator Template Generation Prompts

> **Purpose:** Use these prompts with Gemini AI or other AI tools to generate 1001 beautiful invitation templates
> **Target:** Generate JSON template data that can be imported into the app

---

## Template Categories & Counts

| Category | Count | Description |
|----------|-------|-------------|
| Wedding | 300 | Elegant, romantic, modern, traditional |
| Birthday | 200 | Kids, adults, milestone ages |
| Baby Shower | 100 | Boy, girl, gender neutral |
| Graduation | 75 | High school, college, professional |
| Anniversary | 75 | Silver, gold, milestone years |
| Corporate | 75 | Conferences, meetings, parties |
| Holiday | 75 | Christmas, New Year, Valentine's |
| Bridal Shower | 50 | Elegant, fun, themed |
| Other Events | 51 | Engagement, retirement, etc. |
| **TOTAL** | **1001** | |

---

## Master Template Structure

```json
{
  "id": "template_unique_id",
  "name": "Template Display Name",
  "description": "Elegant description of the template (2-3 sentences)",
  "category": "wedding|birthday|baby_shower|graduation|anniversary|corporate|holiday|bridal_shower|other",
  "subcategory": "specific_type",
  "tags": ["tag1", "tag2", "tag3"],
  "style": "modern|classic|elegant|playful|minimalist|rustic|bohemian|vintage|luxury|casual",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "canvasSize": {
    "width": 800,
    "height": 1000
  },
  "elements": [],
  "isPremium": true|false,
  "previewImage": "url_to_preview"
}
```

---

## Generation Prompts by Category

### Wedding Templates (300)

#### Prompt 1: Classic & Elegant (100 templates)
```
Generate 100 wedding invitation template designs in JSON format.

Style requirements:
- Classic and elegant aesthetics
- Color palettes: ivory, gold, blush, sage, navy, burgundy
- Typography: Serif fonts for titles, clean sans-serif for details
- Elements: Floral borders, monograms, watercolor accents, gold foil effects

Include variety in:
- Floral styles (roses, peonies, eucalyptus, wildflowers)
- Frame designs (rectangular, oval, arch)
- Layout orientations (portrait, landscape)

Each template needs:
- Unique name (e.g., "Romantic Rose Garden", "Golden Hour Elegance")
- 2-3 sentence description highlighting key design features
- 3-5 relevant tags
- Color palette with 5 hex codes
- Premium status (30% premium, 70% free)

Focus on designs that appeal to couples seeking timeless, sophisticated invitations.
```

#### Prompt 2: Modern & Minimalist (75 templates)
```
Generate 75 modern minimalist wedding invitation templates in JSON format.

Style requirements:
- Clean, contemporary aesthetics
- Color palettes: black/white, sage green, dusty blue, terracotta, neutral tones
- Typography: Modern sans-serif fonts, bold headlines
- Elements: Geometric shapes, line art, abstract patterns, negative space

Design variations:
- Typography-focused layouts
- Geometric frame designs
- Photo integration options
- Split layouts

Each template needs:
- Unique modern-sounding name (e.g., "Serif Simplicity", "Line & Vine")
- Description emphasizing modern appeal
- Tags including "modern", "minimalist"
- Contemporary color schemes
```

#### Prompt 3: Rustic & Bohemian (75 templates)
```
Generate 75 rustic and bohemian wedding invitation templates.

Style requirements:
- Natural, earthy aesthetics
- Colors: warm browns, terracotta, sage, cream, rust, forest green
- Typography: Mix of script and hand-drawn fonts
- Elements: Leaves, feathers, dreamcatchers, wood textures, pressed flowers

Include:
- Barn wedding themes
- Garden party styles
- Desert/Southwest themes
- Forest/woodland themes
- Beach boho themes

Each template description should evoke natural beauty and free-spirited romance.
```

#### Prompt 4: Luxury & Formal (50 templates)
```
Generate 50 luxury formal wedding invitation templates.

Style requirements:
- High-end, sophisticated aesthetics
- Colors: black, gold, champagne, deep jewel tones
- Typography: Elegant serif fonts, script accents
- Elements: Ornate borders, crests, monograms, embossed effects

Design inspirations:
- Black tie events
- Ballroom weddings
- Estate weddings
- Royal/regal themes
- Art deco glamour

Mark 80% as premium templates.
```

---

### Birthday Templates (200)

#### Prompt 5: Kids Birthday (80 templates)
```
Generate 80 kids birthday invitation templates.

Age groups and themes:
- First birthday (10): milestone celebration, "one" themes
- Toddlers 2-4 (20): animals, rainbows, balloons, cartoon characters
- Kids 5-8 (25): dinosaurs, unicorns, superheroes, princess, sports
- Tweens 9-12 (25): gaming, space, art, dance, outdoor adventure

Style requirements:
- Bright, cheerful colors
- Playful fonts
- Fun illustrations
- Age-appropriate themes

Each template should feel fun, celebratory, and parent-approved.
```

#### Prompt 6: Teen Birthday (30 templates)
```
Generate 30 teenage birthday invitation templates (ages 13-19).

Themes:
- Sweet 16 (10): elegant, pink/gold, milestone
- Quinceañera (5): traditional, pink, rose themes
- Gaming/tech (5): neon, pixel art, controller themes
- Party/social (10): sleek, modern, Instagram-worthy

Colors: Neon accents, black and gold, pastels, gradient effects
```

#### Prompt 7: Adult Milestone Birthdays (50 templates)
```
Generate 50 adult milestone birthday templates.

Milestones:
- 21st birthday (10): celebration, coming of age
- 30th birthday (10): dirty thirty, elegant
- 40th birthday (10): fabulous 40, sophisticated
- 50th birthday (10): golden milestone
- 60+ birthdays (10): celebration of life

Style: Elegant yet celebratory, gold accents, sophisticated typography
```

#### Prompt 8: General Adult Birthday (40 templates)
```
Generate 40 general adult birthday party invitation templates.

Themes:
- Cocktail party
- Backyard BBQ
- Dinner party
- Surprise party
- Themed parties (decades, tropical, casino)

Style variations from casual to upscale.
```

---

### Baby Shower Templates (100)

#### Prompt 9: Baby Shower Collection
```
Generate 100 baby shower invitation templates.

Categories:
- Baby boy (30): blue themes, nautical, safari, sports, gentle
- Baby girl (30): pink themes, floral, princess, butterflies, bows
- Gender neutral (25): green/yellow, animals, modern, nature
- Twins (15): coordinated designs, pairs themes

Style requirements:
- Soft, gentle colors
- Cute but not overly childish
- Elegant options for upscale showers
- Playful options for casual gatherings

Include elements: Baby animals, storks, baby items, clouds, stars, flowers
```

---

### Graduation Templates (75)

#### Prompt 10: Graduation Collection
```
Generate 75 graduation invitation templates.

Categories:
- High school (25): school colors, caps, milestone
- College/University (25): academic, sophisticated, celebratory
- Graduate school (15): professional, elegant
- Other achievements (10): trade school, certifications

Design elements:
- Caps and diplomas
- Year prominently featured
- School color customization options
- Photo integration areas

Mix of celebratory and formal styles.
```

---

### Anniversary Templates (75)

#### Prompt 11: Anniversary Collection
```
Generate 75 anniversary celebration templates.

Categories:
- 1st anniversary (10): paper theme, new love
- 5th anniversary (10): wood theme
- 10th anniversary (10): tin/aluminum theme
- 25th silver anniversary (15): silver, elegant
- 50th golden anniversary (15): gold, traditional
- General anniversaries (15): love celebration

Style: Romantic, celebratory, elegant typography, couple-focused
```

---

### Corporate Templates (75)

#### Prompt 12: Corporate Events
```
Generate 75 corporate event invitation templates.

Categories:
- Conference/seminar (20): professional, informative
- Company party (20): celebration, year-end
- Product launch (15): modern, sleek
- Networking events (10): professional, social
- Awards/gala (10): formal, elegant

Style requirements:
- Professional yet engaging
- Clean layouts
- Logo placement areas
- Corporate color scheme compatibility
- Mix of industries (tech, finance, creative, healthcare)
```

---

### Holiday Templates (75)

#### Prompt 13: Holiday Collection
```
Generate 75 holiday event invitation templates.

Categories:
- Christmas party (25): traditional, modern, corporate
- New Year's Eve (15): glamorous, countdown, celebration
- Valentine's Day (15): romantic, Galentine's, party
- Halloween (10): spooky, costume party, kids
- Other holidays (10): Thanksgiving, Easter, 4th of July

Design elements appropriate to each holiday while maintaining elegance.
```

---

### Bridal Shower Templates (50)

#### Prompt 14: Bridal Shower Collection
```
Generate 50 bridal shower invitation templates.

Themes:
- Classic elegant (15): floral, sophisticated
- Brunch shower (10): mimosas, garden party
- Lingerie shower (10): tasteful, playful
- Themed showers (15): tea party, wine tasting, spa day

Colors: Blush, sage, gold, champagne, soft pastels
Style: Feminine, celebratory, elegant
```

---

### Other Events Templates (51)

#### Prompt 15: Miscellaneous Events
```
Generate 51 invitation templates for other events.

Categories:
- Engagement party (15): celebration, pre-wedding
- Retirement party (12): celebration, milestone
- Housewarming (12): new home, gathering
- Reunion (12): family, school, military

Mix of formal and casual styles appropriate to each event type.
```

---

## Template Description Guidelines

Each template description should:

1. **Be 2-3 sentences long**
2. **Highlight key visual features**
3. **Mention the mood/feeling it evokes**
4. **Reference ideal use cases**
5. **Use elegant, aspirational language**

### Good Example:
"The Rose Garden Romance template features hand-painted watercolor roses in soft blush and cream tones, framed by delicate gold foil accents. Perfect for garden weddings and romantic spring celebrations, this design brings timeless elegance to your special day."

### Avoid:
- Generic descriptions
- Technical jargon
- Overly long sentences
- Missing emotional appeal

---

## Color Palette Guidelines

### Wedding Palettes
- Classic: Ivory (#FFFFF0), Gold (#D4AF37), Blush (#FFB6C1)
- Modern: White (#FFFFFF), Black (#000000), Sage (#9DC183)
- Romantic: Rose (#FF007F), Champagne (#F7E7CE), Cream (#FFFDD0)

### Birthday Palettes
- Kids: Bright primaries, rainbow combinations
- Adults: Gold accents, sophisticated neutrals
- Teens: Neon, pastels, trendy combinations

### Corporate Palettes
- Professional: Navy (#000080), White (#FFFFFF), Gray (#808080)
- Creative: Bold combinations with white space
- Tech: Gradients, blue tones, clean whites

---

## Import Instructions

After generating templates with these prompts:

1. Format JSON correctly with all required fields
2. Validate JSON structure
3. Import using the admin template manager
4. Review preview images
5. Test on multiple devices
6. Assign premium status appropriately

---

## Quality Checklist

For each batch of templates:
- [ ] Unique and descriptive names
- [ ] Accurate categorization
- [ ] Appropriate tags (3-5 per template)
- [ ] Valid color hex codes
- [ ] Elegant descriptions
- [ ] Premium/free ratio balanced
- [ ] Visual variety within category
- [ ] Cultural sensitivity reviewed
- [ ] Spelling and grammar checked

---

*Use these prompts iteratively, generating 25-50 templates at a time for best results. Review and refine before importing to the app.*
