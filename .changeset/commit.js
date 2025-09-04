/**
 * Custom commit message generator for Changesets
 * Generates conventional commit formatted messages
 */

/**
 * Generate commit message for adding changesets
 * @param {Object} changeset - The changeset object
 * @param {Object} options - Additional options
 * @returns {Promise<string>} The commit message
 */
const getAddMessage = async (changeset, options) => {
	const skipCI = options?.skipCI === 'add' || options?.skipCI === true
	const suffix = skipCI ? '\n\n[skip ci]' : ''

	return `docs(changeset): add changeset for ${changeset.summary}${suffix}`
}

/**
 * Generate commit message for version releases
 * @param {Object} releasePlan - The release plan object
 * @param {Object} options - Additional options
 * @returns {Promise<string>} The commit message
 */
const getVersionMessage = async (releasePlan, options) => {
	const skipCI = options?.skipCI === 'version' || options?.skipCI === true
	const publishableReleases = releasePlan.releases.filter(
		release => release.type !== 'none',
	)
	const release = publishableReleases[0]

	const message = `chore: version ${release.newVersion}`
	const suffix = skipCI ? '\n\n[skip ci]' : ''
	return `${message}${suffix}`
}

export { getAddMessage, getVersionMessage }
