# ShasthoCare Product Catalog Enrichment Pack

This pack preserves the 41 seeded product IDs/names/prices and adds polished catalog descriptions plus one matching fictional-branded product image per product. Images are designed for the demo brands in the seed data, avoiding mismatched real-brand packaging.

## Installation

1. Copy the `uploads/products/` folder into the location served by your backend at `/uploads/products/`.
2. Run `catalog_enrichment.sql` after your existing `schema.sql` + `seed.sql`.
3. If your backend serves uploads from a different URL, replace `/uploads/products/` in the SQL before running it.

## 1. Paracetamol 500 mg Tablet

- **Brand:** CarePlus
- **Generic / type:** Paracetamol
- **Strength / variant:** 500 mg
- **Pack:** 10 tablets
- **Category:** Medicine
- **Image:** `/uploads/products/01-paracetamol-500-mg-tablet.png`

**Short description:** Fast, familiar pharmacy essential for fever and mild-to-moderate pain relief labeling.

**Full description:** Paracetamol 500 mg tablets are presented as a straightforward everyday analgesic and antipyretic option. This listing focuses on clear pack information, strength, storage and safety notes so customers can identify the product correctly before purchase.

**Ingredients:** Paracetamol 500 mg per tablet. Excipients vary by manufacturer.

**Usage:** Use only according to the package label or the advice of a qualified healthcare professional. Check the label carefully before combining with other cold, flu or pain products.

**Warnings:** Do not exceed the labeled dose. Avoid accidental duplication with other products containing paracetamol/acetaminophen. Seek professional advice for liver disease, persistent symptoms, pregnancy, or use in children.

**Storage:** Store below 30°C in a dry place, protected from direct light and out of reach of children.

## 2. Oral Rehydration Salts Sachet

- **Brand:** MediNova
- **Generic / type:** Oral rehydration salts
- **Strength / variant:** WHO-style electrolyte blend
- **Pack:** 10 sachets
- **Category:** Medicine
- **Image:** `/uploads/products/02-oral-rehydration-salts-sachet.png`

**Short description:** Convenient electrolyte powder sachets intended for preparation with the correct amount of safe drinking water.

**Full description:** Oral Rehydration Salts are formulated to replace water and electrolytes lost during dehydration. Each sachet should be prepared exactly according to the pack directions, making this product suitable for home first-aid and travel kits.

**Ingredients:** Glucose and balanced electrolytes in dry powder form. Exact composition should follow the manufacturer label.

**Usage:** Dissolve one sachet only in the volume of safe drinking water stated on the pack. Use the prepared solution within the period specified by the manufacturer.

**Warnings:** Incorrect dilution can make the solution unsuitable. Seek medical care for severe dehydration, persistent vomiting, blood in stool, reduced consciousness, or other concerning symptoms.

**Storage:** Keep unopened sachets sealed in a cool, dry place away from moisture. Follow the label for storage of prepared solution.

## 3. Antacid Chewable Tablet

- **Brand:** Vitalis
- **Generic / type:** Calcium carbonate blend
- **Strength / variant:** Chewable tablet
- **Pack:** 20 tablets
- **Category:** Medicine
- **Image:** `/uploads/products/03-antacid-chewable-tablet.png`

**Short description:** Chewable antacid tablets for occasional acid-related discomfort, presented with clear label-led use guidance.

**Full description:** These chewable antacid tablets contain a calcium-carbonate-based blend designed for short-term, occasional relief labeling. The compact pack is convenient for home, office or travel use.

**Ingredients:** Calcium-carbonate-based antacid blend with standard tablet excipients.

**Usage:** Chew and use only as directed on the package. Leave appropriate spacing from other medicines when the label or healthcare professional advises it.

**Warnings:** Persistent or frequent symptoms require professional assessment. Ask a healthcare professional about suitability if you have kidney disease, are pregnant, or take regular medicines.

**Storage:** Store in a dry place below 30°C with the container tightly closed.

## 4. Allergy Relief Tablet 10 mg

- **Brand:** PureDerm
- **Generic / type:** Cetirizine hydrochloride
- **Strength / variant:** 10 mg
- **Pack:** 10 tablets
- **Category:** Medicine
- **Image:** `/uploads/products/04-allergy-relief-tablet-10-mg.png`

**Short description:** Once-daily style antihistamine tablet listing for common allergy-symptom management under label guidance.

**Full description:** Allergy Relief Tablet 10 mg contains cetirizine hydrochloride, a commonly used antihistamine ingredient. The listing highlights strength, pack size and important drowsiness precautions for safe product identification.

**Ingredients:** Cetirizine hydrochloride 10 mg per tablet, plus standard excipients.

**Usage:** Use according to the product label or clinician advice. Take only the labeled amount and review age restrictions on the pack.

**Warnings:** May cause drowsiness in some people. Avoid driving or tasks requiring alertness until you know how it affects you. Ask a professional about use with sedating medicines, kidney disease, pregnancy or breastfeeding.

**Storage:** Store below 30°C, protected from moisture and light.

## 5. Prescription Antibiotic Demo 500 mg

