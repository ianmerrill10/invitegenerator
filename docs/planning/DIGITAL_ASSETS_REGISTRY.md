# InviteGenerator Digital Assets Registry

> **CRITICAL DOCUMENT - Keep Updated**
> **Last Updated:** 2025-12-18
> **Last Audit:** 2025-12-18
> **Next Audit Due:** 2025-01-18 (Monthly)

---

## Asset Summary Dashboard

| Asset Type | Count | Storage Location | Backup Status | Protection |
|------------|-------|------------------|---------------|------------|
| Templates (Production) | 298 | AWS S3 | Local + ZIP | Watermark + Hotlink Block |
| Templates (Source) | 6 | Local GEMINI folder | N/A | Local only |
| Template Thumbnails | 298 | AWS S3 | With full images | Same as full |
| User Uploads | Variable | AWS S3 | Per-user | User-owned |
| **TOTAL OWNED ASSETS** | **602+** | | | |

---

## Section 1: Template Assets

### 1.1 Production Templates (AWS S3)

**Primary Storage:**
- **Bucket:** `invitegenerator-templates-983101357971`
- **Region:** us-east-1
- **Created:** December 9-10, 2025
- **Total Count:** 298 unique templates (596 files with thumbnails)

**File Structure:**
```
s3://invitegenerator-templates-983101357971/
└── templates/
    ├── anniversary/       (15 templates)
    ├── baby_shower/       (22 templates)
    ├── birthday/          (63 templates)
    ├── bridal_shower/     (14 templates)
    ├── corporate/         (14 templates)
    ├── dinner_party/      (11 templates)
    ├── engagement/        (11 templates)
    ├── graduation/        (18 templates)
    ├── holiday/           (23 templates)
    ├── housewarming/      (5 templates)
    ├── kids_party/        (12 templates)
    ├── religious/         (9 templates)
    ├── retirement/        (6 templates)
    ├── reunion/           (3 templates)
    ├── seasonal/          (1 template)
    ├── sports/            (1 template)
    └── wedding/           (70 templates)
```

**Naming Convention:**
```
tmpl_{category}_{subcategory}_{style}_{unique_id}_full.png
tmpl_{category}_{subcategory}_{style}_{unique_id}_thumb.png
```

### 1.2 Local Backups

| Location | Purpose | Last Updated |
|----------|---------|--------------|
| `invitegenerator-app/templates-local/` | Primary local backup | 2025-12-18 |
| `invitegenerator-app/templates-backup/` | Secondary backup | 2025-12-18 |
| `invitegenerator-app/templates-backup/templates-all.zip` | ZIP archive | 2025-12-18 |

### 1.3 Source Files (GEMINI TEMPLATES)

**Location:** `invitegenerator/GEMINI TEMPLATES/`

| File | Size | Created | Description |
|------|------|---------|-------------|
| Gemini_Generated_Image_38qyqh38qyqh38qy.jpg | 691KB | 2025-12-10 | AI source |
| Gemini_Generated_Image_afwk2afwk2afwk2a.jpg | 655KB | 2025-12-10 | AI source |
| Gemini_Generated_Image_upfv2kupfv2kupfv.jpg | 757KB | 2025-12-10 | AI source |
| Gemini_Generated_Image_yuuwgxyuuwgxyuuw.jpg | 671KB | 2025-12-10 | AI source |
| unnamed.jpg | 247KB | 2025-12-10 | Source image |
| weddingtemplate1.png | 6.6MB | 2025-12-10 | Wedding source |
| image-converter.html | 28KB | 2025-12-10 | Utility tool |

---

## Section 2: Template Categories Detail

### Wedding (70 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| ceremony | 20 | elegant, modern, romantic, rustic, vintage |
| classic | 5 | elegant, romantic, vintage |
| beach | 2 | coastal, tropical |
| destination | 1 | tropical |
| engagement | 10 | elegant, minimalist |
| floral | 5 | botanical, romantic |
| garden | 4 | botanical, bohemian |
| luxe | 3 | luxurious |
| minimal | 5 | minimalist, modern |
| modern | 5 | modern, contemporary |
| romantic | 3 | romantic |
| rustic | 3 | rustic, natural |
| save-the-date | 2 | modern, elegant |
| vintage | 2 | vintage |

