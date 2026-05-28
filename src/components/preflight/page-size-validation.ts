import { getExpectedManuscriptSize } from '@/lib/kdp/kdp-rules';

export interface PageSizeValidationInput {
  readonly actualWidthIn: number

  readonly actualHeightIn: number
  readonly selectedTrimWidthIn: number
  readonly selectedTrimHeightIn: number
  readonly bleedEnabled: boolean
  readonly toleranceIn?: number
}

export interface PageSizeValidationResult {
  readonly ok: boolean
  readonly expectedWidthIn: number
  readonly expectedHeightIn: number
  readonly diffWidthIn: number
  readonly diffHeightIn: number
  readonly maxDiffIn: number
}

export interface ValidationConfigHashInput {
  readonly bookType: string | null | undefined
  readonly trimWidthIn: number | null | undefined
  readonly trimHeightIn: number | null | undefined
  readonly bleedEnabled: boolean
  readonly interiorType: string | null | undefined
  readonly paperType: string | null | undefined
  readonly pageCount: number | null | undefined
  readonly bindingType?: string | null | undefined
  readonly coverType?: string | null | undefined
}

function stableConfigString(value: Record<string, unknown>): string {
  return JSON.stringify(
    Object.keys(value)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = value[key]
        return acc
      }, {}),
  )
}

export function createValidationConfigHash(input: ValidationConfigHashInput): string {
  const normalized = stableConfigString({
    bookType: input.bookType ?? null,
    trimWidthIn: Number(input.trimWidthIn ?? 0),
    trimHeightIn: Number(input.trimHeightIn ?? 0),
    bleedEnabled: input.bleedEnabled,
    interiorType: input.interiorType ?? null,
    paperType: input.paperType ?? null,
    pageCount: Number(input.pageCount ?? 0),
    bindingType: input.bindingType ?? null,
    coverType: input.coverType ?? null,
  })

  let hash = 5381
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) + hash) ^ normalized.charCodeAt(i)
  }
  return (hash >>> 0).toString(36)
}

export function validatePageSizeAgainstConfig({
  actualWidthIn,
  actualHeightIn,
  selectedTrimWidthIn,
  selectedTrimHeightIn,
  bleedEnabled,
  toleranceIn = 0.02,
}: PageSizeValidationInput): PageSizeValidationResult {
  // Use shared KDP bleed formula: width +0.125", height +0.25"
  // Source: src/lib/kdp/kdp-rules.ts — getExpectedManuscriptSize()
  // Source: https://kdp.amazon.com/help/topic/GVBQ3CMEQW3W2VL6
  const { widthIn: expectedWidthIn, heightIn: expectedHeightIn } = getExpectedManuscriptSize(
    selectedTrimWidthIn,
    selectedTrimHeightIn,
    bleedEnabled ? 'bleed' : 'no-bleed',
  );
  const diffWidthIn = Math.abs(actualWidthIn - expectedWidthIn)
  const diffHeightIn = Math.abs(actualHeightIn - expectedHeightIn)
  const maxDiffIn = Math.max(diffWidthIn, diffHeightIn)

  return {
    ok: maxDiffIn <= toleranceIn,
    expectedWidthIn,
    expectedHeightIn,
    diffWidthIn,
    diffHeightIn,
    maxDiffIn,
  }
}
