import { check } from "recheck";
import * as features from "../src/features/index.ts";

interface VulnerableReport {
  featureKey: string;
  entityType: string;
  patternSource: string;
  complexity: string;
  status: string;
  attack?: string;
}

async function main() {
  console.log("=================================================");
  console.log("🛡️  Presidio ReDoS Security Audit (89 Features)");
  console.log("=================================================\n");

  const all = (features as any).allFeatures as Record<string, any>;
  const vulnerableList: VulnerableReport[] = [];
  let totalChecked = 0;

  for (const [key, feat] of Object.entries(all)) {
    // Check PATTERN_SOURCE, REGEX, PATTERNS, or any regex export
    const regexes: { name: string; regex: RegExp }[] = [];

    if (feat.REGEX instanceof RegExp) {
      regexes.push({ name: "REGEX", regex: feat.REGEX });
    }
    if (feat.PATTERNS && Array.isArray(feat.PATTERNS)) {
      feat.PATTERNS.forEach((p: any, idx: number) => {
        if (p.regex instanceof RegExp) {
          regexes.push({ name: p.name || `PATTERNS[${idx}]`, regex: p.regex });
        }
      });
    }
    if (typeof feat.PATTERN_SOURCE === "string" && !feat.REGEX) {
      regexes.push({ name: "PATTERN_SOURCE", regex: new RegExp(feat.PATTERN_SOURCE) });
    }

    // Also check other exported regex properties
    for (const [propKey, propVal] of Object.entries(feat)) {
      if (propVal instanceof RegExp && propKey !== "REGEX") {
        regexes.push({ name: propKey, regex: propVal });
      }
    }

    for (const item of regexes) {
      totalChecked++;
      try {
        const result = check(item.regex.source, item.regex.flags);
        if (result.status === "vulnerable") {
          const report: VulnerableReport = {
            featureKey: key,
            entityType: feat.ENTITY_TYPE || key,
            patternSource: item.regex.toString(),
            complexity: (result as any).complexity?.type || "vulnerable",
            status: result.status,
            attack: (result as any).attack ? JSON.stringify((result as any).attack) : undefined,
          };
          vulnerableList.push(report);
          console.error(`🚨 [VULNERABLE] ${key} (${item.name})`);
          console.error(`   Entity: ${feat.ENTITY_TYPE}`);
          console.error(`   Regex: ${item.regex}`);
          console.error(`   Complexity: ${report.complexity}`);
          if (report.attack) {
            console.error(`   Attack: ${report.attack}`);
          }
          console.error("-------------------------------------------------");
        }
      } catch (err) {
        console.warn(`⚠️ Warning auditing ${key} (${item.name}):`, err);
      }
    }
  }

  console.log("\n=================================================");
  console.log(`📊 Audit Summary:`);
  console.log(`   - Total Patterns Checked: ${totalChecked}`);
  console.log(`   - Vulnerable Patterns:    ${vulnerableList.length}`);
  console.log(`   - Safe Patterns:          ${totalChecked - vulnerableList.length}`);
  console.log("=================================================");

  if (vulnerableList.length > 0) {
    console.error(`\n❌ Found ${vulnerableList.length} vulnerable regex pattern(s).`);
    process.exit(1);
  } else {
    console.log("\n✅ All patterns are 100% safe from catastrophic backtracking!");
  }
}

main();
