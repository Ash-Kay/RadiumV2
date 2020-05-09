interface SendResponse {
    success: boolean;
    message?: string;
    data?: object;
    errorCode?: string;
}

interface SendPaginationResponse extends SendResponse {
    previousPage?: string;
    nextPage?: string;
}

export const makeResponse = (success: boolean, message?: string, data?: object, errorCode?: string): SendResponse => {
    const response: SendResponse = {
        success,
        message,
        data,
        errorCode,
    };
    return response;
};

export const makePaginationResponse = (
    success: boolean,
    message?: string,
    previousPage?: string,
    nextPage?: string,
    data?: object,
    errorCode?: string
): SendPaginationResponse => {
    const response: SendPaginationResponse = {
        success,
        message,
        previousPage,
        nextPage,
        data,
        errorCode,
    };
    return response;
};
