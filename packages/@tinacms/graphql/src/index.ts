import { buildASTSchema } from 'graphql'

import type {
  Schema,
  Collection,
  Template as TinaTemplate,
} from '@tinacms/schema-tools'

import { buildDotTinaFiles } from './build'
export { resolve } from './resolve'
export * from './resolver/error'
export { createDatabase } from './database'
export { TinaLevelClient } from './level/tinaLevel'
export type {
  QueryOptions,
  Database,
  OnDeleteCallback,
  OnPutCallback,
  CreateDatabase,
} from './database'
import type { Database } from './database'
import type { Config } from '@tinacms/schema-tools'

export { sequential, assertShape } from './util'
export { stringifyFile, parseFile } from './database/util'
export { createSchema } from './schema/createSchema'
export { buildDotTinaFiles }

export type DummyType = unknown

// TODO: Can we just remove this or rename buildDotFiles. Having a wrapper function is confusing.
export const buildSchema = async (config: Config, flags?: string[]) => {
  return buildDotTinaFiles({
    config,
    flags,
  })
}

export type TinaSchema = Schema
export type { TinaTemplate, Schema, Collection }

// Bridge exports
export {
  FilesystemBridge,
  AuditFileSystemBridge,
} from './database/bridge/filesystem'
export { IsomorphicBridge } from './database/bridge/isomorphic'
export type { Bridge } from './database/bridge'
