/**
 * Type system module exports
 */

export {
	autoGenerateTypes,
	generateConfigTypes,
	resetAutoGeneration,
} from './generator.js'

export {
	arrayToType,
	type ConsistencyValidationResult,
	collectPropertyValues,
	createUnionType,
	escapeStringLiteral,
	formatModuleDeclaration,
	generateInterfaceProperties,
	getConfigPaths,
	isPlainObject,
	validateConfigurationConsistency,
	valueToLiteralType,
} from './inference.js'
