import { LogEntry } from './types';
import { applyTransforms, parseTransformOption, TransformFn } from './transform';
import { applyMaskRules, parseMaskOption, MaskRule } from './mask';

export interface TransformPipelineOptions {
  transforms?: string[];
  masks?: string[];
}

export interface TransformPipeline {
  transformFns: TransformFn[];
  maskRules: MaskRule[];
}

export function buildTransformPipeline(
  opts: TransformPipelineOptions
): TransformPipeline {
  const transformFns = (opts.transforms ?? []).map(parseTransformOption);
  const maskRules = (opts.masks ?? []).map(parseMaskOption);
  return { transformFns, maskRules };
}

export function runTransformPipeline(
  entries: LogEntry[],
  pipeline: TransformPipeline
): LogEntry[] {
  let result = entries;
  if (pipeline.transformFns.length > 0) {
    result = applyTransforms(result, pipeline.transformFns);
  }
  if (pipeline.maskRules.length > 0) {
    result = applyMaskRules(result, pipeline.maskRules);
  }
  return result;
}
