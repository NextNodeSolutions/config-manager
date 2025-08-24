/**
 * Type system module exports
 */

export {
	generateConfigTypes,
	autoGenerateTypes,
	autoGenerateForUserProject,
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