- **Brand:** BabyNest
- **Generic / type:** Demo antibiotic ingredient
- **Strength / variant:** 500 mg
- **Pack:** 14 capsules
- **Category:** Prescription Medicine
- **Image:** `/uploads/products/05-prescription-antibiotic-demo-500-mg.png`

**Short description:** Prescription-only fictional antibiotic product retained for testing prescription approval and checkout controls.

**Full description:** This product is intentionally fictional and should remain clearly marked as a prescription-workflow demo item. It exists to test prescription upload, pharmacist review, restricted checkout and order-status handling without representing a real medicine.

**Ingredients:** Fictional demonstration antibiotic ingredient, 500 mg per capsule.

**Usage:** Prescription required. Use only as prescribed in a real-world implementation; for this demo item, no treatment use should be inferred.

**Warnings:** Do not use this fictional listing for treatment decisions. Replace it with a legally sourced, licensed product record before any production pharmacy deployment.

**Storage:** Store as directed by the dispensing label in a production implementation and keep away from children.

## 6. Vitamin C 1000 mg Effervescent

- **Brand:** HealthTrack
- **Generic / type:** Ascorbic acid
- **Strength / variant:** 1000 mg
- **Pack:** 20 tablets
- **Category:** Supplement
- **Image:** `/uploads/products/06-vitamin-c-1000-mg-effervescent.png`

**Short description:** High-strength effervescent vitamin C supplement presented in a convenient tube format.

**Full description:** Vitamin C 1000 mg Effervescent is designed for users who prefer a drinkable supplement format. The tablet dissolves in water to create an easy-to-take beverage while the catalog clearly displays strength, pack size and safety guidance.

**Ingredients:** Ascorbic acid with an effervescent base. Exact flavorings and excipients vary by manufacturer.

**Usage:** Dissolve and use according to the supplement label. Consider total vitamin C intake from food and other supplements.

**Warnings:** Supplements do not replace a balanced diet. Ask a healthcare professional about high-dose use if you have kidney problems, recurrent kidney stones, pregnancy, or take regular medicines.

**Storage:** Keep the tube tightly closed in a cool, dry place away from moisture.

## 7. Vitamin D3 2000 IU Softgel

- **Brand:** NutriWell
- **Generic / type:** Cholecalciferol
- **Strength / variant:** 2000 IU
- **Pack:** 30 softgels
- **Category:** Supplement
- **Image:** `/uploads/products/07-vitamin-d3-2000-iu-softgel.png`

**Short description:** Compact softgel vitamin D3 supplement with clear strength and pack information.

**Full description:** Vitamin D3 2000 IU Softgel provides cholecalciferol in an easy-to-swallow softgel format. It is positioned as a dietary supplement and should be used with attention to total vitamin D intake from all sources.

**Ingredients:** Cholecalciferol (vitamin D3) in a softgel carrier with excipients.

**Usage:** Use only as directed on the label or by a healthcare professional, especially when combining with other vitamin D products.

**Warnings:** Avoid excessive vitamin D intake. Seek professional advice if you have high calcium levels, kidney disease, sarcoidosis, pregnancy, or use medicines that affect calcium or vitamin D.

**Storage:** Store in a cool, dry place away from direct sunlight.

## 8. Calcium + Vitamin D3 Tablet

- **Brand:** SafeAid
- **Generic / type:** Calcium carbonate + cholecalciferol
- **Strength / variant:** Calcium/D3 blend
- **Pack:** 30 tablets
- **Category:** Supplement
- **Image:** `/uploads/products/08-calcium-plus-vitamin-d3-tablet.png`

**Short description:** Combined calcium and vitamin D3 supplement for convenient daily nutritional support.

**Full description:** Calcium + Vitamin D3 Tablet combines two commonly paired nutrients in a simple tablet format. The product page emphasizes responsible supplement use, interaction awareness and clear storage instructions.

**Ingredients:** Calcium carbonate with cholecalciferol (vitamin D3) and standard tablet excipients.

**Usage:** Take according to the package label or a healthcare professional recommendation.

**Warnings:** Calcium may interact with thyroid medicines and some antibiotics. Seek professional advice if you have kidney disease, kidney stones, high calcium levels, pregnancy, or take regular medication.

**Storage:** Keep in a cool, dry place with the container tightly closed.

## 9. Omega-3 Fish Oil 1000 mg

- **Brand:** GlowCare
- **Generic / type:** Fish oil concentrate
- **Strength / variant:** 1000 mg
- **Pack:** 60 softgels
- **Category:** Supplement
- **Image:** `/uploads/products/09-omega-3-fish-oil-1000-mg.png`

**Short description:** Fish-oil softgel supplement with clearly stated strength and pack size.

**Full description:** Omega-3 Fish Oil 1000 mg is a softgel-format dietary supplement based on fish-oil concentrate. The listing keeps claims conservative and provides clear allergen and bleeding-risk cautions.

**Ingredients:** Fish oil concentrate containing omega-3 fatty acids. Exact EPA/DHA amounts should match the final manufacturer label.

**Usage:** Use according to the label, preferably with food if recommended by the manufacturer.

