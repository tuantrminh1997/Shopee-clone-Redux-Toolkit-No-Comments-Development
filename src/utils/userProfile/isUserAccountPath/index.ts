const isUserAccountPath: (path: string) => boolean = (path: string) => {
	const regex = /^\/user\/account\/.*/;
	return regex.test(path);
};
export default isUserAccountPath;
