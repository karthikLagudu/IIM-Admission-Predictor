import { Prisma, PrismaClient, SourceType } from "@prisma/client";
import { ACADEMIC_CATEGORY_LABELS } from "../src/lib/iima/academic-category";
import { IIMA_CAT_2025_POLICY } from "../src/lib/iima/constants";

const prisma = new PrismaClient();
const policy = IIMA_CAT_2025_POLICY;

function jsonSafe(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function metadata(key: keyof typeof policy.metadata) {
  const item = policy.metadata[key];
  return {
    effectiveYear: item.effectiveYear,
    source: item.source,
    sourceType: item.sourceType as SourceType,
    verifiedDate: new Date(`${item.verifiedDate}T00:00:00Z`),
    notes: item.notes,
  };
}

async function main() {
  await prisma.admissionCycle.updateMany({ data: { active: false } });
  const cycle = await prisma.admissionCycle.upsert({
    where: { policyVersion: policy.version },
    update: { config: jsonSafe(policy), active: true, ...metadata("eligibility") },
    create: {
      name: policy.admissionCycle,
      catYear: policy.catYear,
      policyVersion: policy.version,
      active: true,
      config: jsonSafe(policy),
      ...metadata("eligibility"),
    },
  });

  for (const [key, cutoff] of Object.entries(policy.catCutoffs)) {
    const pwd = key.startsWith("PWD_");
    const category = pwd ? key.slice(4) : key;
    await prisma.catCutoff.upsert({
      where: {
        admissionCycleId_category_pwd: {
          admissionCycleId: cycle.id,
          category,
          pwd,
        },
      },
      update: { ...cutoff, ...metadata("catCutoffs") },
      create: {
        admissionCycleId: cycle.id,
        category,
        pwd,
        ...cutoff,
        ...metadata("catCutoffs"),
      },
    });
  }

  await prisma.academicRatingRule.upsert({
    where: {
      admissionCycleId_component_appliesTo: {
        admissionCycleId: cycle.id,
        component: "CLASS_10",
        appliesTo: "ALL",
      },
    },
    update: { bands: jsonSafe(policy.class10Bands), maxScore: 10, ...metadata("applicationRating") },
    create: {
      admissionCycleId: cycle.id,
      component: "CLASS_10",
      appliesTo: "ALL",
      bands: jsonSafe(policy.class10Bands),
      maxScore: 10,
      ...metadata("applicationRating"),
    },
  });

  for (const [stream, bands] of Object.entries(policy.class12Bands)) {
    await prisma.class12RatingRule.upsert({
      where: { admissionCycleId_stream: { admissionCycleId: cycle.id, stream } },
      update: { bands: jsonSafe(bands), ...metadata("applicationRating") },
      create: { admissionCycleId: cycle.id, stream, bands: jsonSafe(bands), ...metadata("applicationRating") },
    });
  }

  for (const [academicCategory, bands] of Object.entries(policy.bachelorBands)) {
    await prisma.bachelorRatingRule.upsert({
      where: {
        admissionCycleId_academicCategory: { admissionCycleId: cycle.id, academicCategory },
      },
      update: { bands: jsonSafe(bands), ...metadata("applicationRating") },
      create: {
        admissionCycleId: cycle.id,
        academicCategory,
        bands: jsonSafe(bands),
        ...metadata("applicationRating"),
      },
    });
    const categoryRecord = await prisma.academicCategory.upsert({
      where: { admissionCycleId_code: { admissionCycleId: cycle.id, code: academicCategory } },
      update: {
        label: ACADEMIC_CATEGORY_LABELS[academicCategory as keyof typeof ACADEMIC_CATEGORY_LABELS],
        description: ACADEMIC_CATEGORY_LABELS[academicCategory as keyof typeof ACADEMIC_CATEGORY_LABELS],
        ...metadata("applicationRating"),
      },
      create: {
        admissionCycleId: cycle.id,
        code: academicCategory,
        label: ACADEMIC_CATEGORY_LABELS[academicCategory as keyof typeof ACADEMIC_CATEGORY_LABELS],
        description: ACADEMIC_CATEGORY_LABELS[academicCategory as keyof typeof ACADEMIC_CATEGORY_LABELS],
        ...metadata("applicationRating"),
      },
    });
    const examples: Record<string, string[]> = {
      AC_1_PART_I: ["MBBS", "MD (USA)"],
      AC_1_PART_II: ["BAMS", "BDS", "BHMS"],
      AC_2: ["Chartered Accountancy", "Company Secretary", "CMA"],
      AC_3: ["B.Com", "BBA", "BA Economics"],
      AC_4: ["B.Tech", "B.E.", "B.Sc", "B.Arch"],
      AC_5: ["BA Humanities", "LLB", "B.Des"],
      AC_6: ["Other discipline"],
    };
    for (const degreeName of examples[academicCategory] ?? []) {
      const normalizedName = degreeName.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      await prisma.degreeMapping.upsert({
        where: {
          academicCategoryId_normalizedName: {
            academicCategoryId: categoryRecord.id,
            normalizedName,
          },
        },
        update: { degreeName, active: true },
        create: {
          academicCategoryId: categoryRecord.id,
          degreeName,
          normalizedName,
          aliases: [],
        },
      });
    }
  }

  for (const [stream, groups] of Object.entries(policy.c2Thresholds)) {
    for (const [candidateGroup, threshold] of Object.entries(groups)) {
      await prisma.academicConsistencyRule.upsert({
        where: {
          admissionCycleId_stream_candidateGroup: {
            admissionCycleId: cycle.id,
            stream,
            candidateGroup,
          },
        },
        update: { threshold, ...metadata("c2") },
        create: {
          admissionCycleId: cycle.id,
          stream,
          candidateGroup,
          threshold,
          ...metadata("c2"),
        },
      });
    }
  }

  for (const [key, minimumCs] of Object.entries(policy.stage1ObservedThresholds)) {
    const [categoryGroup, academicCategory] = key.split("|");
    await prisma.stage1Threshold.upsert({
      where: {
        admissionCycleId_categoryGroup_academicCategory: {
          admissionCycleId: cycle.id,
          categoryGroup,
          academicCategory,
        },
      },
      update: { minimumCs, ...metadata("stage1Thresholds") },
      create: {
        admissionCycleId: cycle.id,
        categoryGroup,
        academicCategory,
        minimumCs,
        ...metadata("stage1Thresholds"),
      },
    });
  }

  for (const [academicGroup, limits] of Object.entries(policy.stage1UpperLimits)) {
    for (const [categoryGroup, upperLimit] of Object.entries(limits)) {
      await prisma.stage1Rule.upsert({
        where: {
          admissionCycleId_route_academicGroup_categoryGroup: {
            admissionCycleId: cycle.id,
            route: "ACRC",
            academicGroup,
            categoryGroup,
          },
        },
        update: {
          upperLimit,
          topPercent: 5,
          criteria: jsonSafe(["C1", "C2", "C3"]),
          ...metadata("stage1Rules"),
        },
        create: {
          admissionCycleId: cycle.id,
          route: "ACRC",
          academicGroup,
          categoryGroup,
          upperLimit,
          topPercent: 5,
          criteria: jsonSafe(["C1", "C2", "C3"]),
          ...metadata("stage1Rules"),
        },
      });
    }
  }
  await prisma.stage1Rule.upsert({
    where: {
      admissionCycleId_route_academicGroup_categoryGroup: {
        admissionCycleId: cycle.id,
        route: "SMALL_AC",
        academicGroup: "SMALL_AC",
        categoryGroup: "ALL",
      },
    },
    update: {
      upperLimit: 100,
      topPercent: 5,
      criteria: jsonSafe(["C4", "C5", "C6"]),
      ...metadata("stage1Rules"),
    },
    create: {
      admissionCycleId: cycle.id,
      route: "SMALL_AC",
      academicGroup: "SMALL_AC",
      categoryGroup: "ALL",
      upperLimit: 100,
      topPercent: 5,
      criteria: jsonSafe(["C4", "C5", "C6"]),
      ...metadata("stage1Rules"),
    },
  });

  for (const [categoryGroup, minimumCs] of Object.entries(policy.stage2Thresholds)) {
    await prisma.stage2Threshold.upsert({
      where: { admissionCycleId_categoryGroup: { admissionCycleId: cycle.id, categoryGroup } },
      update: { minimumCs, ...metadata("stage2Thresholds") },
      create: {
        admissionCycleId: cycle.id,
        categoryGroup,
        minimumCs,
        ...metadata("stage2Thresholds"),
      },
    });
  }

  for (const [categoryGroup, series] of Object.entries(policy.historicalFinalBenchmarkSeries)) {
    for (const point of series) {
      const pointMetadata = {
        effectiveYear: point.effectiveYear,
        source: point.source,
        sourceType: point.sourceType as SourceType,
        verifiedDate: new Date(`${point.verifiedDate}T00:00:00Z`),
        notes: point.notes,
      };
      await prisma.historicalFinalBenchmark.upsert({
        where: {
          admissionCycleId_categoryGroup_benchmarkCycle: {
            admissionCycleId: cycle.id,
            categoryGroup,
            benchmarkCycle: point.batch,
          },
        },
        update: {
          benchmark: point.benchmark,
          offerCount: point.offerCount,
          waitlistMovement: point.waitlistMovement,
          ...pointMetadata,
        },
        create: {
          admissionCycleId: cycle.id,
          categoryGroup,
          benchmarkCycle: point.batch,
          benchmark: point.benchmark,
          offerCount: point.offerCount,
          waitlistMovement: point.waitlistMovement,
          ...pointMetadata,
        },
      });
    }
  }

  await prisma.modelConfig.upsert({
    where: { admissionCycleId: cycle.id },
    update: {
      ...policy.model,
      benchmarkRecencyWeights: jsonSafe(policy.model.benchmarkRecencyWeights),
      probabilityBands: jsonSafe(policy.probabilityBands),
      ...metadata("probabilityModel"),
    },
    create: {
      admissionCycleId: cycle.id,
      ...policy.model,
      benchmarkRecencyWeights: jsonSafe(policy.model.benchmarkRecencyWeights),
      probabilityBands: jsonSafe(policy.probabilityBands),
      ...metadata("probabilityModel"),
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