**Warnings:** Ask a healthcare professional before use if you take anticoagulants or antiplatelet medicines, have a bleeding disorder, are preparing for surgery, or have a fish allergy.

**Storage:** Store tightly closed away from heat, moisture and direct light.

## 10. Zinc 20 mg Tablet

- **Brand:** HomeMed
- **Generic / type:** Zinc
- **Strength / variant:** 20 mg
- **Pack:** 30 tablets
- **Category:** Supplement
- **Image:** `/uploads/products/10-zinc-20-mg-tablet.png`

**Short description:** 20 mg zinc supplement in a practical daily tablet format.

**Full description:** Zinc 20 mg Tablet is a nutritional supplement listing designed around clear strength, pack and safety information. It should be used only within the labeled serving guidance and total dietary intake considered.

**Ingredients:** Zinc salt providing 20 mg elemental zinc per labeled serving, plus excipients.

**Usage:** Follow the supplement label and avoid unnecessary duplication with other zinc-containing products.

**Warnings:** Long-term high-dose zinc can cause adverse effects and may affect copper status. Ask a healthcare professional about prolonged use, pregnancy, chronic illness or medicine interactions.

**Storage:** Store below 30°C in a dry place.

## 11. Daily Multivitamin

- **Brand:** CarePlus
- **Generic / type:** Multivitamin and mineral blend
- **Strength / variant:** Multi-nutrient
- **Pack:** 30 tablets
- **Category:** Supplement
- **Image:** `/uploads/products/11-daily-multivitamin.png`

**Short description:** Balanced everyday multivitamin and mineral blend for general dietary supplementation.

**Full description:** Daily Multivitamin combines a range of commonly used vitamins and minerals in a convenient tablet format. The catalog avoids therapeutic claims and focuses on responsible supplement use alongside a balanced diet.

**Ingredients:** Blend of vitamins and minerals as listed on the final package label.

**Usage:** Use according to the nutrition label and avoid unnecessary duplication with other supplements.

**Warnings:** Not a substitute for a balanced diet. Discuss use with a healthcare professional if pregnant, breastfeeding, managing chronic illness, or using long-term medicines.

**Storage:** Keep sealed in a cool, dry place away from direct sunlight.

## 12. Gentle Skin Cleanser 250 ml

- **Brand:** MediNova
- **Generic / type:** Non-soap cleansing base
- **Strength / variant:** Fragrance-light formula
- **Pack:** 250 ml bottle
- **Category:** Personal Care
- **Image:** `/uploads/products/12-gentle-skin-cleanser-250-ml.png`

**Short description:** Mild non-soap cleanser designed for gentle everyday face and body cleansing.

**Full description:** Gentle Skin Cleanser 250 ml is a fragrance-light personal-care cleanser intended for routine use on normal or sensitive-feeling skin. The pump-style bottle is convenient for bathroom or bedside use.

**Ingredients:** Mild surfactant and moisturizing cleansing base. Exact ingredients should match the final cosmetic label.

**Usage:** Apply externally to wet or dry skin as directed, gently cleanse and rinse well.

**Warnings:** For external use only. Avoid direct eye contact and stop use if persistent irritation or rash occurs.

**Storage:** Store at room temperature with the cap or pump closed.

## 13. Alcohol Hand Sanitizer 200 ml

- **Brand:** Vitalis
- **Generic / type:** Alcohol hand rub
- **Strength / variant:** 70% alcohol demo label
- **Pack:** 200 ml bottle
- **Category:** Personal Care
- **Image:** `/uploads/products/13-alcohol-hand-sanitizer-200-ml.png`

**Short description:** Portable alcohol-based hand sanitizer in a convenient 200 ml bottle.

**Full description:** Alcohol Hand Sanitizer 200 ml is designed for hand hygiene when soap and water are not readily available. The listing clearly flags flammability and external-use precautions.

**Ingredients:** Alcohol-based hand cleansing gel with humectants. Final alcohol concentration must match the product label.

**Usage:** Apply to hands according to the label and rub until dry.

**Warnings:** Flammable. Keep away from flame, heat, eyes and children. For external use only. Do not ingest.

**Storage:** Keep tightly closed and store away from heat and ignition sources.

## 14. Sensitive Toothpaste 100 g

- **Brand:** PureDerm
- **Generic / type:** Desensitizing toothpaste
- **Strength / variant:** Daily use formula
- **Pack:** 100 g tube
- **Category:** Personal Care
- **Image:** `/uploads/products/14-sensitive-toothpaste-100-g.png`

**Short description:** Daily-use toothpaste formulated for sensitive teeth and routine oral hygiene.

**Full description:** Sensitive Toothpaste 100 g combines everyday cleaning with a desensitizing active ingredient as specified on the final label. The tube format is suitable for routine home use.

**Ingredients:** Tooth-cleaning base with a desensitizing active ingredient as labeled.

**Usage:** Brush according to dental guidance and the package directions.

**Warnings:** Do not swallow. Persistent sensitivity, tooth pain, bleeding gums or swelling should be assessed by a dental professional.

**Storage:** Keep capped at room temperature and protect from excessive heat.

## 15. Mild Body Wash 300 ml

