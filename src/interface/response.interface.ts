interface SendResponse {
    success: boolean;
    message?: string;
    data?: object;
    errorCode?: string;
}

const makeResponse = (success: boolean, message?: string, data?: object, errorCode?: string): SendResponse => {
    const response: SendResponse = {
        success,
        message,
        data,
        errorCode,
    };
    return response;
};

export default makeResponse;
