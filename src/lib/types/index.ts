/**
 * Type system module exports
 */

export {
	generateConfigTypes,
	autoGenerateTypes,
	resetAutoGeneration,
} from './generator.js'

export {
	isPlainObject,
	escapeStringLiteral,
	valueToLiteralType,
	arrayToType,
	createUnionType,
	collectPropertyValues,
	getConfigPaths,
	validateConfigurationConsistency,
	generateInterfaceProperties,
	formatModuleDeclaration,
	type ConsistencyValidationResult,
} from './inference.js'