- **Brand:** BabyNest
- **Generic / type:** Gentle body cleansing base
- **Strength / variant:** Mild formula
- **Pack:** 300 ml bottle
- **Category:** Personal Care
- **Image:** `/uploads/products/15-mild-body-wash-300-ml.png`

**Short description:** Gentle daily body wash with a mild cleansing base for routine bathing.

**Full description:** Mild Body Wash 300 ml is a simple everyday cleanser designed for comfortable, routine body cleansing. The bottle format works well for family bathrooms and shower use.

**Ingredients:** Mild cleansing agents and skin-conditioning ingredients.

**Usage:** Apply externally to wet skin, lather gently and rinse thoroughly.

**Warnings:** Avoid eye contact. Discontinue use if persistent irritation or rash develops.

**Storage:** Store at room temperature away from direct sunlight.

## 16. Baby Moisturizing Lotion 200 ml

- **Brand:** HealthTrack
- **Generic / type:** Baby emollient lotion
- **Strength / variant:** Gentle formula
- **Pack:** 200 ml bottle
- **Category:** Baby Care
- **Image:** `/uploads/products/16-baby-moisturizing-lotion-200-ml.png`

**Short description:** Gentle baby lotion for routine moisturization of delicate skin.

**Full description:** Baby Moisturizing Lotion 200 ml is an emollient-based skincare product intended for everyday external use on delicate skin. The product page emphasizes gentle use, patch awareness and careful storage.

**Ingredients:** Emollient and moisturizing base formulated for delicate skin.

**Usage:** Apply externally as directed on the label to clean, dry skin.

**Warnings:** Avoid broken skin and eyes. Stop use if irritation or rash develops. Seek professional advice for persistent skin problems in infants.

**Storage:** Keep closed at room temperature and away from direct heat or sunlight.

## 17. Baby Shampoo 200 ml

- **Brand:** NutriWell
- **Generic / type:** Mild baby shampoo base
- **Strength / variant:** Tear-minimized formula
- **Pack:** 200 ml bottle
- **Category:** Baby Care
- **Image:** `/uploads/products/17-baby-shampoo-200-ml.png`

**Short description:** Mild baby shampoo for gentle routine hair and scalp cleansing.

**Full description:** Baby Shampoo 200 ml uses a gentle cleansing base intended for routine baby hair washing. The listing keeps instructions simple and highlights adult supervision.

**Ingredients:** Mild cleansing surfactants formulated for baby hair and scalp.

**Usage:** Use a small amount externally, lather gently and rinse thoroughly according to the label.

**Warnings:** Adult supervision required. Avoid direct eye contact and stop use if persistent irritation develops.

**Storage:** Store upright with the cap closed at room temperature.

## 18. Baby Diapers Medium 32 pcs

- **Brand:** SafeAid
- **Generic / type:** Disposable absorbent diaper
- **Strength / variant:** Medium
- **Pack:** 32 pieces
- **Category:** Baby Care
- **Image:** `/uploads/products/18-baby-diapers-medium-32-pcs.png`

**Short description:** Soft disposable baby diapers with absorbent core and flexible fit.

**Full description:** Baby Diapers Medium 32 pcs are designed for routine diapering with an absorbent core, soft inner layer and elastic side fit. Size suitability should be checked against the final pack guidance.

**Ingredients:** Absorbent core, soft inner layer, elastic side panels and fastening materials.

**Usage:** Change regularly and select the correct size and fit for the child.

**Warnings:** Stop use if persistent skin irritation develops. Keep plastic packaging and loose materials away from children.

**Storage:** Store in a clean, dry place away from humidity and direct sunlight.

## 19. Digital Blood Pressure Monitor

- **Brand:** GlowCare
- **Generic / type:** Automatic upper-arm BP monitor
- **Strength / variant:** Digital
- **Pack:** 1 device + cuff
- **Category:** Medical Device
- **Image:** `/uploads/products/19-digital-blood-pressure-monitor.png`

**Short description:** Automatic upper-arm blood pressure monitor with digital display for home measurement.

**Full description:** Digital Blood Pressure Monitor is a home-use device with an automatic cuff and display. The product listing stresses correct cuff placement, rest before measurement and the importance of professional assessment when readings or symptoms are concerning.

**Ingredients:** Electronic monitor, reusable upper-arm cuff and accessories.

**Usage:** Follow the device manual for cuff size, placement, posture, rest period and repeated measurements.

**Warnings:** Home readings do not replace professional assessment. Seek urgent care for concerning symptoms regardless of a single device reading. Keep the device calibrated and maintained as instructed.

**Storage:** Store dry, clean and protected from impact, moisture and extreme temperatures.

## 20. Digital Glucose Meter Kit

- **Brand:** HomeMed
- **Generic / type:** Blood glucose monitoring system
- **Strength / variant:** Digital
- **Pack:** Meter + starter accessories
- **Category:** Medical Device
- **Image:** `/uploads/products/20-digital-glucose-meter-kit.png`

**Short description:** Compact blood glucose meter starter kit for compatible test-strip monitoring.