### Birthday (63 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| adult | 14 | elegant, luxurious, modern |
| adult-elegant | 1 | elegant |
| adult-luxe | 1 | luxurious |
| adult-modern | 1 | modern |
| kids | 12 | playful, whimsical |
| kids-colorful | 1 | whimsical |
| kids-dinosaur | 1 | playful |
| kids-fun | 1 | playful |
| kids-princess | 1 | romantic |
| kids-superhero | 1 | modern |
| kids-unicorn | 1 | whimsical |
| teen | 5 | modern |
| teen-cool | 1 | modern |
| milestone | 7 | classic, elegant |
| milestone-30/40/50/60 | 4 | various |
| first/thirtieth/fortieth/fiftieth/sixtieth/seventieth | 6 | various |
| sweet-sixteen/sweet16 | 2 | glamorous, luxurious |
| pool-party | 1 | tropical |
| surprise | 1 | playful |
| twenty-first | 1 | luxurious |

### Baby Shower (22 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| boy | 2 | modern, soft |
| boy-classic | 1 | classic |
| boy-modern | 1 | modern |
| girl | 2 | romantic |
| girl-classic | 1 | romantic |
| girl-modern | 1 | modern |
| neutral | 2 | botanical, minimalist |
| neutral-boho | 1 | bohemian |
| safari | 2 | playful, whimsical |
| woodland | 2 | botanical, rustic |
| twins | 2 | playful, soft |
| storybook | 2 | vintage, whimsical |
| garden | 1 | floral |
| ocean | 1 | coastal |
| rainbow | 1 | colorful |

### Holiday (23 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| christmas | 4 | elegant, festive |
| christmas-classic | 1 | classic |
| christmas-modern | 1 | modern |
| christmas-rustic | 1 | rustic |
| newyear | 1 | luxurious |
| new-years | 1 | glamorous |
| easter | 2 | spring, whimsical |
| halloween | 2 | spooky, playful |
| thanksgiving | 2 | autumn, rustic |
| valentines | 2 | romantic |
| 4th-july | 1 | classic |
| fourth-july | 1 | patriotic |
| hanukkah | 2 | elegant |
| diwali | 1 | colorful |
| lunar-new-year | 1 | festive |

### Graduation (18 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| college | 4 | classic, elegant, modern |
| highschool | 4 | classic, modern |
| masters | 2 | elegant, luxurious |
| phd | 2 | elegant, luxurious |
| medical | 2 | classic |
| law | 2 | elegant, formal |
| elementary | 1 | playful |
| middle-school | 1 | modern |

### Corporate (14 templates)
| Subcategory | Count | Styles |
|-------------|-------|--------|
| conference | 1 | modern |
| gala | 2 | luxurious |
| awards | 2 | elegant |
| networking | 1 | minimalist |
| seminar | 1 | professional |
| team-building | 1 | playful |
| holiday-party | 1 | festive |
| launch-party | 1 | bold |
| formal | 2 | minimalist |
| modern | 1 | modern |
| launch | 1 | modern |

### Other Categories
| Category | Count | Notes |
|----------|-------|-------|
| Bridal Shower | 14 | tea-party, garden, brunch, beach, spa, etc. |
| Engagement | 11 | party, classic, modern, garden, formal, etc. |
| Dinner Party | 11 | formal, cocktail, garden, elegant, wine, etc. |
| Kids Party | 12 | princess, superhero, unicorn, dinosaur, etc. |
| Religious | 9 | baptism, communion, confirmation, bar-mitzvah, etc. |
| Retirement | 6 | classic, celebration, beach, golf, travel |
| Housewarming | 5 | modern, garden, classic, rustic |
| Reunion | 3 | family, class, military |
| Seasonal | 1 | spring |
| Sports | 1 | championship |

