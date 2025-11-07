import { AxiosError } from 'axios';

/**
 * Extracts meaningful error message from axios error response
 * @param error - The axios error object
 * @param defaultMessage - Default message to show if no specific error is found
 * @returns A user-friendly error message
 */
export const extractErrorMessage = (error: unknown, defaultMessage: string = "An error occurred"): string => {
  if (error instanceof AxiosError) {
    // Check if there's a response with error data
    if (error.response?.data) {
      const responseData = error.response.data;
      
      // Check for common error message fields
      if (typeof responseData === 'string') {
        return responseData;
      }
      
      if (typeof responseData === 'object') {
        // Check for message field
        if (responseData.message) {
          return responseData.message;
        }
        
        // Check for error field
        if (responseData.error) {
          return responseData.error;
        }
        
        // Check for errors array (validation errors)
        if (Array.isArray(responseData.errors) && responseData.errors.length > 0) {
          return responseData.errors
            .map((err: unknown) => {
                if (typeof err === "string") {
                    return err;
                }
              if (err && typeof err === "object" && "message" in err) {
                const message = (err as { message?: unknown }).message;
                return typeof message === "string" ? message : JSON.stringify(err);
              }
              return JSON.stringify(err);
            })
            .join(', ');
        }
        
        // Check for specific field errors
        const fieldErrors = Object.entries(responseData)
          .filter(([key, value]) => key !== 'status' && key !== 'statusCode' && value)
          .map(([key, value]) => {
            if (typeof value === 'string') {
              return `${key}: ${value}`;
            }
            if (Array.isArray(value)) {
              return `${key}: ${value.join(', ')}`;
            }
            return `${key}: ${JSON.stringify(value)}`;
          });
        
        if (fieldErrors.length > 0) {
          return fieldErrors.join('; ');
        }
      }
    }
    
    // Check for HTTP status specific messages
    switch (error.response?.status) {
      case 400:
        return "Invalid request data";
      case 401:
        return "Unauthorized access";
      case 403:
        return "Access forbidden";
      case 404:
        return "Resource not found";
      case 409:
        // Check for specific conflict messages from the API
        if (error.response.data?.error) {
          return error.response.data.error;
        }
        return "Conflict with existing data";
      case 422:
        return "Validation failed";
      case 500:
        return "Server error occurred";
      default:
        if (error.response?.status) {
          return `Request failed with status ${error.response.status}`;
        }
    }
  }
  
  // For non-axios errors
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
};

/**
 * Checks if the error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof AxiosError && !error.response;
};

/**
 * Checks if the error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 401;
};
