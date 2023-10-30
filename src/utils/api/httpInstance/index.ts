/* eslint-disable @typescript-eslint/no-explicit-any */
// axios
import axios, { AxiosResponse, AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
// react toastify:
import { toast } from "react-toastify";
// types:
import { RefreshTokenResponseType, AuthenticationSuccessResponse, User, ErrorResponseApi } from "src/types";
// utils authentication:
import {
	// access token
	saveAccessTokenToLocalStorage,
	clearAccessTokenFromLocalStorage,
	getAccessTokenFromLocalStorage,
	// user profile
	saveUserProfileToLocalStorage,
	clearUserProfileFromLocalStorage,
	// refresh_token:
	saveRefreshTokenToLocalStorage,
	clearRefreshTokenFromLocalStorage,
	getRefreshTokenFromLocalStorage,
	// event target, event message clear local storage:
	clearLocalStorageEventTarget,
	clearAccessTokenUserProfileEvent,
	// type predicate:
	isAxiosUnauthorizedError,
	isNotUnprocessableEntityError,
	isAxiosExpiredTokenError,
	isCanceledError,
} from "src/utils";
// paths constants:
import {
	paths,
	// API URLs
	loginPathURL,
	registerPathURL,
	refreshTokenPathURL,
	logoutPathURL,
} from "src/constants";

class Http {
	instance: AxiosInstance;
	private accessToken: string;
	private refreshToken: string;
	private refreshTokenRequest: Promise<string> | null;
	private async handleRefreshTokenAutomatically() {
		try {
			const response = await this.instance.post<RefreshTokenResponseType>(refreshTokenPathURL, {
				refresh_token: this.refreshToken as string,
			});
			const { access_token: accessToken } = (response as AxiosResponse<RefreshTokenResponseType>).data.data as {
				access_token: string;
			};
			saveRefreshTokenToLocalStorage(accessToken as string);
			this.accessToken = accessToken as string;
			return accessToken as string;
		} catch (error) {
			this.accessToken = "";
			this.refreshToken = "";
			clearAccessTokenFromLocalStorage();
			clearUserProfileFromLocalStorage();
			clearRefreshTokenFromLocalStorage();
		}
	}
	constructor() {
		this.accessToken = getAccessTokenFromLocalStorage();
		this.refreshToken = getRefreshTokenFromLocalStorage();
		this.refreshTokenRequest = null;
		this.instance = axios.create({
			baseURL: paths.baseURL,
			timeout: 15000,
			headers: {
				"Content-Type": "application/json",
				"expire-access-token": 60 * 5,
				"expire-refresh-token": 60 * 60,
			},
		});
		this.instance.interceptors.request.use(
			(successRequest) => {
				if (this.accessToken && successRequest.headers) {
					successRequest.headers.authorization = this.accessToken;
					return successRequest;
				}
				return successRequest;
			},
			(errorRequest) => {
				return Promise.reject(errorRequest);
			},
		);
		this.instance.interceptors.response.use(
			(successResponse) => {
				const { url } = successResponse.config;
				if (url === loginPathURL || url === registerPathURL) {
					const data: AuthenticationSuccessResponse | User = successResponse.data;
					this.accessToken = (successResponse.data as AuthenticationSuccessResponse).data.access_token;
					this.refreshToken = (successResponse.data as AuthenticationSuccessResponse).data.refresh_token;
					saveAccessTokenToLocalStorage(this.accessToken as string);
					saveRefreshTokenToLocalStorage(this.refreshToken as string);
					saveUserProfileToLocalStorage(data as User);
				} else if (url === logoutPathURL) {
					this.accessToken = "";
					this.refreshToken = "";
					clearAccessTokenFromLocalStorage();
					clearUserProfileFromLocalStorage();
					clearRefreshTokenFromLocalStorage();
				}
				return successResponse;
			},
			(errorResponse: AxiosError) => {
				if (isNotUnprocessableEntityError(errorResponse) && !isAxiosUnauthorizedError(errorResponse) && !isCanceledError(errorResponse)) {
					const errorData: any | undefined | null = (errorResponse as AxiosError<unknown, any>).response?.data;
					const errorMessage = errorData?.message || (errorResponse as AxiosError<unknown, any>).message;
					toast.error(errorMessage);
				}
				if (isAxiosUnauthorizedError<ErrorResponseApi<{ name: string; message: string }>>(errorResponse)) {
					const errorResponseConfig = errorResponse.response?.config;
					const { url } = errorResponseConfig as InternalAxiosRequestConfig<any>;
					if (isAxiosExpiredTokenError<AxiosError<AxiosError<unknown, any>, any>>(errorResponse) && url !== refreshTokenPathURL) {
						this.refreshTokenRequest =
							this.refreshTokenRequest !== null
								? this.refreshTokenRequest
								: (this.handleRefreshTokenAutomatically().finally(() => {
										setTimeout(() => {
											this.refreshTokenRequest = null;
										}, 10000);
								  }) as Promise<string> | null);
						return this.refreshTokenRequest?.then((new_access_token) => {
							return this.instance({
								...errorResponseConfig,
								headers: {
									...(errorResponseConfig as InternalAxiosRequestConfig<any>).headers,
									Authorization: new_access_token,
								},
							});
						});
					}
					clearAccessTokenFromLocalStorage();
					clearUserProfileFromLocalStorage();
					this.accessToken = "";
					this.refreshToken = "";
					toast.error(
						((errorResponse.response?.data as ErrorResponseApi<{ name: string; message: string }>).data?.message as string) ||
							(errorResponse.response?.data.message as string),
					);
					clearLocalStorageEventTarget.dispatchEvent(clearAccessTokenUserProfileEvent);
				}
				return Promise.reject(errorResponse);
			},
		);
	}
}
const httpInstance = new Http().instance;
export default httpInstance;