---

## Section 3: Asset Protection

### 3.1 Current Protection Measures

| Protection | Status | Implementation |
|------------|--------|----------------|
| S3 Bucket Policy | Active | Private by default |
| Presigned URLs | Active | Time-limited access |
| Watermarking | Pending | To be implemented |
| Hotlink Prevention | Pending | CloudFront/S3 policy |
| Right-click Disable | Pending | Frontend JS |
| Canvas Rendering | Pending | Prevent direct download |

### 3.2 Recommended Protection Stack

1. **Invisible Watermarks** - Embed ownership data in image metadata
2. **Visible Watermarks** - Light branding on preview images
3. **Hotlink Prevention** - S3 bucket policy + CloudFront
4. **Canvas Rendering** - Render templates on canvas, not <img>
5. **Rate Limiting** - Prevent bulk downloads
6. **User Authentication** - Require login for high-res
7. **Legal Protection** - Terms of Service + DMCA

---

## Section 4: Backup Schedule

| Backup Type | Frequency | Location | Retention |
|-------------|-----------|----------|-----------|
| AWS S3 (Primary) | Real-time | us-east-1 | Indefinite |
| Local Primary | Weekly | templates-local/ | Latest |
| Local Backup | Weekly | templates-backup/ | Latest |
| ZIP Archive | Weekly | templates-backup/*.zip | 4 versions |
| Off-site | Monthly | External drive/cloud | 12 months |

### Backup Commands

```bash
# Download all templates from S3
aws s3 sync s3://invitegenerator-templates-983101357971/templates/ ./templates-local/

# Create backup copy
xcopy /E /I /Y templates-local templates-backup\templates

# Create ZIP archive (PowerShell)
Compress-Archive -Path templates-local\* -DestinationPath templates-backup\templates-all.zip -Force
```

---

## Section 5: Audit Log

| Date | Action | By | Notes |
|------|--------|-----|-------|
| 2025-12-09 | Initial upload | AI Generation | 298 templates created |
| 2025-12-10 | S3 organization | System | Folder structure created |
| 2025-12-18 | Full audit | Claude | Inventory created, 298 confirmed |
| 2025-12-18 | Local backup | Claude | Downloaded to local + ZIP |

---

## Section 6: Quick Reference Commands

```bash
# Count templates in S3
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | wc -l

# Count by category
aws s3 ls s3://invitegenerator-templates-983101357971/templates/ --recursive | grep "_full.png" | awk -F'/' '{print $2}' | sort | uniq -c

# List all buckets
aws s3 ls

# Check bucket size
aws s3 ls s3://invitegenerator-templates-983101357971/ --recursive --summarize | tail -2

# Download single category
aws s3 sync s3://invitegenerator-templates-983101357971/templates/wedding/ ./templates-local/wedding/

# Upload new templates
aws s3 sync ./new-templates/ s3://invitegenerator-templates-983101357971/templates/ --acl private
```

---

## Section 7: Related Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| AI_CONTEXT.md | Project overview + API keys | Same directory |
| TEMPLATE_INVENTORY.md | Template spreadsheet | Same directory |
| TEMPLATE_GENERATION_PROMPTS.md | Prompts for new templates | Same directory |
| MARKETING_LAUNCH_PLAN.md | Marketing strategy | Same directory |

---

## Section 8: Emergency Procedures

### If Templates Are Deleted
1. Check S3 versioning (if enabled)
2. Restore from local backup: `templates-backup/`
3. Restore from ZIP: `templates-backup/templates-all.zip`
4. Contact AWS support if needed

### If Templates Are Stolen
1. Document the theft (screenshots, URLs)
2. Send DMCA takedown notice
3. Check watermark/metadata for proof
4. Update protection measures
5. Consider legal action

---

*This registry must be updated whenever templates are added, modified, or backed up.*
