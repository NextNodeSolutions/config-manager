import {
	DEFAULT_LOCALE,
	DEFAULT_DATE_FORMAT_OPTIONS,
} from '../config/definitions/constants'

/**
 * Formats a date into a localized string
 * @param date - The date to format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
	date: Date | string | number,
	locale: string = DEFAULT_LOCALE,
	options: Intl.DateTimeFormatOptions = DEFAULT_DATE_FORMAT_OPTIONS,
): string {
	const dateObj = new Date(date)
	return new Intl.DateTimeFormat(locale, options).format(dateObj)
}
