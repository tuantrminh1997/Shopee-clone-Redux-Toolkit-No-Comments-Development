interface CanceledError {
	code: "ERR_CANCELED";
	message: "Canceled";
	name: "CanceledError";
}

export default function isCanceledError(error: unknown): error is CanceledError {
	return (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		error.code === "ERR_CANCELED" &&
		"message" in error &&
		error.message === "canceled" &&
		"name" in error &&
		error.name === "CanceledError"
	);
}