**Full description:** Digital Glucose Meter Kit provides a meter and starter accessories for home glucose monitoring when recommended. Accurate use depends on compatible strips, correct sampling technique and adherence to the device manual.

**Ingredients:** Electronic glucose meter with compatible test-strip system and starter accessories.

**Usage:** Use only with compatible strips and follow the manual for setup, sampling, coding or calibration requirements.

**Warnings:** Unexpected or very abnormal readings should be rechecked and discussed with a healthcare professional. Do not change treatment solely on an unexpected reading without appropriate guidance.

**Storage:** Keep the meter and strips dry and within the temperature and humidity range stated by the manufacturer.

## 21. Pulse Oximeter

- **Brand:** CarePlus
- **Generic / type:** Fingertip pulse oximeter
- **Strength / variant:** SpO2/PR display
- **Pack:** 1 device
- **Category:** Medical Device
- **Image:** `/uploads/products/21-pulse-oximeter.png`

**Short description:** Portable fingertip pulse oximeter for spot SpO2 and pulse-rate readings.

**Full description:** Pulse Oximeter is a compact fingertip device intended for spot measurements. The listing explains that motion, circulation, temperature and other factors can affect results, so symptoms and clinical context remain important.

**Ingredients:** Optical fingertip sensor, digital display and electronic components.

**Usage:** Use according to the manual with the hand warm and still, allowing the reading to stabilize.

**Warnings:** Readings can be affected by motion, poor circulation, nail products, skin temperature and device limitations. Seek medical attention for concerning symptoms rather than relying on a single reading.

**Storage:** Store dry and clean; remove batteries for long storage when the manual recommends it.

## 22. Digital Thermometer

- **Brand:** MediNova
- **Generic / type:** Digital clinical thermometer
- **Strength / variant:** Digital
- **Pack:** 1 thermometer
- **Category:** Medical Device
- **Image:** `/uploads/products/22-digital-thermometer.png`

**Short description:** Reusable digital thermometer for routine temperature measurement.

**Full description:** Digital Thermometer is a compact reusable device for checking body temperature at the measurement sites supported by the product manual. The listing emphasizes correct cleaning and technique.

**Ingredients:** Electronic temperature sensor, display and housing.

**Usage:** Follow the manual for measurement site, timing, cleaning and disinfection.

**Warnings:** Temperature is only one part of illness assessment. Seek professional care for concerning symptoms, very young infants, high-risk patients or persistent fever.

**Storage:** Keep clean, dry and protected from impact and extreme heat.

## 23. Nebulizer Machine

- **Brand:** Vitalis
- **Generic / type:** Compressor nebulizer
- **Strength / variant:** Home compressor
- **Pack:** Machine + mask/tubing kit
- **Category:** Medical Device
- **Image:** `/uploads/products/23-nebulizer-machine.png`

**Short description:** Home compressor nebulizer set with mask, tubing and medication cup.

**Full description:** Nebulizer Machine is a compressor-style device intended for medicines or saline that are specifically suitable for nebulization. Good cleaning and correct assembly are important for reliable use.

**Ingredients:** Compressor unit, medication cup, tubing, mask and related accessories.

**Usage:** Use only with solutions intended for nebulization and follow both the device manual and prescription instructions.

**Warnings:** Do not put oils or unapproved liquids into the nebulizer. Clean and dry reusable parts carefully to reduce contamination risk.

**Storage:** Store clean and dry with tubing and accessories protected from dust and contamination.

## 24. First Aid Kit 24 Pieces

- **Brand:** PureDerm
- **Generic / type:** Basic first aid supplies
- **Strength / variant:** 24-piece
- **Pack:** 1 kit
- **Category:** First Aid
- **Image:** `/uploads/products/24-first-aid-kit-24-pieces.png`

**Short description:** Compact 24-piece first-aid set for minor everyday injuries and household preparedness.

**Full description:** First Aid Kit 24 Pieces brings together common dressings and basic accessories in one portable case. It is designed for minor cuts and scrapes, while serious injuries still require appropriate medical care.

**Ingredients:** Assorted plasters, gauze, tape, wipes, gloves and basic first-aid accessories.

**Usage:** Use individual components according to their labels and replace items after use or expiry.

**Warnings:** Serious bleeding, deep wounds, burns, bites, suspected fractures or signs of infection require medical attention.

**Storage:** Keep the case clean, dry and accessible to responsible adults.

## 25. Sterile Gauze Pads 10 pcs

- **Brand:** BabyNest
- **Generic / type:** Sterile cotton gauze
- **Strength / variant:** 10 cm x 10 cm
- **Pack:** 10 sterile pads
- **Category:** First Aid
- **Image:** `/uploads/products/25-sterile-gauze-pads-10-pcs.png`

**Short description:** Individually packed sterile gauze pads for basic wound dressing and first-aid kits.

**Full description:** Sterile Gauze Pads 10 pcs provide individually packed woven gauze for clean wound coverage and dressing support. Sterility depends on intact packaging.

**Ingredients:** Sterile woven gauze pads.

**Usage:** Use clean technique and follow first-aid or clinician guidance for wound care.

**Warnings:** Do not use a pad if the sterile pack is damaged, wet or already opened. Seek medical attention for deep, heavily contaminated or infected wounds.

