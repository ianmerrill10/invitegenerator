# InviteGenerator Template Inventory

> **Last Updated:** 2025-12-18
> **Total Templates:** 298 unique templates in AWS S3 + 16 development samples
> **AWS CLI Access:** Verified working

---

## Summary

| Storage Location | Template Count | Status |
|------------------|----------------|--------|
| AWS S3 Bucket | 298 | Production Ready |
| Local Development (templates.ts) | 16 | Sample/Dev |
| GEMINI TEMPLATES folder | 6 source images | Source Files |
| **TOTAL PRODUCTION** | **298** | Ready |

---

## AWS S3 Template Storage

### Primary Bucket
- **Bucket Name:** `invitegenerator-templates-983101357971`
- **Region:** us-east-1
- **Structure:** `templates/{category}/{subcategory}/{template_id}_full.png` and `{template_id}_thumb.png`
- **URL Pattern:** `https://invitegenerator-templates-983101357971.s3.amazonaws.com/templates/...`

### Templates by Category

| Category | Count | Subcategories |
|----------|-------|---------------|
| Wedding | 70 | ceremony, classic, beach, destination, engagement, floral, garden, luxe, minimal, modern, romantic, rustic, save-the-date, vintage |
| Birthday | 63 | adult, adult-elegant, adult-luxe, adult-modern, kids, kids-colorful, kids-dinosaur, kids-fun, kids-princess, kids-superhero, kids-unicorn, teen, teen-cool, milestone, sweet16, first, fiftieth, thirtieth, fortieth, seventieth, sixtieth, twenty-first, pool-party, surprise |
| Holiday | 23 | christmas, christmas-classic, christmas-modern, christmas-rustic, newyear, easter, halloween, thanksgiving, valentines, 4th-july, hanukkah, diwali, lunar-new-year |
| Baby Shower | 22 | boy, boy-classic, boy-modern, girl, girl-classic, girl-modern, neutral, neutral-boho, safari, woodland, twins, storybook, garden, ocean, rainbow |
| Graduation | 18 | college, highschool, masters, phd, medical, law, elementary, middle-school |
| Anniversary | 15 | first, fifth (wood), tenth, twenty-fifth (silver), fiftieth (golden), 60th (diamond), 40th (ruby), surprise, vow-renewal |
| Corporate | 14 | conference, gala, awards, networking, seminar, team-building, holiday-party, launch-party, formal, modern, launch |
| Bridal Shower | 14 | tea-party, garden, brunch, beach, spa, lingerie, wine-tasting, boho, elegant |
| Kids Party | 12 | princess, superhero, unicorn, dinosaur, safari, space, mermaid, sports, circus, pirate |
| Engagement | 11 | party, classic, modern, garden, formal, romantic, brunch, casual, cocktail, destination |
| Dinner Party | 11 | formal, cocktail, garden, elegant, wine-dinner, wine, murder-mystery, game-night |
| Religious | 9 | baptism, first-communion, communion, confirmation, bar-mitzvah, barmitzvah, quinceanera |
| Retirement | 6 | classic, celebration, beach, golf, travel |
| Housewarming | 5 | modern, garden, classic, rustic |
| Reunion | 3 | family, class, military |
| Sports | 1 | championship |
| Seasonal | 1 | spring |
| **TOTAL** | **298** | |

---

## Other S3 Buckets (Reference)

| Bucket Name | Purpose | Contents |
|-------------|---------|----------|
| `invitegenerator-assets` | Production assets | Empty (pending population) |
| `invitegenerator-uploads` | User uploads | User-generated content |
| `invitegen-ai-templates-983101357971` | AI template storage | Empty |
| `wedding-invitation-templates` | Legacy/testing | Empty |

---

## Local File Storage

### GEMINI TEMPLATES Folder
**Location:** `invitegenerator/GEMINI TEMPLATES/`

| File | Size | Description |
|------|------|-------------|
| Gemini_Generated_Image_38qyqh38qyqh38qy.jpg | 691KB | AI-generated source |
| Gemini_Generated_Image_afwk2afwk2afwk2a.jpg | 655KB | AI-generated source |
| Gemini_Generated_Image_upfv2kupfv2kupfv.jpg | 757KB | AI-generated source |
| Gemini_Generated_Image_yuuwgxyuuwgxyuuw.jpg | 671KB | AI-generated source |
| unnamed.jpg | 247KB | Source image |
| weddingtemplate1.png | 6.6MB | Wedding template source |
| image-converter.html | 28KB | Utility tool |
| pngs/ | (empty) | Conversion output folder |

### Development Templates (lib/data/templates.ts)
**Location:** `invitegenerator-app/lib/data/templates.ts`

16 hardcoded sample templates for development:
- 4 Wedding templates
- 4 Birthday templates
- 2 Baby Shower templates
- 2 Corporate templates
- 2 Holiday templates
- 2 Dinner Party templates

---

## AWS CLI Commands Reference

```bash
# List all templates
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive

# Count unique templates (full images only)
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | wc -l

# Count by category
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | awk -F'/' '{print $2}' | sort | uniq -c

# Download a template
aws s3 cp s3://invitegenerator-templates-983101357971/templates/wedding/classic/tmpl_wedding_classic_elegant_q9mm_mizv5j5p_full.png ./

# Sync all templates locally
aws s3 sync s3://invitegenerator-templates-983101357971/templates/ ./local-templates/
```

---

## Template File Naming Convention

```
tmpl_{category}_{subcategory}_{style}_{unique_id}_full.png
tmpl_{category}_{subcategory}_{style}_{unique_id}_thumb.png
```

**Example:**
- `tmpl_wedding_ceremony_elegant_kd4p_miz41liu_full.png`
- `tmpl_wedding_ceremony_elegant_kd4p_miz41liu_thumb.png`

**Parts:**
- `tmpl_` - Template prefix
- `wedding` - Category
- `ceremony` - Subcategory
- `elegant` - Style
- `kd4p_miz41liu` - Unique ID
- `_full.png` / `_thumb.png` - Size variant

---

## Template Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| S3 Storage | Active | All 298 templates uploaded |
| API Endpoint | Active | `/api/templates` |
| Gallery Display | Active | Template gallery working |
| Search/Filter | Active | Category and tag filtering |
| Premium Access | Pending | Stripe integration needed |
| Thumbnail Generation | Complete | All thumbs generated |

---

## Future Template Plans

Based on TEMPLATE_GENERATION_PROMPTS.md target: **1001 templates**

| Category | Current | Target | Remaining |
|----------|---------|--------|-----------|
| Wedding | 70 | 300 | 230 |
| Birthday | 63 | 200 | 137 |
| Baby Shower | 22 | 100 | 78 |
| Graduation | 18 | 75 | 57 |
| Anniversary | 15 | 75 | 60 |
| Corporate | 14 | 75 | 61 |
| Holiday | 23 | 75 | 52 |
| Bridal Shower | 14 | 50 | 36 |
| Other Events | 59 | 51 | (exceeded) |
| **TOTAL** | **298** | **1001** | **703** |

---

*This inventory is automatically maintained. Run the AWS CLI commands above to verify current counts.*