**Storage:** Keep unopened packs clean and dry, away from moisture.

## 26. Elastic Crepe Bandage

- **Brand:** HealthTrack
- **Generic / type:** Elastic support bandage
- **Strength / variant:** 10 cm width
- **Pack:** 1 roll
- **Category:** First Aid
- **Image:** `/uploads/products/26-elastic-crepe-bandage.png`

**Short description:** Reusable elastic crepe bandage for general support, compression and first-aid use.

**Full description:** Elastic Crepe Bandage is a flexible wrap designed for general support applications. Correct tension is important to avoid restricting circulation.

**Ingredients:** Stretch cotton-blend support bandage.

**Usage:** Wrap with comfortable, even support and secure as instructed on the pack.

**Warnings:** Loosen immediately if numbness, tingling, worsening pain, discoloration, coldness or swelling occurs below the bandage.

**Storage:** Wash and dry according to the label, then store fully dry in a clean place.

## 27. Antiseptic Solution 100 ml

- **Brand:** NutriWell
- **Generic / type:** Topical antiseptic solution
- **Strength / variant:** Demo topical formula
- **Pack:** 100 ml bottle
- **Category:** First Aid
- **Image:** `/uploads/products/27-antiseptic-solution-100-ml.png`

**Short description:** External antiseptic solution for minor first-aid use according to the final product label.

**Full description:** Antiseptic Solution 100 ml is an external-use first-aid product intended for minor skin cleansing or antiseptic use when the final formulation and label support it.

**Ingredients:** Topical antiseptic active ingredient in a liquid base as specified on the final product label.

**Usage:** Use externally only and follow any dilution and application directions printed on the pack.

**Warnings:** Avoid eyes, mouth and large or deep wounds unless professionally directed. Stop use if significant irritation occurs.

**Storage:** Keep closed, upright and away from direct heat and light.

## 28. SPF 50 Broad Spectrum Sunscreen

- **Brand:** SafeAid
- **Generic / type:** Broad-spectrum sunscreen
- **Strength / variant:** SPF 50
- **Pack:** 50 g tube
- **Category:** Skin Care
- **Image:** `/uploads/products/28-spf-50-broad-spectrum-sunscreen.png`

**Short description:** High-SPF broad-spectrum sunscreen in a convenient 50 g tube.

**Full description:** SPF 50 Broad Spectrum Sunscreen is designed as part of a daily sun-protection routine. The compact tube is suitable for bags and travel while the listing reminds users to reapply according to the pack directions.

**Ingredients:** Broad-spectrum UV filters in a moisturizing cream base. Exact actives should match the final label.

**Usage:** Apply generously according to the label before sun exposure and reapply as directed, especially after sweating, swimming or towel drying.

**Warnings:** For external use only. Sunscreen is one part of sun protection; clothing, shade and limiting intense sun exposure are also important.

**Storage:** Store below 30°C away from direct sunlight and excessive heat.

## 29. Moisturizing Cream 100 g

- **Brand:** GlowCare
- **Generic / type:** Emollient moisturizer
- **Strength / variant:** Barrier-support formula
- **Pack:** 100 g jar
- **Category:** Skin Care
- **Image:** `/uploads/products/29-moisturizing-cream-100-g.png`

**Short description:** Rich everyday moisturizing cream for dry or normal skin.

**Full description:** Moisturizing Cream 100 g combines emollient, humectant and occlusive-style ingredients in a jar format for daily skincare. It is positioned as a cosmetic moisturizer without therapeutic claims.

**Ingredients:** Emollients, humectants and occlusive moisturizing ingredients as listed on the final label.

**Usage:** Apply externally to clean skin as needed according to the product label.

**Warnings:** Avoid known allergens and discontinue if persistent irritation, swelling or rash occurs.

**Storage:** Keep the jar closed at room temperature and avoid contamination of the product.

## 30. Acne Care Face Wash 100 ml

- **Brand:** HomeMed
- **Generic / type:** Cleansing face wash
- **Strength / variant:** Oil-control formula
- **Pack:** 100 ml tube
- **Category:** Skin Care
- **Image:** `/uploads/products/30-acne-care-face-wash-100-ml.png`

**Short description:** Oil-control face cleanser formulated for acne-prone or oily skin.

**Full description:** Acne Care Face Wash 100 ml is a rinse-off facial cleanser intended for regular cleansing of oily or acne-prone skin. The final active ingredient and frequency should follow the actual product label.

**Ingredients:** Cleansing base with an acne-care active ingredient as specified on the final label.

**Usage:** Use externally according to the label, avoiding over-cleansing or aggressive scrubbing.

**Warnings:** Avoid eyes and broken skin. Persistent, painful or severe acne may need assessment by a healthcare professional.

**Storage:** Store at room temperature with the cap closed.

## 31. Hair Nutrition Serum 60 ml

- **Brand:** CarePlus
- **Generic / type:** Cosmetic hair serum
- **Strength / variant:** Leave-in formula
- **Pack:** 60 ml bottle
- **Category:** Hair Care
- **Image:** `/uploads/products/31-hair-nutrition-serum-60-ml.png`

**Short description:** Lightweight leave-in hair serum designed for conditioning, smoothness and shine.

**Full description:** Hair Nutrition Serum 60 ml is a cosmetic leave-in product designed to improve the feel and appearance of hair. The compact bottle works well for daily grooming and travel.

**Ingredients:** Cosmetic conditioning oils, silicones and vitamins as specified on the final label.

**Usage:** Apply a small amount to hair according to the label, focusing on lengths and ends if directed.

**Warnings:** External use only. Avoid eye contact and discontinue if scalp irritation occurs.

**Storage:** Keep capped away from heat and direct sunlight.

## 32. Nutrition Drink Vanilla 400 g

- **Brand:** MediNova
- **Generic / type:** Balanced nutrition powder
- **Strength / variant:** Vanilla
- **Pack:** 400 g tin
- **Category:** Nutrition
- **Image:** `/uploads/products/32-nutrition-drink-vanilla-400-g.png`

**Short description:** Vanilla-flavoured powdered nutrition drink for general dietary supplementation.

**Full description:** Nutrition Drink Vanilla 400 g is a powdered beverage mix containing macronutrients and micronutrients according to the final nutrition label. It is suitable for users seeking a convenient supplemental drink format.

**Ingredients:** Protein, carbohydrate, fats, vitamins and minerals according to the nutrition label.

**Usage:** Prepare with safe water according to the label and consume within the recommended time after mixing.

**Warnings:** Not suitable as a sole source of nutrition unless specifically formulated and professionally recommended. Check allergens, sugar content and suitability for special diets.

**Storage:** Keep the tin tightly closed in a cool, dry place and use within the period stated after opening.

## 33. Protein Nutrition Powder 500 g

- **Brand:** Vitalis
- **Generic / type:** Protein blend
- **Strength / variant:** Chocolate
- **Pack:** 500 g pouch
- **Category:** Nutrition
- **Image:** `/uploads/products/33-protein-nutrition-powder-500-g.png`

**Short description:** Chocolate-flavoured protein powder for general dietary supplementation.

**Full description:** Protein Nutrition Powder 500 g provides a convenient powdered protein blend for users who want to supplement dietary protein intake. The listing avoids performance or disease claims and focuses on label-led use.

**Ingredients:** Milk- and/or plant-protein blend with flavouring and micronutrients as specified on the final label.

**Usage:** Mix and use according to the nutrition label and overall dietary needs.

**Warnings:** Check milk, soy, nut and other allergen information. People with kidney disease or medically restricted diets should seek professional advice before high-protein supplementation.

**Storage:** Seal the pouch after opening and store in a cool, dry place.

## 34. Electrolyte Drink Powder

- **Brand:** PureDerm
- **Generic / type:** Electrolyte beverage mix
- **Strength / variant:** Lemon flavor
- **Pack:** 10 sachets
- **Category:** Nutrition
- **Image:** `/uploads/products/34-electrolyte-drink-powder.png`

**Short description:** Lemon-flavoured electrolyte drink powder in convenient single-use sachets.

**Full description:** Electrolyte Drink Powder is a beverage mix designed for convenient hydration support. Each sachet should be mixed with the amount of water specified on the product label.

**Ingredients:** Carbohydrate and electrolyte beverage blend as listed on the final label.

**Usage:** Mix one sachet with the stated amount of safe drinking water and consume according to the label.

**Warnings:** People who need to restrict sugar, sodium or potassium should review the nutrition label and seek professional advice when appropriate.

**Storage:** Keep sachets sealed and dry, away from heat and moisture.

## 35. Iron + Folic Acid Tablet

- **Brand:** BabyNest
- **Generic / type:** Iron + folic acid
- **Strength / variant:** Nutritional blend
- **Pack:** 30 tablets
- **Category:** Supplement
- **Image:** `/uploads/products/35-iron-plus-folic-acid-tablet.png`

**Short description:** Iron and folic acid supplement in a convenient 30-tablet pack.

**Full description:** Iron + Folic Acid Tablet combines iron and folic acid in a simple supplement format. The listing emphasizes keeping iron away from children and using the product according to the labeled serving or professional advice.

**Ingredients:** Iron salt with folic acid and standard tablet excipients.

**Usage:** Use according to the package label or professional recommendation.

**Warnings:** Keep iron supplements out of reach of children because excess iron can be harmful. Ask a healthcare professional about use in pregnancy, anemia evaluation, chronic disease or medicine interactions.

**Storage:** Store dry below 30°C and away from children.

## 36. Probiotic Capsules

- **Brand:** HealthTrack
- **Generic / type:** Probiotic culture blend
- **Strength / variant:** Multi-strain blend
- **Pack:** 20 capsules
- **Category:** Supplement
- **Image:** `/uploads/products/36-probiotic-capsules.png`

**Short description:** Multi-strain probiotic capsule supplement for general digestive-wellness positioning.

**Full description:** Probiotic Capsules provide selected live cultures in a convenient capsule format. Because probiotic products vary by strain and storage needs, the exact label should guide use and handling.

**Ingredients:** Selected probiotic cultures with capsule excipients. Exact strains and CFU count should match the final label.

**Usage:** Follow the product label for timing, serving size and storage requirements.

**Warnings:** People who are severely immunocompromised, critically ill or under complex medical care should seek professional advice before probiotic use.

**Storage:** Store exactly as directed on the package; some formulations may require cool storage.

## 37. Saline Nasal Spray 30 ml

- **Brand:** NutriWell
- **Generic / type:** Isotonic saline
- **Strength / variant:** Isotonic
- **Pack:** 30 ml bottle
- **Category:** Healthcare Product
- **Image:** `/uploads/products/37-saline-nasal-spray-30-ml.png`

**Short description:** Non-medicated isotonic saline nasal spray for moisture and gentle rinsing.

**Full description:** Saline Nasal Spray 30 ml is a simple non-medicated saline product for nasal moisture and rinsing. The compact spray bottle supports hygienic individual use.

**Ingredients:** Sterile isotonic saline solution.

**Usage:** Use according to the label and keep the nozzle clean after use.

**Warnings:** Do not share the bottle. Seek professional advice for persistent symptoms or use after nasal injury or surgery unless already directed.

**Storage:** Store capped at room temperature and protect the nozzle from contamination.

## 38. Lubricating Eye Drops 10 ml

- **Brand:** SafeAid
- **Generic / type:** Ophthalmic lubricant
- **Strength / variant:** Lubricant formula
- **Pack:** 10 ml bottle
- **Category:** Healthcare Product
- **Image:** `/uploads/products/38-lubricating-eye-drops-10-ml.png`

**Short description:** Sterile lubricating eye drops for temporary dry-eye comfort according to the label.

**Full description:** Lubricating Eye Drops 10 ml provide a sterile ophthalmic lubricant in a small dropper bottle. The listing emphasizes dropper-tip hygiene and prompt assessment of concerning eye symptoms.

**Ingredients:** Ophthalmic lubricating ingredients in sterile solution.

**Usage:** Use only as labeled and avoid touching the dropper tip to the eye, fingers or other surfaces.

**Warnings:** Stop use and seek professional advice for significant eye pain, injury, discharge, sudden vision change, persistent redness or worsening symptoms.

**Storage:** Store as indicated on the pack and discard after the stated period following opening.

## 39. Pain Relief Gel 30 g

- **Brand:** GlowCare
- **Generic / type:** Topical analgesic gel
- **Strength / variant:** External use
- **Pack:** 30 g tube
- **Category:** Topical Product
- **Image:** `/uploads/products/39-pain-relief-gel-30-g.png`

**Short description:** External-use topical pain-relief gel in a convenient 30 g tube.

**Full description:** Pain Relief Gel 30 g is a topical product intended for external use according to the final active ingredients and label directions. The listing keeps claims conservative and highlights safe skin use.

**Ingredients:** Topical pain-relief active ingredients as stated on the final product label.

**Usage:** Apply externally only according to the package directions and wash hands after use when instructed.

**Warnings:** Do not apply to broken skin or near eyes. Review suitability with a healthcare professional if pregnant, allergic to anti-inflammatory medicines, or using similar topical products.

**Storage:** Keep the tube closed and store away from excessive heat.

## 40. Hot Water Bag 2 L

- **Brand:** HomeMed
- **Generic / type:** Reusable hot water bag
- **Strength / variant:** 2 litre
- **Pack:** 1 bag
- **Category:** First Aid
- **Image:** `/uploads/products/40-hot-water-bag-2-l.png`

**Short description:** Reusable 2 L hot water bag for non-medicated warm comfort.

**Full description:** Hot Water Bag 2 L is a reusable warming accessory intended for careful household use. Safe water temperature and leak checks are important to reduce burn risk.

**Ingredients:** Heat-resistant rubber or PVC bag with stopper, according to the final product specification.

**Usage:** Fill and use according to the product instructions, using water at a safe temperature and a protective cover when advised.

**Warnings:** Never use boiling water. Check for leaks or material damage before use and avoid prolonged direct skin contact, especially in children, older adults or people with reduced sensation.

**Storage:** Drain, dry and store away from sunlight, heat and sharp objects.

## 41. Glucose Test Strips 50 pcs

- **Brand:** CarePlus
- **Generic / type:** Compatible glucose test strips
- **Strength / variant:** Device-specific
- **Pack:** 50 strips
- **Category:** Medical Device
- **Image:** `/uploads/products/41-glucose-test-strips-50-pcs.png`

**Short description:** Single-use glucose test strips for a compatible meter system.

**Full description:** Glucose Test Strips 50 pcs are designed for use only with the matching glucose meter platform. Accurate readings depend on correct storage, unexpired strips and adherence to the meter instructions.

**Ingredients:** Electrochemical test strips compatible with the specified glucose meter system.

**Usage:** Use only with the matching meter and follow storage, coding or calibration and blood-sampling instructions.

**Warnings:** Expired, wet, damaged or incompatible strips can give unreliable results. Do not change treatment based solely on an unexpected reading without appropriate professional guidance.

**Storage:** Keep tightly closed in the original container and within the labeled temperature and humidity limits.
